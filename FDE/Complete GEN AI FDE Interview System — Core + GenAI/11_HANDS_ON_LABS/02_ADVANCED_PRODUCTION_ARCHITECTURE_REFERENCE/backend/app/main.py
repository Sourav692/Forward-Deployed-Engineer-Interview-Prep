from fastapi import FastAPI
from backend.api import health, chat, review, admin, evals, text_to_sql

app = FastAPI(title="GenAI FDE Production Lab", version="0.1.0")
app.include_router(health.router)
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(review.router, prefix="/review", tags=["review"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(evals.router, prefix="/evals", tags=["evals"])
app.include_router(text_to_sql.router, prefix="/text-to-sql", tags=["text-to-sql"])
