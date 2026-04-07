"""
Entry point – run from the backend/ directory:
    python main.py
"""
import sys
import os

# Ensure the backend directory is on sys.path so `app.*` imports resolve.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
        use_colors=False,
    )

