from flask import jsonify, request
# from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client
import json
import re

# Function to generate feedback and summary based on interview session input
def generate_interview_feedback():
    try:
        # Parse input data from the request
        data = request.get_json()

        if not data or "userName" not in data or "answers" not in data:
            return jsonify({"error": "Invalid input format. 'userName' and 'answers' fields are required."}), 400

        user_name = data["userName"]
        answers = data["answers"]

        # Serialize answers into a string format for the prompt
        answers_text = "\n".join([f"{question}: {response}" for question, response in answers.items()])

        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        # Define a LangChain PromptTemplate for feedback and summary generation
        prompt_template_str = """Based on the following interview session, generate the following:

            1. A personalized summary of the candidate's performance.
            2. Constructive feedback highlighting strengths and areas for improvement.

            Ensure the output is formatted strictly in this JSON structure:
            {{
                "summary": "Brief summary of candidate performance.",
                "feedback": "Brief feedback for candidate performance"
            }}

            Candidate Name: {user_name}
            Interview Answers: {answers_text}

            Ensure the JSON is correctly structured without additional text or explanations."""

        # Build the final prompt
        prompt = prompt_template_str.format(user_name=user_name, answers_text=answers_text)

        # Send the prompt to Vertex AI
        response_text = vertex_client.send_prompt(prompt)

        # Validate and extract JSON response
        json_match = re.search(r'\{.*\}', response_text.strip(), re.DOTALL)
        if not json_match:
            raise ValueError("Valid JSON was not found in the response.")

        # Parse the JSON response
        response_json = json.loads(json_match.group(0))

        # Return the parsed JSON as the response
        return jsonify(response_json), 200

    except Exception as e:
        # Handle and return errors
        return jsonify({"error": str(e)}), 500