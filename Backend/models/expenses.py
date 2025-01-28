from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from config.db_configuration import Base

# Association table between Expense and User
expense_participants = Table(
    'expense_participants',
    Base.metadata,
    Column('expense_id', Integer, ForeignKey('expenses.id'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    payer_id = Column(Integer, ForeignKey('users.id'))
    group_id = Column(Integer, ForeignKey('groups.id'))
    participants = relationship('User', secondary='expense_participants', back_populates='expenses')
    group = relationship('Group', back_populates='expenses')