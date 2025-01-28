from typing import Generic, Sequence, TypeVar

from pydantic import AliasGenerator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

PaginatedSchemaType = TypeVar("PaginatedSchemaType")


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            validation_alias=to_camel,
            serialization_alias=to_camel,
        ),
        populate_by_name=True,
        extra="forbid",
    )


class PaginatedSchema(BaseSchema, Generic[PaginatedSchemaType]):
    docs: Sequence[PaginatedSchemaType]
    total_docs: int
    total_pages: int
    has_next_page: bool