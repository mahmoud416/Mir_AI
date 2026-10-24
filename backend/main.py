"""
MIR Backend Root Entry Point
Allows running directly with:
    python -m uvicorn main:app --reload
    or
    python main.py
"""

import uvicorn
from app.main import app, create_app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
