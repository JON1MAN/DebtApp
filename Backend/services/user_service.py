from typing import Sequence, Optional, List, Type

from sqlalchemy.orm import Session
from models.user import User
from schemas.user_schema import UserSignUpSchema


async def get_users(db: Session) -> List[Type[User]]:
    return (db.query(User)
            .all())

async def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()

    return user

async def get_user_by_username(db: Session, username: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()

    return user


async def get_user_by_email(db: Session, user_email: str) -> Optional[User]:
    user = db.query(User).filter(User.email == user_email).first()
    return user

async def create_user(
        db: Session,
        user_data: UserSignUpSchema,
        commit_and_refresh: bool = True) -> User:

    ##here we need to declare smth like password_hash: str = and call hash function to encrypt password
    new_user = User()
    new_user.username = user_data.username
    new_user.email = user_data.email
    new_user.password = user_data.password ## here pass password_hash variable

    db.add(new_user)

    if commit_and_refresh:
        db.commit()
        db.refresh(new_user)

    return new_user

#async def update_user(
#        db: Session,
#        user_id: int,
#        user_data: UserSignUpSchema,
#        commit_and_refresh: bool = True) -> Optional[User]:
#    existing_user = await get_user_by_id(db, user_id)

#    if not existing_user:
#        return None

#    if user_data.username is not None:
#        existing_user.username = user_data.username
#    if user_data.email is not None:
#        existing_user.email = user_data.email
#    if user_data.password is not None:
#        ##here we need to declare smth like password_hash: str = and call hash function to encrypt password
#        existing_user.password = user_data.password ## here pass password_hash variable
#    if user_data.first_name is not None:
#        existing_user.first_name = user_data.first_name
#    if user_data.last_name is not None:
#        existing_user.last_name = user_data.last_name

#    if commit_and_refresh:
#        db.commit()
#        db.refresh(existing_user)

#    return existing_user