import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from PIL import Image

from database.db import Base, engine, get_db
from database.models import PredictionRecord
from services.predictor import predictor

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Image Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.post("/api/predict")
async def predict_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = Path(file.filename).suffix or ".jpg"
    saved_name = f"{uuid.uuid4().hex}{ext}"
    saved_path = UPLOAD_DIR / saved_name

    contents = await file.read()
    with open(saved_path, "wb") as f:
        f.write(contents)

    image = Image.open(saved_path)
    top_predictions, inference_time_ms = predictor.predict(image)
    top1 = top_predictions[0]

    record = PredictionRecord(
        image_name=saved_name,
        prediction=top1["label"],
        confidence=top1["confidence"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "image_url": f"/uploads/{saved_name}",
        "prediction": top1["label"],
        "confidence": top1["confidence"],
        "top_predictions": top_predictions,
        "inference_time_ms": inference_time_ms,
        "created_at": record.created_at,
    }


@app.get("/api/model-info")
def get_model_info():
    return predictor.model_info


@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "image_name": r.image_name,
            "image_url": f"/uploads/{r.image_name}",
            "prediction": r.prediction,
            "confidence": r.confidence,
            "created_at": r.created_at,
        }
        for r in records
    ]
