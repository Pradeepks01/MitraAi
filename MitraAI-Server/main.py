import logging
from flask import Flask
from flask_cors import CORS
from app.routes import initialize_routes
from utils.vertexAIclient import start_vertex

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": "*", "methods": ["GET", "POST", "OPTIONS"]}}, supports_credentials=True)

    # Initialize Vertex AI client before routes are initialized
    start_vertex(app)

    initialize_routes(app)
    
    return app


def initialize_logger(app):
    """Setup logging for debugging purposes."""
    # Create a logger
    logger = logging.getLogger('flask.app')
    logger.setLevel(logging.DEBUG)  # Log all messages at DEBUG level and above

    # Create a console handler to output logs to the terminal
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)

    # Define the log format
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)

    # Add the console handler to the logger
    logger.addHandler(console_handler)

    # Attach the logger to the Flask app
    app.logger = logger

# Create app instance at module level for gunicorn
app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
