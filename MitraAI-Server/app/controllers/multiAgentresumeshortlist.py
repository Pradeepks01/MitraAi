import requests
import tempfile
import pdfplumber
import re
import json  # For JSON parsing
from flask import request, jsonify
from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client
from utils.evaluate_education import evaluate_education
from utils.evaluate_achievements import evaluate_achievements
from utils.evaluate_experience import evaluate_experience
from utils.evaluate_project import evaluate_project
from utils.evaluate_skills import evaluate_skills

# Function to download PDF from a URL
def download_pdf(url):
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Raise an error for bad status
        return response.content
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return None

# Function to extract resume content from PDF bytes
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
        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        # Extract request data
        data = request.get_json()
        count = data.get('count')
        resumes = data.get('resumes', [])
        jobdescription = data.get('jobdescription',[])

        if not resumes or count <= 0:
            return jsonify({'error': "Invalid input: No resumes or invalid count."}), 400

        scored_resumes = []

        for resume in resumes:
            name = resume.get("name")
            url = resume.get("resumeURL")  # Assuming the URL is provided

            if not name or not url:
                continue  # Skip invalid entries

            # Download the resume content from the URL
            pdf_bytes = download_pdf(url)

            if not pdf_bytes:
                continue  # Skip if the file couldn't be downloaded

            # Extract resume content
            content = extract_resume_content_from_bytes(pdf_bytes)

            if not content:
                continue  # Skip if no content could be extracted

            # Calculate scores for each criterion
            skills_score = evaluate_skills(content,jobdescription)
            experience_score = evaluate_experience(content,jobdescription)
            project_score = evaluate_project(content,jobdescription)
            education_score = evaluate_education(content,jobdescription)
            achievements_score = evaluate_achievements(content,jobdescription)

            # Calculate total score (you can use the sum or average as needed)
            total_score = (
                skills_score +
                experience_score +
                project_score +
                education_score +
                achievements_score
            )
            
            print("Total Score : ",total_score)

            # Append to scored resumes
            scored_resumes.append({
                "name": name,
                "resumeUrl": url,
                "score": total_score
            })

        # Sort resumes by score in descending order and shortlist top `count`
        shortlisted_resumes = sorted(scored_resumes, key=lambda x: x['score'], reverse=True)[:count]

        # Print the shortlisted resumes and their scores for debugging
        print("Shortlisted Resumes:")
        for resume in shortlisted_resumes:
            print(f"Name: {resume['name']}, Score: {resume['score']}")

        # Return the shortlisted resumes
        return jsonify({'shortlisted': shortlisted_resumes}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500