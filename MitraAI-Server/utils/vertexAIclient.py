import os
import json
from google.oauth2 import service_account
# from langchain_google_vertexai import VertexAI
from flask import current_app

class MockVertexAIClient:
    def __init__(self, model_name: str):
        self.model_name = model_name
        print(f"Initialized MockVertexAIClient with model: {model_name}")

    def send_prompt(self, prompt: str) -> str:
        """Return a mock response."""
        print(f"MockVertexAI received prompt of length: {len(prompt)}")
        # Check if the prompt asks for JSON score (heuristic)
        if "ATS_SCORE" in prompt:
             return '```json\n{\n    "score": 85\n}\n```'
        
        if "technical_questions" in prompt:
            return '''```json
{
    "technical_questions": [
        "Can you explain the difference between REST and GraphQL?",
        "How do you handle state management in a large React application?"
    ],
    "behavioral_questions": [
        "Describe a time you had a conflict with a team member and how you resolved it.",
        "Tell me about a project where you had to learn a new technology quickly."
    ]
}
```'''
        
        if "feedback" in prompt and "summary" in prompt:
            return '''```json
{
    "feedback": "The candidate provided solid answers demonstrating good understanding of React concepts. However, answers could be more concise.",
    "summary": "Overall strong candidate with good technical foundation."
}
```'''

        # Mock path for detailed resume analysis
        if "ATS Score" in prompt and "Strengths" in prompt:
             # generate a "random" but deterministic score based on the resume content
             resume_hash = sum(ord(c) for c in prompt)
             base_score = 65 + (resume_hash % 30) # Score between 65 and 95
             
             # Detect keywords to customize the response
             skills_detected = []
             if "Python" in prompt: skills_detected.append("Python")
             if "Java" in prompt: skills_detected.append("Java")
             if "React" in prompt or "react" in prompt: skills_detected.append("React")
             if "JavaScript" in prompt: skills_detected.append("JavaScript")
             if "AWS" in prompt: skills_detected.append("AWS")
             if "SQL" in prompt: skills_detected.append("SQL")
             
             skills_str = ", ".join(skills_detected) if skills_detected else "General Technical Skills"

             # Select different feedback templates based on score range
             if base_score > 85:
                 strengths = f"""* **Skills:** Excellent proficiency in {skills_str}, significantly boosting candidacy.\n* **Experience:** Strong history of impactful projects and clear career progression.\n* **Formatting:** Professional and ATS-friendly layout."""
                 weaknesses = """* **Metrics:** Could include even more specific KPIs (e.g., 'Reduced latency by 15%').\n* **Summary:** Professional summary could be slightly more concise."""
                 suggestions = """* **Leadership:** Highlight any mentorship or team lead experiences to aim for senior roles.\n* **Certifications:** Consider adding advanced certifications to stand out further."""
             elif base_score > 75:
                 strengths = f"""* **Skills:** Good foundation in {skills_str}.\n* **Education:** Clear educational background relevant to the target role."""
                 weaknesses = """* **Quantifiable Impact:** Resume lists responsibilities but lacks data-driven achievements.\n* **Keywords:** Missing some industry-standard keywords like 'CI/CD' or 'Agile'."""
                 suggestions = """* **Action Verbs:** Start bullet points with stronger power verbs (e.g., 'Spearheaded', 'Orchestrated').\n* **Projects:** Add a section for personal projects to demonstrate passion."""
             else:
                 strengths = f"""* **Potential:** Shows promise with exposure to {skills_str}."""
                 weaknesses = """* **Formatting:** Layout is cluttered or uses tables that may confuse ATS parsers.\n* **Detail:** Experience descriptions are too vague and short."""
                 suggestions = """* **Structure:** Reorganize to standard 'Experience', 'Education', 'Skills' sections.\n* **Content:** Expand on your role in projects—what specifically did YOU build?"""

             return f"""
**ATS Score**
{base_score}/100

**Strengths**
{strengths}

**Weaknesses**
{weaknesses}

**Suggestions**
{suggestions}
"""

        return "This is a mock response from Mitra AI (Vertex AI not configured). Please configure GCP credentials to get real AI responses."

def init_vertex_ai(app, model_name: str, credentials):
    """Initialize the Vertex AI client and store it in the Flask app context."""
    try:
        # if credentials:
        #     app.config['VERTEX_CLIENT'] = VertexAIClient(model_name, credentials)
        #     print("Vertex AI client initialized and stored in app context.")
        # else:
        #     raise ValueError("No credentials provided")
        raise ValueError("Forced Mock Enabled")
    except Exception as e:
        print(f"Error during Vertex AI client initialization: {str(e)}")
        print("Falling back to MockVertexAIClient...")
        app.config['VERTEX_CLIENT'] = MockVertexAIClient(model_name)


def get_vertex_client():
    """Retrieve the Vertex AI client from the Flask app context."""
    client = current_app.config.get('VERTEX_CLIENT')
    if not client:
        raise RuntimeError("Vertex AI client is not initialized in app context.")
    return client

def start_vertex(app):
    service_account_path = "./gcp_cred.json"

    # Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = service_account_path

    credentials = None
    try:
        # Load credentials from the service account key file
        credentials = service_account.Credentials.from_service_account_file(service_account_path)

        with open(service_account_path, 'r') as file:
            credentials_data = json.load(file)

        # Print the details (e.g., project_id and client_email)
        print("Project ID:", credentials_data.get('project_id'))
        print("Client Email:", credentials_data.get('client_email'))
        
        # Verify if they are dummy credentials
        if credentials_data.get('project_id') == "mock-project-id":
             print("Detected mock credentials. Forcing fallback to Mock Client.")
             credentials = None 

    except Exception as e:
        print(f"Failed to load GCP credentials: {e}")
        credentials = None

    # Initialize the Vertex AI client (or mock) and store it in the app context
    init_vertex_ai(app, "gemini-pro", credentials)