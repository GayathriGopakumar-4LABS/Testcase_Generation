import os

import uvicorn


if __name__ == "__main__":
    os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=["app", "alembic"],
        reload_excludes=[
            ".venv",
            ".venv/*",
            "__pycache__",
            "*/__pycache__/*",
            "*.pyc",
            ".pytest_cache",
            ".pytest_cache/*",
        ],
    )
