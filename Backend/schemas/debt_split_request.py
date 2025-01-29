from typing import Dict, List
from pydantic import BaseModel
from models.debts import Debt

class DebtSplitRequest(BaseModel):
    costs: float
    payments: Dict[int, float]
