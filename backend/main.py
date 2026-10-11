
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO
from transformers import ConvNextImageProcessor, AutoModelForImageClassification
import torch

app = FastAPI(title="Crop Doctor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "mesabo/agri-plant-disease-resnet50"

processor = None
model = None
model_error = None


@app.on_event("startup")
def load_model():
    global processor, model, model_error

    try:
        processor = ConvNextImageProcessor.from_pretrained(MODEL_NAME)
        model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
        model.eval()
        print("Crop Doctor AI model loaded successfully!")
    except Exception as e:
        model_error = str(e)
        print("AI model loading failed:", e)


@app.get("/")
def home():
    return {"message": "Crop Doctor API is running!"}


@app.post("/analyze")
async def analyze_crop(file: UploadFile = File(...)):
    if model is None or processor is None:
        return {
            "status": "model_unavailable",
            "message": "AI model is not available. Check backend terminal."
        }

    image_bytes = await file.read()

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {
            "status": "invalid_image",
            "message": "The uploaded file is not a valid image."
        }

    try:
        inputs = processor(images=image, return_tensors="pt")

        with torch.inference_mode():
            outputs = model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
            confidence, predicted_index = probabilities.max(dim=-1)

        label = model.config.id2label[int(predicted_index.item())]

        return {
            "filename": file.filename,
            "status": "prediction_complete",
            "predicted_disease": label,
            "confidence": round(float(confidence.item()) * 100, 2),
            "message": "AI prediction completed. Please verify the result."
        }

    except Exception as e:
        return {
            "status": "prediction_failed",
            "message": "Could not analyze this image.",
            "details": str(e)
        }
