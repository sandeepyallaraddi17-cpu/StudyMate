from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re

# Initialize model and tokenizer directly
tokenizer = AutoTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
model = AutoModelForSeq2SeqLM.from_pretrained("sshleifer/distilbart-cnn-12-6")

def generate_summary(text: str) -> str:
    if not text or len(text.strip()) == 0:
        return "No text available for summarization."
    
    # Preprocess text slightly
    text = re.sub(r'\s+', ' ', text).strip()
    
    # For small texts under 3000 characters, summarize directly
    if len(text) < 3000:
        try:
            inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors="pt")
            summary_ids = model.generate(
                inputs["input_ids"], 
                max_length=200, 
                min_length=55, 
                length_penalty=2.0, 
                num_beams=4, 
                early_stopping=True
            )
            return tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        except Exception as e:
            print(f"Direct summarization error: {e}")
            return text[:600] + "..."

    # For larger texts, divide into sections (~600 words per chunk) to capture all topics
    chunk_size = 3500
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    
    # Process up to 5 chunks to keep processing speed optimal on CPU
    chunks = chunks[:5]
    
    section_summaries = []
    for idx, chunk in enumerate(chunks):
        try:
            inputs = tokenizer(chunk, max_length=1024, truncation=True, return_tensors="pt")
            summary_ids = model.generate(
                inputs["input_ids"], 
                max_length=120, 
                min_length=40, 
                length_penalty=2.0, 
                num_beams=2, 
                early_stopping=True
            )
            chunk_summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True).strip()
            if chunk_summary:
                section_summaries.append(f"• Section {idx + 1}: {chunk_summary}")
        except Exception as e:
            print(f"Chunk {idx} summarization error: {e}")
            continue
            
    if not section_summaries:
        return "Failed to generate summary from document sections."
        
    # Format the final output as a beautiful, structured overview of all document contents
    overview = "This study module covers the following key contents:\n\n" + "\n\n".join(section_summaries)
    return overview
