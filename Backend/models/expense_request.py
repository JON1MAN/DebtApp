from pydantic import BaseModel
from typing import List, Dict

class ExpenseRequest(BaseModel):
    total_cost: float
    payers: List[Dict[str, float]]  # List of {"user_id": int, "amount": float}
    participants: List[int]  # List of user IDs who haven't paid