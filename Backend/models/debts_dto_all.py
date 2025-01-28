from pydantic import BaseModel
from typing import List, Dict

class DebtBaseDTO(BaseModel):
    total_sum: float
    debts: List[Debt]

