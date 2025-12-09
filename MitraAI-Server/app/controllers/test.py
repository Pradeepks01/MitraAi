from flask import jsonify
from langchain_core.prompts import PromptTemplate
from utils.vertexAIclient import get_vertex_client

def test_prompt():
    try:
        # Get the Vertex AI client from the app context
        vertex_client = get_vertex_client()
        
        # Define a simple LangChain PromptTemplate
        prompt_template = PromptTemplate(
            input_variables=["task"],
            template="Please perform the following task: {task}",
        )
        
        # Define a small test task
        task = "Write a motivational quote"

        # Build the final prompt
        prompt = prompt_template.format(task=task)

        # Send the prompt to Vertex AI
        response_text = vertex_client.send_prompt(prompt)

        # Return the response as JSON
        return jsonify({'response': response_text}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500