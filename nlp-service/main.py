from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
from summarizer import generate_summary
from qa_engine import answer_question
from extractor import extract_keywords

app = FastAPI(title="StudyMate NLP Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

class QARequest(BaseModel):
    text: str
    question: str

@app.get("/")
def read_root():
    return {"message": "StudyMate NLP Service is running."}

@app.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
def summarize_text(req: TextRequest):
    try:
        summary = generate_summary(req.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/keywords")
def get_keywords(req: TextRequest):
    try:
        keywords = extract_keywords(req.text)
        return {"keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/qa")
def qa_endpoint(req: QARequest):
    try:
        answer = answer_question(req.text, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
