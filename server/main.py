from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import List
import os
from datetime import datetime
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import re

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = rf"{os.getenv("CLOUD_PATH")}"
categories = ["livros", "cadernos"]

@app.get('/category')
def get_categories():
    return JSONResponse(content=categories, status_code=200)

def save_file(user_email: str, category: str, file: UploadFile):
    current_time = datetime.now().strftime("%Y-%m-%dT%H_%M_%S%z")
    folder_path = os.path.join(UPLOAD_DIR, user_email, category)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, f"{file.filename.split(".")[0]}_{current_time}.{file.filename.split(".")[-1]}")
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path

@app.post("/upload/")
async def upload_files(
    user_email: str = Form(...),
    category: str = Form(...),
    files: List[UploadFile] = Form(...)
):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if category not in categories:
        return JSONResponse(status_code=400, content={"detail" : [{"msg": "Invalid Category"}]})
    saved_files = []
    if not re.match(email_regex, user_email):
        return JSONResponse(status_code=400, content={"detail" : [{"msg": "Invalid Email"}]})
    for file in files:
        file_path = save_file(user_email, category, file)
        saved_files.append(file_path)
    return {"message": "Saved!", "files": saved_files}
