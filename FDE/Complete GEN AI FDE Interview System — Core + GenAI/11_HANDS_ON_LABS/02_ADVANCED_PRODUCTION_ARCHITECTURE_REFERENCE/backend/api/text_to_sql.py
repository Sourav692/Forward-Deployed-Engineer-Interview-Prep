from fastapi import APIRouter
from pydantic import BaseModel
from backend.text_to_sql.query_validator import validate_sql
router=APIRouter()
class SQLRequest(BaseModel):
    sql: str
@router.post("/validate")
def validate(req: SQLRequest): return validate_sql(req.sql)
