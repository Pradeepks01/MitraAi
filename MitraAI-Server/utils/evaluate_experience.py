import re
import json  # For JSON parsing
from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client

def evaluate_experience(content,jobdescription):
    try:
        # Get the Vertex AI client
        vertex_client = get_vertex_client()

        # Define the task
        task = f"""
        You are a strict and specialized ATS (Applicant Tracking System) evaluator. 
        Analyze the experience section of the provided resume content and compare it against the requirements and expectations outlined in the job description.

        Resume content (experience section only):
        {content}

        Job description (required skills and expectations):
        {jobdescription}

        Instructions:
        1. Evaluate the alignment of the experience section with the job description based on factors such as:
        - Relevance of roles, responsibilities, and achievements to the job description.
        - Demonstration of required skills, tools, and technologies in previous roles.
        - Alignment with the level of expertise, industry, and domain specified in the job description.
        - Impact and accomplishments in previous roles (e.g., metrics, results, or significant contributions).
        2. Provide an ATS score (an integer between 0 and 100) based on how well the experience section aligns with the job description. A score of 100 indicates a perfect match, while a lower score indicates lesser alignment.
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