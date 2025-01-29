from requests import Session
from sqlalchemy import Column, Integer, String, func
from sqlalchemy.orm import relationship

from config.db_configuration import Base
from models.debts import Debt
from models.group import user_group_association
from utils.auth import hash_password, verify_password


from requests import Session
from fastapi import Depends, HTTPException
from config.db_configuration import get_db
from fastapi.security import OAuth2PasswordBearer
from utils.auth import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

from models.expenses import expense_participants

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)

    # Relationships
    groups = relationship('Group', secondary='user_group_association', back_populates='users')

    @staticmethod
    def getUserByUsername(db: Session, username: str):
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def getAllUsernames(db: Session):
        return [user.username for user in db.query(User).all()]

    @staticmethod
    def getSumOfUserDebts(db: Session) -> float:
        total_debt = db.query(func.sum(Debt.amount)).scalar()
        return total_debt if total_debt is not None else 0.0

    @staticmethod
    def getAllUserDebts(db: Session):
        results = (
            db.query(User.username, func.sum(Debt.amount).label("total_debt"))
            .join(Debt, Debt.user_id == User.id, isouter=True)
            .group_by(User.id)
            .all()
        )

        return [{"username": username, "total_debt": total_debt or 0.0} for username, total_debt in results]

    @staticmethod
    def create_user(db: Session, username: str, email: str, password: str):
        hashed_password = hash_password(password)
        new_user = User(username=username, email=email, password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str):
        user = db.query(User).filter(User.username == username).first()
        if user and verify_password(password, user.password):
            return user
        return None


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """
    Retrieve the currently authenticated user based on the JWT token.
    """
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = User.getUserByUsername(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user