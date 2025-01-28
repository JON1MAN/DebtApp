from fastapi.security import HTTPBasicCredentials
from pydantic import BaseModel, ConfigDict
from schemas import BaseSchema

class UserSignUpSchema(BaseSchema, HTTPBasicCredentials):
    username: str
    email: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "user.name",
                "email": "email",
                "password": "password",
            }
        }
    )

class UserLoginCredentialsSchema(BaseSchema, HTTPBasicCredentials):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "user.name",
                "password": "password"
            }
        }
    )

class UserSchema(BaseSchema):
    username: str
    email: str

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "username": "user.name",
                "email": "email",
            }
        },
    )