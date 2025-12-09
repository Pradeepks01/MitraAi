import requests
import tempfile
import pdfplumber
from flask import request, jsonify
from utils.resume_scorer import score_resume

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

def resumeshortlist():
    try:
        # Extract request data
        data = request.get_json()
        count = data.get('count')
        resumes = data.get('resumes', [])
        job_description = data.get('jobdescription', '')

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

            # Score the resume using the centralized scoring logic (with Embeddings)
            analysis = score_resume(content, job_description)
            
            # Handle potential error if document is invalid, but for shortlisting we might just score it low
            if "error" in analysis:
                 score = 0
            else:
                 score = analysis.get("final_score", 0)

            print(f"Scored {name}: {score}")

            scored_resumes.append({
                "name": name,
                "resumeUrl": url,
                "score": score
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
        print(f"Error in resumeshortlist: {e}")
        return jsonify({'error': str(e)}), 500