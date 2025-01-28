from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db_configuration import get_db
from models.expense_request import ExpenseRequest
from models.user import User, get_current_user
from models.group import Group
from models.debts import Debt
from models.expenses import Expense
from typing import List, Dict

from models.user_ids import UserIds

router = APIRouter()

@router.post("/groups", tags=["Groups"])
def create_group(name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new group and add only the currently logged-in user to it.
    """
    # Check if a group with the same name exists (optional validation)
    existing_group = db.query(Group).filter(Group.name == name).first()
    if existing_group:
        raise HTTPException(status_code=400, detail="A group with this name already exists.")

    # Create the group and add the current user as a member
    group = Group(name=name)
    group.users.append(current_user)  # Add the logged-in user
    db.add(group)
    db.commit()
    db.refresh(group)
    return {"message": "Group created", "group": group}


@router.post("/groups/{group_id}/add_users", tags=["Groups"])
def add_users_to_group(group_id: int,
                       user_ids: UserIds,  # Use the Pydantic model
                       db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    users = db.query(User).filter(User.id.in_(user_ids.user_ids)).all()
    group.users.extend(users)
    db.commit()
    return {"message": "Users added to group", "group": group}


@router.post("/groups/{group_id}/expenses", tags=["Expenses"])
def add_expense(
    group_id: int,
    expense_data: ExpenseRequest,  # Use Pydantic model for the request body
    db: Session = Depends(get_db)
):
    """
    Add a party expense:
    - Total cost of the party.
    - List of payers with their contributions.
    - List of participants who didn't pay.
    """
    # Extract data from the request model
    total_cost = expense_data.total_cost
    payers = expense_data.payers
    participants = expense_data.participants

    # Validate group existence
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # Validate payers and participants
    payer_ids = [payer["user_id"] for payer in payers]
    all_user_ids = set(payer_ids + participants)
    users = db.query(User).filter(User.id.in_(all_user_ids)).all()
    if len(users) != len(all_user_ids):
        raise HTTPException(status_code=400, detail="Some users are not part of the group.")

    # Set payer_id as the first payer in the list (if payers list is not empty)
    primary_payer_id = payers[0]["user_id"] if payers else None
    if primary_payer_id is None:
        raise HTTPException(status_code=400, detail="At least one payer must be specified.")

    # Create the expense entry
    expense = Expense(amount=total_cost, group_id=group_id, payer_id=primary_payer_id)
    db.add(expense)
    db.flush()  # Generate the expense ID for relationships

    # Associate payers and their contributions
    for payer in payers:
        payer_user = db.query(User).filter(User.id == payer["user_id"]).first()
        if not payer_user:
            raise HTTPException(status_code=400, detail=f"Payer with ID {payer['user_id']} not found.")
        expense.participants.append(payer_user)  # Add as a participant
        payer_user.paid_amount = payer.get("amount", 0.0)  # Store amount paid for this party

    # Add participants who haven't paid anything
    for participant_id in participants:
        participant = db.query(User).filter(User.id == participant_id).first()
        if not participant:
            raise HTTPException(status_code=400, detail=f"Participant with ID {participant_id} not found.")
        expense.participants.append(participant)

    # Save the changes
    db.commit()
    db.refresh(expense)
    return {"message": "Expense added", "expense": expense}


@router.get("/groups/{group_id}/calculate_debts", tags=["Debts"])
def calculate_debts(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")

    # Step 1: Initialize variables
    participants = {
        user.id: {"username": user.username, "paid": 0, "share": 0, "net_balance": 0, "remaining_to_party": 0} for user
        in group.users}

    # Step 2: Distribute total cost among participants
    total_cost = sum(expense.amount for expense in group.expenses)
    total_participants = len(participants)
    if total_participants == 0:
        raise HTTPException(status_code=400, detail="No participants in the group.")

    share_per_person = total_cost / total_participants
    for user_id in participants:
        participants[user_id]["share"] = share_per_person

    # Step 3: Update payments for payers
    for expense in group.expenses:
        if expense.payer_id and expense.payer_id in participants:
            participants[expense.payer_id]["paid"] += expense.amount

    # Step 4: Calculate net balances and remaining amounts
    total_overpaid = 0
    total_underpaid = 0
    debtors = []
    creditors = []

    for user_id, data in participants.items():
        data["net_balance"] = data["paid"] - data["share"]
        data["remaining_to_party"] = max(0, data["share"] - data["paid"])
        if data["net_balance"] > 0:
            creditors.append((user_id, data["net_balance"]))
            total_overpaid += data["net_balance"]
        elif data["net_balance"] < 0:
            debtors.append((user_id, -data["net_balance"]))
            total_underpaid += -data["net_balance"]

    # Ensure the party user exists in the database
    party_user = db.query(User).filter(User.username == "party").first()
    if not party_user:
        party_user = User(username="party", email="party@example.com", password="securepassword")
        db.add(party_user)
        db.commit()
        db.refresh(party_user)

    # Step 5: Determine repayments to overpayers
    repayments = []
    for debtor_id, debt in debtors:
        for creditor_id, credit in creditors:
            if debt <= 0:
                break
            settlement = min(debt, credit)
            repayments.append({
                "creditor": participants[creditor_id]["username"],
                "debtor": participants[debtor_id]["username"],
                "amount": settlement
            })

            # Create debt in the database
            Debt.createDebt(
                db=db,
                title=f"Debt to {participants[creditor_id]['username']}",
                receiver=participants[creditor_id]["username"],
                amount=settlement,
                user_id=debtor_id
            )

            debt -= settlement
            credit -= settlement
            creditors = [(c_id, c_credit) for c_id, c_credit in creditors if c_credit > 0]

    # Step 6: Add debts for remaining party costs
    for debtor_id, data in participants.items():
        if data["remaining_to_party"] > 0:
            repayments.append({
                "creditor": "party",
                "debtor": data["username"],
                "amount": data["remaining_to_party"]
            })

            # Create debt for the party in the database
            Debt.createDebt(
                db=db,
                title="Debt to party",
                receiver="party",
                amount=data["remaining_to_party"],
                user_id=debtor_id
            )

    return {
        "settlements": repayments,
        "participants": [
            {
                "username": data["username"],
                "paid": data["paid"],
                "share": data["share"],
                "net_balance": data["net_balance"],
                "remaining_to_party": data["remaining_to_party"]
            }
            for user_id, data in participants.items()
        ]
    }
