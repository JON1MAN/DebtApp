from pydantic import BaseModel

class DebtSummary(BaseModel):
    user_id: int
    total_debt: float
