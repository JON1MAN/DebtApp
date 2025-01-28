from pydantic import BaseModel
from typing import List, Dict

from models.debts import Debt


class MyDebtsDTO(BaseModel):
    debts: List[Debt]
    total_sum: float