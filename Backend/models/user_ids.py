from pydantic import BaseModel
from typing import List

class UserIds(BaseModel):
    user_ids: List[int]
