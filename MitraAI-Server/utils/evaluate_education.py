import re
import json  # For JSON parsing
from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client

def evaluate_education(content,jobdescription):
    try:
        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        task = f"""
        You are a strict and specialized ATS (Applicant Tracking System) evaluator. 
        Analyze the education section of the provided resume content and compare it against the requirements and expectations outlined in the job description.

        Resume content (education section only):
        {content}

        Job description (required qualifications and expectations):
        {jobdescription}

        Instructions:
        1. Evaluate the alignment of the education section with the job description based on factors such as:
        - Relevance of the degree(s) or field(s) of study to the job description.
        - Level of education (e.g., Bachelor's, Master's, PhD) compared to the requirements.
        - Relevance of certifications, coursework, or projects mentioned in the education section to the job description.
        - Demonstration of academic achievements, honors, or other distinctions, if applicable.
        2. Provide an ATS score (an integer between 0 and 100) based on how well the education section aligns with the job description. A score of 100 indicates a perfect match, while a lower score indicates lesser alignment.
        3. Respond with the ATS score as a numerical value only in the following exact JSON format:
        {{
            "score": <ATS_SCORE>
        }}
        4. Replace <ATS_SCORE> with the numerical value of the score.
        5. Do not include any other text, explanation, or information beyond the JSON.
        """



        # Create the prompt using LangChain's PromptTemplate
        prompt_template = PromptTemplate(
            input_variables=["task"],
            template="Please perform the following task: {task}",
        )
        prompt = prompt_template.format(task=task)

        # Send the prompt to Vertex AI and get the response
        response_text = vertex_client.send_prompt(prompt)

        # Extract the JSON structure containing the score using regex
        match = re.search(r'(\{.*\})', response_text.strip(), re.DOTALL)
        if match:
            json_response = match.group(1)
            # Parse the JSON response
            parsed_response = json.loads(json_response)
            if isinstance(parsed_response, dict) and 'score' in parsed_response:
                return parsed_response['score']  # Return the score directly
            else:
                print(f"Invalid JSON structure: {json_response}")
                return 0  # Default score if JSON structure is invalid
        else:
            print("No valid JSON response found.")
            return 0  # Default score if no JSON match found

    except Exception as e:
        print(f"Error extracting score from response: {e}")
        return 0  # Default score if there's an error