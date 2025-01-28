from sqlalchemy import Column, Integer, String, Float

from config.db_configuration import Base
from requests import Session

class Debt(Base):
    __tablename__='debts'
    
    id=Column(Integer, primary_key=True, index=True, autoincrement=True)
    title=Column(String(100))
    receiver=Column(String(50))
    amount=Column(Float)
    user_id=Column(Integer)

    def createDebt(db: Session, title: str, receiver: str, amount: float, user_id: int) -> 'Debt':
        """Creates a new debt and saves it to the database."""
        new_debt = Debt(title=title, receiver=receiver, amount=amount, user_id=user_id)
        db.add(new_debt)
        db.commit()
        db.refresh(new_debt)
        return new_debt

    @staticmethod
    def findAllDebts(db: Session) -> list:
        """Finds and returns all debts."""
        return db.query(Debt).all()

    @staticmethod
    def findDebtById(db: Session, debt_id: int) -> 'Debt':
        """Finds a debt by its ID."""
        debt = db.query(Debt).filter(Debt.id == debt_id).first()
        if not debt:
            raise ValueError(f"Debt with ID {debt_id} does not exist")
        return debt

    def deleteUserDebtById(db: Session, debt_id: int) -> None:
        debt = db.query(Debt).filter(Debt.id == debt_id).first()
        if not debt:
            raise ValueError(f"Debt with ID {debt_id} does not exist")

        db.delete(debt)
        db.commit()