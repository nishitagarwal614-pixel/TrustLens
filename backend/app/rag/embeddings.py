import math
import re
from collections import Counter
from typing import List, Dict

class TextEmbedder:
    """
    Lightweight, self-contained semantic vector embedding engine
    combining sub-word n-grams and term-frequency inverse document frequency
    for robust vector search without C-library dependencies.
    """
    def __init__(self):
        self.doc_freqs: Dict[str, int] = Counter()
        self.total_docs = 0

    def tokenize(self, text: str) -> List[str]:
        # Lowercase, clean, extract words and financial numerical tokens
        tokens = re.findall(r'[a-z0-9%₹\.\-]+', text.lower())
        # Add bigrams for financial phrase context (e.g. 'quarterly report', 'interest rates', 'revenue increased')
        bigrams = [f"{tokens[i]}_{tokens[i+1]}" for i in range(len(tokens)-1)]
        return tokens + bigrams

    def fit(self, texts: List[str]):
        self.total_docs = len(texts)
        self.doc_freqs = Counter()
        for t in texts:
            unique_tokens = set(self.tokenize(t))
            for tok in unique_tokens:
                self.doc_freqs[tok] += 1

    def embed(self, text: str) -> Dict[str, float]:
        tokens = self.tokenize(text)
        if not tokens:
            return {}
        tf = Counter(tokens)
        vector = {}
        for tok, count in tf.items():
            df = self.doc_freqs.get(tok, 1)
            idf = math.log((self.total_docs + 1) / (df + 0.5)) + 1.0
            vector[tok] = (count / len(tokens)) * idf

        # Normalize to unit vector
        norm = math.sqrt(sum(v * v for v in vector.values()))
        if norm > 0:
            for tok in vector:
                vector[tok] /= norm
        return vector

    @staticmethod
    def cosine_similarity(v1: Dict[str, float], v2: Dict[str, float]) -> float:
        if not v1 or not v2:
            return 0.0
        # Dot product
        common = set(v1.keys()) & set(v2.keys())
        return sum(v1[k] * v2[k] for k in common)
