import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Standard Generic JD (Full Stack / Software Engineer focus)
DEFAULT_JD = """
Software Engineer. 
Proficient in Python, Java, JavaScript, React, Node.js, SQL.
Experience with cloud platforms like AWS, Azure, or Google Cloud.
Understanding of algorithms, data structures, and software design patterns.
Experience with RESTful APIs, Git, Docker, CI/CD and Agile methodologies.
Strong problem-solving skills, communication, and ability to work in a team.
Bachelor's degree in Computer Science or related field.
"""

# Heuristics
SECTIONS = {
    "Education": ["education", "academic", "university", "college", "degree", "bachelor", "master", "phd"],
    "Experience": ["experience", "employment", "work history", "history", "professional"],
    "Skills": ["skills", "technologies", "technical", "stack", "proficiencies"],
    "Projects": ["projects", "personal projects", "portfolio"]
}

METRICS_REGEX = r"(\d+%|\$\d+|\d+\+ years|\d+ users|\d+ customers|increased by|reduced by|improved by)"

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9+\s%\$\.]", " ", text) # Keep %, $, . for metric detection
    text = re.sub(r"\s+", " ", text).strip()
    return text

def analyze_structure(text_lower: str):
    found_sections = []
    missing_sections = []
    
    for section, keywords in SECTIONS.items():
        if any(kw in text_lower for kw in keywords):
            found_sections.append(section)
        else:
            missing_sections.append(section)
            
    return found_sections, missing_sections

def analyze_impact(text_lower: str):
    matches = re.findall(METRICS_REGEX, text_lower)
    return len(matches)

# Validation Keywords
RESUME_INDICATORS = ["education", "experience", "skills", "projects", "summary", "profile", "work history", "contact", "email", "phone"]
NON_RESUME_INDICATORS = ["question paper", "marks", "part a", "part b", "semester", "examination", "max marks", "instructions", "module"]

def is_valid_resume(text_lower: str) -> bool:
    # Check for resume indicators
    resume_score = sum(1 for kw in RESUME_INDICATORS if kw in text_lower)
    
    # Check for non-resume indicators (like question papers)
    non_resume_score = sum(1 for kw in NON_RESUME_INDICATORS if kw in text_lower)
    
    # Heuristic: If it has more "question paper" words than "resume" words, it's likely not a resume.
    # Also requires a minimum number of resume keywords to be considered valid.
    if non_resume_score > 2 and non_resume_score >= resume_score:
        return False
        
    if resume_score < 2: # At least 2 resume keywords must be present
        return False
        
    return True

# Embedding Model Initialization
try:
    # from sentence_transformers import SentenceTransformer, util
    # semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    HAS_EMBEDDINGS = False # Forced disable due to DLL environment error
except ImportError:
    HAS_EMBEDDINGS = False
    print("Warning: sentence-transformers not found. Semantic scoring disabled.")
except Exception as e:
    HAS_EMBEDDINGS = False
    print(f"Warning: Failed to load embedding model: {e}")

def score_resume(resume_text: str, job_text: str = None):
    cleaned_resume = clean_text(resume_text)
    
    # 0. Validity Check
    if not is_valid_resume(cleaned_resume):
        return {
            "error": "Invalid Document Type",
            "message": "The uploaded document does not appear to be a resume. It resembles a question paper or other non-resume document."
        }

    # Use default JD if none provided
    if not job_text or not job_text.strip():
        job_text = DEFAULT_JD

    cleaned_job = clean_text(job_text)
    
    # 1. Structural Analysis
    found_sections, missing_sections = analyze_structure(cleaned_resume)
    structure_score = (len(found_sections) / len(SECTIONS)) * 20 # Max 20 points
    
    # 2. Impact Analysis (Quantifiable metrics)
    impact_count = analyze_impact(cleaned_resume)
    impact_score = min(20, impact_count * 4) # Max 20 points
    
    # 3. Content Similarity (TF-IDF)
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([cleaned_job, cleaned_resume])
        similarity = cosine_similarity(
            tfidf_matrix[0:1], tfidf_matrix[1:2]
        )[0][0]
        keyword_similarity_score = float(similarity) * 100
    except:
        keyword_similarity_score = 0

    # 4. Semantic Similarity (Embeddings)
    semantic_similarity_score = 0
    if HAS_EMBEDDINGS:
        try:
            # Encode sentences to get their embeddings
            embedding_resume = semantic_model.encode(cleaned_resume, convert_to_tensor=True)
            embedding_job = semantic_model.encode(cleaned_job, convert_to_tensor=True)
            
            # Compute cosine similarity
            semantic_sim = util.pytorch_cos_sim(embedding_resume, embedding_job).item()
            semantic_similarity_score = max(0, float(semantic_sim) * 100)
        except Exception as e:
            print(f"Error calculating semantic similarity: {e}")
            semantic_similarity_score = 0

    # 5. Keyword Coverage (Exact Matches)
    job_words = set([w for w in cleaned_job.split() if len(w) > 3])
    resume_words = set(cleaned_resume.split())
    
    if len(job_words) == 0:
        coverage = 0
    else:
        matched = job_words & resume_words
        coverage = (len(matched) / len(job_words)) * 100
        
    # Weighted Final Score Calculation
    # Revised Weights:
    # Semantic Similarity: 30% (Understanding context)
    # Keyword Score (TF-IDF): 20% (Term overlap)
    # Coverage: 15% (Missing keywords)
    # Structure: 15%
    # Impact: 20%
    
    final_score = (
        (semantic_similarity_score * 0.3) + 
        (keyword_similarity_score * 0.2) + 
        (coverage * 0.15) + 
        structure_score + 
        impact_score
    )
    
    # Fallback: If embeddings failed, re-distribute semantic weight to keywords
    if not HAS_EMBEDDINGS or semantic_similarity_score == 0:
        final_score = (
            (keyword_similarity_score * 0.45) + # 20 + 25
            (coverage * 0.20) + 
            structure_score + 
            impact_score
        )

    # Boost for decent non-empty resumes
    if len(cleaned_resume) > 200 and final_score < 40:
        final_score += 15
        
    return {
        "final_score": int(min(98, final_score)),
        "breakdown": {
            "semantic_match": int(semantic_similarity_score),
            "keyword_match": int(keyword_similarity_score),
            "coverage": int(coverage),
            "structure": int(structure_score),
            "impact": int(impact_score)
        },
        "found_sections": found_sections,
        "missing_sections": missing_sections,
        "impact_count": impact_count,
        "matched_keywords": sorted(list(job_words & resume_words)),
        "missing_keywords": sorted(list(job_words - resume_words))[:8]
    }
