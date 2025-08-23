import os
import csv
import logging
import importlib
import importlib.util
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder


# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.app")


app = FastAPI(title="FastAPI Backend", version="1.0.0")


# CORS configuration
# - Dev: only allow http://localhost:5173
# - Azure: allow all origins (set ENVIRONMENT=azure or ALLOW_ALL_ORIGINS=1)
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev").lower()
ALLOW_ALL_ORIGINS = os.getenv("ALLOW_ALL_ORIGINS", "0").lower() in {"1", "true", "yes"}

allow_all = ALLOW_ALL_ORIGINS or ENVIRONMENT == "azure"
allowed_origins = ["*"] if allow_all else ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _project_root_dir() -> str:
    """Return the absolute path to the project root directory.

    Assumes this file lives in `<root>/backend/app.py`.
    """
    return os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))


@app.get("/")
def read_root() -> Dict[str, str]:
    return {"status": "Backend running"}


@app.get("/data")
def get_data() -> List[Dict[str, Any]]:
    """Read CSV from ml/dataset.csv and return as JSON array of objects."""
    dataset_path = os.path.join(_project_root_dir(), "ml", "dataset.csv")

    if not os.path.exists(dataset_path):
        logger.error("Dataset not found at %s", dataset_path)
        raise HTTPException(status_code=404, detail="Dataset not found")

    try:
        with open(dataset_path, mode="r", encoding="utf-8", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            rows: List[Dict[str, Any]] = list(reader)
            return rows
    except UnicodeDecodeError:
        logger.exception("Failed to decode CSV as UTF-8: %s", dataset_path)
        raise HTTPException(status_code=500, detail="Failed to decode CSV as UTF-8")
    except Exception as exc:  # noqa: BLE001 - return controlled error to client
        logger.exception("Unexpected error reading CSV: %s", exc)
        raise HTTPException(status_code=500, detail="Error reading dataset")


@app.post("/analyze")
def analyze() -> Any:
    """Load ml/model.py and call analyze_data()."""
    project_root = _project_root_dir()
    module_name = "ml.model"

    # First try regular import by module name
    try:
        module = importlib.import_module(module_name)
    except ModuleNotFoundError:
        # Fallback: import from explicit file path
        model_path = os.path.join(project_root, "ml", "model.py")
        if not os.path.exists(model_path):
            logger.error("Model file not found at %s", model_path)
            raise HTTPException(status_code=404, detail="Model file not found")
        try:
            spec = importlib.util.spec_from_file_location(module_name, model_path)
            if spec is None or spec.loader is None:
                raise ImportError("Could not load spec for ml.model")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)  # type: ignore[union-attr]
        except Exception as exc:  # noqa: BLE001
            logger.exception("Error importing model: %s", exc)
            raise HTTPException(status_code=500, detail="Error importing model")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected import error: %s", exc)
        raise HTTPException(status_code=500, detail="Error importing model")

    if not hasattr(module, "analyze_data"):
        logger.error("analyze_data() not found in ml.model")
        raise HTTPException(status_code=500, detail="analyze_data() not found in model")

    try:
        result = module.analyze_data()  # type: ignore[attr-defined]
        return jsonable_encoder(result)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error running analyze_data(): %s", exc)
        raise HTTPException(status_code=500, detail="Error running analysis")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    # Running by module path ensures the root is on sys.path
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=os.getenv("RELOAD", "0") in {"1", "true", "yes"})
