from pydantic import BaseModel, Field

class DebtResponse(BaseModel):
    debtor: int = Field(..., example=3)
    creditor: int = Field(..., example=1)
    amount: float = Field(..., example=50.0)

    model_config = {
        "orm_mode": False  # Explicitly disable ORM mode
    }