import json
import time
from pathlib import Path

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image

MODEL_DIR = Path(__file__).resolve().parent.parent / "model"
MODEL_PATH = MODEL_DIR / "best_model.pth"
LABELS_PATH = MODEL_DIR / "labels.json"

IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])


class Predictor:
    def __init__(self):
        with open(LABELS_PATH, "r", encoding="utf-8") as f:
            labels = json.load(f)
        self.class_names = [labels[str(i)] for i in range(len(labels))]

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        model = models.resnet18(weights=None)
        model.fc = nn.Linear(model.fc.in_features, len(self.class_names))
        model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
        model.eval()
        model.to(self.device)

        self.model = model

        self.model_info = {
            "model_name": "ResNet18",
            "framework": "PyTorch",
            "input_size": IMG_SIZE,
            "num_classes": len(self.class_names),
            "classes": self.class_names,
            "device": str(self.device),
        }

    def predict(self, image: Image.Image, top_k: int = 3):
        image = image.convert("RGB")
        tensor = _transform(image).unsqueeze(0).to(self.device)

        start = time.perf_counter()
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
        inference_time_ms = (time.perf_counter() - start) * 1000

        k = min(top_k, len(self.class_names))
        top_probs, top_idx = torch.topk(probs, k=k)

        top_predictions = [
            {"label": self.class_names[i], "confidence": float(p)}
            for p, i in zip(top_probs.tolist(), top_idx.tolist())
        ]

        return top_predictions, inference_time_ms


predictor = Predictor()
