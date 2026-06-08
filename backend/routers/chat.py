from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.store import store
from services.analysis import get_dataset_summary
from services.gemini import ask_about_data

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/chat")
def chat(request: ChatRequest):
    if not store.has_data():
        return {
            "reply": "Hey there! I'm Rabbitt 🐇 — please upload a dataset first so I can help you analyze it!"
        }

    df = store.get()
    summary = get_dataset_summary(df)
    reply = ask_about_data(request.message, summary)
    return {"reply": reply}
