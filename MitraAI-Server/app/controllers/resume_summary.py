from flask import request, jsonify
from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client
from utils.resume_parser import extract_content_from_url  # Assume you have a utility for this

def generate_summary():
    try:
        # Parse the request JSON
        data = request.get_json()
        resume_url = data.get("resumeUrl")
        job_description = data.get("jobDescription")

        if not resume_url or not job_description:
            return jsonify({"error": "Both resumeUrl and jobDescription are required"}), 400

        # Extract content from the resume URL
        resume_content = extract_content_from_url(resume_url)
        if not resume_content:
            return jsonify({"error": "Failed to extract content from resume"}), 400

        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        # Define a LangChain PromptTemplate
        prompt_template = PromptTemplate(
            input_variables=["resume_content", "job_description"],
            template=(
                "Given the resume content:\n{resume_content}\n\n"
                "And the job description:\n{job_description}\n\n"
                "Explain in detail why this candidate was shortlisted for the job."
            ),
        )

        # Build the final prompt
        prompt = prompt_template.format(
            resume_content=resume_content,
            job_description=job_description
        )

        # Send the prompt to Vertex AI
        response_text = vertex_client.send_prompt(prompt)

        # Return the response as JSON
        return jsonify({"summary": response_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500