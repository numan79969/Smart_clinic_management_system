"""
Entry point – run from the backend/ directory:
    python main.py
"""
import subprocess
import sys
import os

# Ensure the backend directory is on sys.path so `app.*` imports resolve.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _backend_dir)

# Auto-install dependencies from requirements.txt before importing anything else.
_req_file = os.path.join(_backend_dir, "requirements.txt")
if os.path.exists(_req_file):
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "-r", _req_file, "--quiet"]
    )

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

