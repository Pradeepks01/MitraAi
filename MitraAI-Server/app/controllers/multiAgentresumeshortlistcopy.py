import requests
import tempfile
import pdfplumber
import json
from flask import request, jsonify
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatVertexAI
from langchain_core.prompts import PromptTemplate
from langchain.agents import AgentType
from langchain.memory import ConversationBufferMemory

from utils.vertexAIclient import get_vertex_client
from utils.evaluate_education import evaluate_education
from utils.evaluate_achievements import evaluate_achievements
from utils.evaluate_experience import evaluate_experience
from utils.evaluate_project import evaluate_project
from utils.evaluate_skills import evaluate_skills

def download_pdf(url):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return None

def extract_resume_content_from_bytes(pdf_bytes):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf.flush()
            with pdfplumber.open(temp_pdf.name) as pdf:
                resume_content = ""
                for page in pdf.pages:
                    resume_content += page.extract_text()
        return resume_content.strip()
    except Exception as e:
        print(f"Error extracting content from PDF: {e}")
        return ""

def multiAgentEvaluation():
    try:
        # Initialize Vertex AI Chat Model
        llm = get_vertex_client()

        # Define evaluation tools
        def skills_evaluation_tool(content):
            """Evaluate skills match for the job description"""
            return str(evaluate_skills(content, jobdescription))

        def experience_evaluation_tool(content):
            """Evaluate work experience relevance"""
            return str(evaluate_experience(content, jobdescription))

        def project_evaluation_tool(content):
            """Evaluate project experience"""
            return str(evaluate_project(content, jobdescription))

        def education_evaluation_tool(content):
            """Evaluate educational background"""
            return str(evaluate_education(content, jobdescription))

        def achievements_evaluation_tool(content):
            """Evaluate candidate achievements"""
            return str(evaluate_achievements(content, jobdescription))

        # Create tools for the agent
        tools = [
            Tool(
                name="Skills Evaluation",
                func=skills_evaluation_tool,
                description="Evaluates the candidate's skills match for the job description"
            ),
            Tool(
                name="Experience Evaluation",
                func=experience_evaluation_tool,
                description="Assesses the candidate's work experience relevance"
            ),
            Tool(
                name="Project Evaluation",
                func=project_evaluation_tool,
                description="Analyzes the candidate's project experience"
            ),
            Tool(
                name="Education Evaluation",
                func=education_evaluation_tool,
                description="Reviews the candidate's educational background"
            ),
            Tool(
                name="Achievements Evaluation",
                func=achievements_evaluation_tool,
                description="Evaluates the candidate's notable achievements"
            )
        ]

        # Create a custom prompt for the main controller agent
        controller_prompt = PromptTemplate(
            template="""You are a hiring manager's assistant tasked with evaluating candidate resumes.
            Your goal is to coordinate multiple evaluation agents to generate a comprehensive score for each resume.

            You will:
            1. Use the provided tools to evaluate different aspects of each resume
            2. Aggregate scores from each evaluation tool
            3. Provide a final comprehensive score that reflects the candidate's suitability

            Available evaluation tools:
            - Skills Evaluation
            - Experience Evaluation
            - Project Evaluation
            - Education Evaluation
            - Achievements Evaluation

            For the current resume content: {input}

            Instructions:
            - Call each evaluation tool
            - Sum up the individual scores
            - Return the total score as a measure of the candidate's fit for the job
            """,
            input_variables=["input"]
        )

        # Initialize memory for the agent
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

        # Create the main controller agent
        controller_agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            prompt=controller_prompt,
            memory=memory
        )

        # Extract request data
        data = request.get_json()
        count = data.get('count')
        resumes = data.get('resumes', [])
        jobdescription = data.get('jobdescription', [])

        if not resumes or count <= 0:
            return jsonify({'error': "Invalid input: No resumes or invalid count."}), 400

        scored_resumes = []

        for resume in resumes:
            name = resume.get("name")
            url = resume.get("resumeURL")

            if not name or not url:
                continue

            # Download and extract resume content
            pdf_bytes = download_pdf(url)
            if not pdf_bytes:
                continue

            content = extract_resume_content_from_bytes(pdf_bytes)
            if not content:
                continue

            # Use the controller agent to evaluate the resume
            evaluation_result = controller_agent.run(content)
            
            # Extract the total score (you might need to adjust this based on the actual output)
            try:
                total_score = float(evaluation_result)
            except ValueError:
                # Fallback to manual score calculation if agent output is not directly convertible
                total_score = sum([
                    float(skills_evaluation_tool(content)),
                    float(experience_evaluation_tool(content)),
                    float(project_evaluation_tool(content)),
                    float(education_evaluation_tool(content)),
                    float(achievements_evaluation_tool(content))
                ])

            scored_resumes.append({
                "name": name,
                "resumeUrl": url,
                "score": total_score,
            })

        # Sort resumes by score and shortlist
        shortlisted_resumes = sorted(scored_resumes, key=lambda x: x['score'], reverse=True)[:count]

        return jsonify({'shortlisted': shortlisted_resumes}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500