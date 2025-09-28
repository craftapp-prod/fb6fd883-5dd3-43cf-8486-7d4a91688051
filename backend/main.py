import subprocess
import time
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from api.v1.api import router as api_router
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import Base, engine

def auto_migrate():
    try:
        Base.metadata.create_all(bind=engine)
        
        result = subprocess.run([
            "alembic", "revision", "--autogenerate", 
            "-m", f"Auto migration {int(time.time())}"
        ], capture_output=True, text=True, cwd=".", timeout=60)
        
        if "No changes in schema detected" in result.stdout:
            return
        
        if result.returncode == 0:
            upgrade_result = subprocess.run([
                "alembic", "upgrade", "head"
            ], capture_output=True, text=True, cwd=".", timeout=60)
            
    except Exception:
        pass

auto_migrate()

app = FastAPI(title="Your API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "ok"}, status_code=200)

app.include_router(api_router, prefix="/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)