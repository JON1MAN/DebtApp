from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db_configuration import get_db
from models.debts import Debt
from sqlalchemy import func

from models.user import get_current_user

router = APIRouter()

@router.get("/debts", tags=["Debts"])
def get_all_debts(db: Session = Depends(get_db)):
    debts = db.query(Debt).all()
    return {"debts": debts}

@router.post("/debts", tags=["Debts"])
def create_debt(title: str, receiver: str, amount: float, user_id: int, db: Session = Depends(get_db)):
    new_debt = Debt(title=title, receiver=receiver, amount=amount, user_id=user_id)
    db.add(new_debt)
    db.commit()
    db.refresh(new_debt)
    return {"message": "Debt created", "debt": new_debt}

@router.delete("/debts/{debt_id}", tags=["Debts"])
def delete_debt(debt_id: int, db: Session = Depends(get_db)):
    debt = db.query(Debt).filter(Debt.id == debt_id).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    db.delete(debt)
    db.commit()
    return {"message": "Debt deleted"}

@router.get("/my_debts/sum", tags=["Debts"])  # Nowa trasa do sumowania długów
def get_sum_of_my_debts(db: Session = Depends(get_db)):
    user = get_current_user()
    user_id = user.id
    total_debt = user.getSumOfUserDebts(db)
    return {"total_debt": total_debt or 0.0}  # Zwraca 0.0, jeśli nie ma długów

