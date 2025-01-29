from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db_configuration import get_db
from models.expense_request import ExpenseRequest
from models.user import User, get_current_user
from models.group import Group
from models.debts import Debt
from typing import List, Dict

from models.user_ids import UserIds
from schemas.debt_response import DebtResponse
from schemas.debt_split_request import DebtSplitRequest

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


@router.post("/split-debts/", response_model=List[DebtResponse])
def split_debts(request: DebtSplitRequest, db: Session = Depends(get_db)):
    costs = request.costs
    payments = request.payments

    num_users = len(payments)
    if num_users == 0:
        raise HTTPException(status_code=400, detail="No users provided.")

    fair_share = costs / num_users

    # Compute net balances
    balances = {}
    for user_id, paid in payments.items():
        balances[user_id] = round(paid - fair_share, 2)  # Rounded to 2 decimal places

    # Separate into creditors and debtors
    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        if balance > 0:
            creditors.append({"user_id": user_id, "balance": balance})
        elif balance < 0:
            debtors.append({"user_id": user_id, "balance": -balance})  # Store as positive value

    # Sort creditors and debtors
    creditors.sort(key=lambda x: x["balance"], reverse=True)  # Largest creditor first
    debtors.sort(key=lambda x: x["balance"], reverse=True)  # Largest debtor first

    debts_response = []

    i = 0  # Index for debtors
    j = 0  # Index for creditors

    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]

        debt_amount = min(debtor["balance"], creditor["balance"])

        # Create Debt record
        debt_record = Debt(
            title=f"Debt from User {debtor['user_id']} to User {creditor['user_id']}",
            receiver_id=creditor['user_id'],
            amount=debt_amount,
            user_id=debtor['user_id']
        )
        db.add(debt_record)
        db.commit()
        db.refresh(debt_record)

        # Append to response
        debts_response.append(DebtResponse(
            debtor=debtor["user_id"],
            creditor=creditor["user_id"],
            amount=debt_amount
        ))

        # Update balances
        debtors[i]["balance"] -= debt_amount
        creditors[j]["balance"] -= debt_amount

        # Move to next debtor or creditor if settled
        if debtors[i]["balance"] == 0:
            i += 1
        if creditors[j]["balance"] == 0:
            j += 1

    return debts_response