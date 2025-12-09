# **Vertex AI Flask Server Setup and Testing Guide**

This guide will walk you through the steps to set up, run, and test the Vertex AI Flask server. This server is designed to integrate Google Vertex AI with Flask, providing a simple API endpoint for generating responses using Vertex AI's models.

---

## **Folder Structure**

Ensure your project folder (`MitraAi_server`) follows this structure:

```
MitraAi_server/
├── app/
│   ├── controllers/
│   │   ├── __pycache__/
│   │   ├── test.py                # Handles /api/test route logic
│   │   └── routes.py              # Vertex AI client initialization and routes
│   ├── __pycache__/
├── utils/
│   ├── __pycache__/
│   └── vertexAIclient.py          # Vertex AI client utility
├── .env                           # Environment variables file (optional)
├── .gitignore                     # Git ignore rules
├── app.yaml                       # App deployment configuration (optional)
├── gcp_cred.json                  # GCP service account credentials
├── main.py                        # Flask application entry point
├── Readme.md                      # Project README
├── requirements.txt               # Python dependencies
```

---

## **Prerequisites**

1. **Python**: Install Python 3.8 or later.
2. **Environment Setup**:
   - Install Flask and required dependencies.
   - Configure the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

---

## **Setup Instructions**

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd MitraAi_server
   ```

2. **Install Dependencies**:
   Install required Python libraries using `pip`:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Google Application Credentials**:
   Export the path to your GCP service account credentials file:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./gcp_cred.json"
   ```

4. **Run the Server**:
   Start the Flask application using:
   ```bash
   python main.py
   ```

   By default, the server will run at `http://127.0.0.1:5000`.

---

## **Testing the `/api/test` Endpoint**

1. **Using cURL**:
   Send a GET request to the `/api/test` endpoint:
   ```bash
   curl http://127.0.0.1:5000/api/test
   ```

2. **Using Postman**:
   - Open Postman and create a new GET request.
   - Set the URL to `http://127.0.0.1:5000/api/test`.
   - Send the request and view the response.

3. **Expected Response**:
   If everything is set up correctly, you should receive a response like this:
   ```json
   {
       "response": "Your motivational quote or Vertex AI model's response."
   }
   ```

---

## **Key Files Explanation**

### **`main.py`**
- Entry point for the Flask server.
- Initializes the application, sets up routes, and configures logging.

### **`gcp_cred.json`**
- GCP service account credentials required for authenticating with Vertex AI.

### **`routes.py`**
- Handles Vertex AI client initialization using `langchain_google_vertexai`.
- Reads GCP credentials and configures the client for API calls.

### **`test.py`**
- Contains the `/api/test` route logic.
- Uses LangChain to send a test prompt to Vertex AI and returns the response.

### **`vertexAIclient.py`**
- Utility to handle communication with Vertex AI.
- Abstracts sending prompts and handling responses.

---

## **Common Issues**

1. **Authentication Errors**:
   - Ensure the `GOOGLE_APPLICATION_CREDENTIALS` variable is correctly set.
   - Verify that the `gcp_cred.json` file is valid and accessible.

2. **Dependency Errors**:
   - Run `pip install -r requirements.txt` to ensure all dependencies are installed.

3. **Server Not Running**:
   - Check for syntax errors in `main.py` or missing dependencies.

---

With this setup, you should be able to run the server and test the `/api/test` endpoint successfully. For further development, refer to the respective files for more details.