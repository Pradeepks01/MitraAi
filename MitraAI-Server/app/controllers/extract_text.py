from flask import request, jsonify
import pdfplumber

def extract_text():
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file uploaded.'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected.'}), 400

        if not file.filename.endswith('.pdf'):
             return jsonify({'message': 'Only PDF files are allowed.'}), 400

        text = ""
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        
        return jsonify({'text': text}), 200

    except Exception as e:
        print(f"Error extracting text: {e}")
        return jsonify({'message': f"Failed to process file: {str(e)}"}), 500
