from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import re

def extract_keywords(text: str, top_n: int = 10) -> list:
    if not text or len(text.strip()) == 0:
        return []
    
    try:
        # Split text into sentences to build a proper corpus for TF-IDF from a single document
        sentences = [s.strip() for s in re.split(r'[.!?\n]', text) if len(s.strip()) > 15]
        
        # If too few sentences, fallback to a simple word frequency counter of non-stop-words
        if len(sentences) < 3:
            from collections import Counter
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            stop_words = set(['the', 'and', 'a', 'of', 'to', 'in', 'is', 'that', 'it', 'for', 'on', 'with', 'as', 'this', 'by', 'an', 'be', 'are', 'from', 'at', 'or', 'was', 'your', 'not', 'have', 'with'])
            filtered_words = [w for w in words if w not in stop_words]
            counts = Counter(filtered_words)
            return [word for word, count in counts.most_common(top_n)]

        # TF-IDF across sentences of the document
        vectorizer = TfidfVectorizer(stop_words='english', max_df=0.85)
        tfidf_matrix = vectorizer.fit_transform(sentences)
        
        # Sum TF-IDF scores for each term across all sentences
        scores = np.asarray(tfidf_matrix.sum(axis=0)).ravel()
        feature_names = vectorizer.get_feature_names_out()
        
        # Sort indices by score descending
        sorted_indices = np.argsort(scores)[::-1]
        
        # Filter for valid keywords (at least 3 characters, non-numeric)
        keywords = []
        for i in sorted_indices:
            word = feature_names[i]
            if len(word) > 2 and not word.isdigit():
                keywords.append(word)
            if len(keywords) >= top_n:
                break
                
        return keywords
    except Exception as e:
        print(f"Keyword extraction error: {e}")
        # Fallback to word counts
        try:
            words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
            stop_words = set(['the', 'and', 'a', 'of', 'to', 'in', 'is', 'that', 'it', 'for', 'on', 'with', 'as', 'this', 'by', 'an', 'be', 'are', 'from', 'at', 'or', 'was', 'your', 'not', 'have', 'with'])
            filtered_words = [w for w in words if w not in stop_words]
            from collections import Counter
            counts = Counter(filtered_words)
            return [word for word, count in counts.most_common(top_n)]
        except:
            return []
