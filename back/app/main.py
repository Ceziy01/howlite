from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import traceback, sys

from app.core.database import engine, SessionLocal
from app.core.init_db import init_database
from app.api import auth
from app.api import workspaces

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    db = SessionLocal()
    try: pass
    finally: db.close()
    yield
    
app = FastAPI(lifespan=lifespan)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("=== UNHANDLED EXCEPTION ===", file=sys.stderr)
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(workspaces.router, prefix="/api")