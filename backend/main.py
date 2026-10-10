
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from io import BytesIO

app = FastAPI(title="Crop Doctor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Crop Doctor API is running!"}


@app.post("/analyze")
async def analyze_crop(file: UploadFile = File(...)):
    image_bytes = await file.read()

    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()
    except Exception:
        return {"error": "The uploaded file is not a valid image."}

    return {
        "filename": file.filename,
        "status": "image_received",
        "message": "Image uploaded successfully. AI disease model is not connected yet."
    }
