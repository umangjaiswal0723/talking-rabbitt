from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers import upload, analysis, chat, forecast
import os

app = FastAPI(title="Talking Rabbitt API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(forecast.router, prefix="/api", tags=["Forecast"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Talking Rabbitt API"}

# Serve React frontend
DIST = os.path.join(os.path.dirname(__file__), "../frontend/dist")

if os.path.exists(DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(DIST, "index.html"))
