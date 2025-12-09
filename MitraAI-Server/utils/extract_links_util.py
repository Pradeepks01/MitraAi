import requests
import PyPDF2
import io
import re
import urllib.parse

def download_pdf_from_firebase(firebase_url: str) -> io.BytesIO:
    """
    Download PDF from Firebase Storage URL and return as BytesIO object.
   
    Args:
        firebase_url: Firebase Storage download URL for the PDF
   
    Returns:
        BytesIO object containing the PDF data
    """
    try:
        # Download the file from Firebase URL
        response = requests.get(firebase_url)
        response.raise_for_status()  # Raise exception for bad status codes
       
        # Convert to BytesIO object
        return io.BytesIO(response.content)
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error downloading PDF from Firebase: {str(e)}")

def extract_links_from_pdf(pdf_file):
    """
    Extract hyperlinks from a PDF file.
    Returns a list of unique URLs found in the PDF.
    """
    # Create PDF reader object
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    links = set()
   
    # Iterate through all pages
    for page in pdf_reader.pages:
        # Get annotations (which include links)
        if '/Annots' in page:
            annotations = page['/Annots']
            for annotation in annotations:
                annotation_object = annotation.get_object()
                if annotation_object.get('/Subtype') == '/Link':
                    if '/A' in annotation_object and '/URI' in annotation_object['/A']:
                        links.add(annotation_object['/A']['/URI'])
       
        # Also check text content for URLs
        text = page.extract_text()
        # Simple regex for URL detection
        urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
        links.update(urls)
   
    return list(links)

def extract_links(firebase_url: str):
    """
    Extract links from a PDF stored in Firebase Storage.
   
    Args:
        firebase_url: Firebase Storage download URL for the PDF
   
    Returns:
        JSON response with extracted links or error message
    """
    try:
        # Validate URL
        if not firebase_url:
            print('Error: No Firebase URL provided')
            return
        
        # Parse the URL and extract the filename
        parsed_url = urllib.parse.urlparse(firebase_url)
        path_segments = parsed_url.path.split('/')
        filename = next((seg for seg in path_segments if '.pdf' in seg.lower()), None)
        
        if not filename:
            print('Error: URL must point to a PDF file')
            return
       
        # Download the PDF from Firebase
        pdf_file = download_pdf_from_firebase(firebase_url)
       
        # Extract links
        links = extract_links_from_pdf(pdf_file)
       
        result = {
            'links': links,
            'count': len(links),
            'source_url': firebase_url
        }
        print(result)
        return result
       
    except Exception as e:
        error_result = {
            'error': f'Error processing PDF: {str(e)}',
            'source_url': firebase_url
        }
        print(error_result)
        return error_result