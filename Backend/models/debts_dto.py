from typing import Dict, List
from pydantic import BaseModel
from models.debts import Debt

class MyDebtsDTO(BaseModel):
    debts: List[Debt]
    total_sum: float