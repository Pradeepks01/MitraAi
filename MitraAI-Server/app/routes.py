# routes.py
from flask import Blueprint
# from app.controllers.test import test_prompt
from app.controllers.generateMockQuestions import generate_mock_questions
from app.controllers.generate_interview_feedback import generate_interview_feedback
from app.controllers.resumeshortlist import resumeshortlist
# from app.controllers.multiAgentresumeshortlist import multiAgentEvaluation
from app.controllers.analyze_resume import analyze_resume
from app.controllers.extract_text import extract_text

def initialize_routes(app):
    # Create a Blueprint for API routes
    api_bp = Blueprint('api', __name__, url_prefix='/api')

    # Define GET route for /api/test
    # api_bp.add_url_rule('/test', view_func=test_prompt, methods=['GET'])
    
    # Define POST route for /api/generatemockquestions
    api_bp.add_url_rule('/generatemockquestions', view_func=generate_mock_questions, methods=['POST'])
    api_bp.add_url_rule('/interviewfeedback', view_func=generate_interview_feedback, methods=['POST'])
    # api_bp.add_url_rule('/resumeshortlist', view_func=multiAgentEvaluation, methods=['POST'])
    api_bp.add_url_rule('/resumeshortlist', view_func=resumeshortlist, methods=['POST'])
    api_bp.add_url_rule('/analyze_resume', view_func=analyze_resume, methods=['POST'])
    api_bp.add_url_rule('/extract_text', view_func=extract_text, methods=['POST'])
    # Register the Blueprint with the Flask app
    app.register_blueprint(api_bp)
    