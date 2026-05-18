from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load generative Flan-T5 model
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")

def retrieve_relevant_chunks(context: str, question: str, top_k: int = 3) -> str:
    if not context:
        return ""
        
    # Split text into paragraphs based on newlines
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n|\n', context) if len(p.strip()) > 30]
    
    # If no paragraphs, split by sentences
    if len(paragraphs) < 3:
        paragraphs = [s.strip() for s in re.split(r'[.!?]', context) if len(s.strip()) > 20]
        
    if not paragraphs:
        return context[:1500] # Fallback to first block
        
    try:
        # Vectorize paragraphs and question
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(paragraphs)
        question_vector = vectorizer.transform([question])
        
        # Compute cosine similarities between question and paragraphs
        similarities = cosine_similarity(question_vector, tfidf_matrix).flatten()
        
        # Get top K indices with highest similarities
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Sort indices chronologically to preserve original document order
        top_indices = sorted(top_indices)
        
        relevant_chunks = [paragraphs[i] for i in top_indices if similarities[i] > 0]
        
        if not relevant_chunks:
            # Fallback to first few paragraphs
            return "\n\n".join(paragraphs[:3])
            
        return "\n\n".join(relevant_chunks)
    except Exception as e:
        print(f"Retrieval error: {e}")
        return context[:1500]

def answer_question(context: str, question: str) -> str:
    if not context or not question:
        return "Context or question is missing."
        
    # 1. Retrieve the most relevant paragraphs from the entire PDF text
    relevant_context = retrieve_relevant_chunks(context, question, top_k=3)
    
    # 2. Build prompt for Flan-T5 generative answering
    prompt = (
        f"Answer the following question in a complete, detailed, and clear paragraph "
        f"using the provided context. If the context does not contain the answer, answer the question generally and professionally.\n\n"
        f"Context:\n{relevant_context}\n\n"
        f"Question: {question}\n\n"
        f"Detailed Answer:"
    )
    
    try:
        inputs = tokenizer(prompt, max_length=512, truncation=True, return_tensors="pt")
        with torch.no_grad():
            outputs = model.generate(
                **inputs, 
                max_length=200, 
                min_length=20, 
                num_beams=4, 
                length_penalty=1.0, 
                early_stopping=True
            )
            
        answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return answer.strip()
    except Exception as e:
        print(f"Generative QA error: {e}")
        return "Failed to generate answer."
