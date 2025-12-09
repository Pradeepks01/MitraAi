import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def filter_linkedin_urls(links):
    """
    Filter LinkedIn URLs from a list of links.
   
    Args:
        links: List of URLs
   
    Returns:
        List of LinkedIn URLs
    """
    linkedin_urls = [link for link in links if 'linkedin.com' in urlparse(link).netloc]
    return linkedin_urls

def scrape_linkedin_profile(linkedin_url):
    """
    Scrape basic information from a LinkedIn profile.
    (Note: This method demonstrates scraping but may violate LinkedIn's terms of service.
    Use the LinkedIn API for production-level access.)
   
    Args:
        linkedin_url: URL of the LinkedIn profile
   
    Returns:
        Dictionary with scraped data or error message
    """
    try:
        # Send GET request to the LinkedIn profile
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        }
        response = requests.get(linkedin_url, headers=headers)
        response.raise_for_status()
       
        # Parse the LinkedIn profile page
        soup = BeautifulSoup(response.text, 'html.parser')
       
        # Extract profile information (demo: title, headline, etc.)
        name = soup.find('h1', class_='text-heading-xlarge').text.strip() if soup.find('h1', class_='text-heading-xlarge') else "Name not found"
        headline = soup.find('div', class_='text-body-medium').text.strip() if soup.find('div', class_='text-body-medium') else "Headline not found"
       
        return {
            'name': name,
            'headline': headline,
            'profile_url': linkedin_url
        }
    except Exception as e:
        return {
            'error': f'Error scraping LinkedIn profile: {str(e)}',
            'profile_url': linkedin_url
        }

def process_resume_links(firebase_url: str):
    """
    Process the resume PDF from Firebase, extract links, and scrape LinkedIn profiles.
   
    Args:
        firebase_url: Firebase Storage download URL for the PDF
   
    Returns:
        JSON response with LinkedIn profiles or error message
    """
    try:
        # Extract links from the PDF
        result = extract_links(firebase_url)
        if 'error' in result:
            return result
       
        links = result['links']
        linkedin_urls = filter_linkedin_urls(links)
       
        # Scrape LinkedIn profiles
        linkedin_profiles = [scrape_linkedin_profile(url) for url in linkedin_urls]
       
        return {
            'linkedin_profiles': linkedin_profiles,
            'source_url': firebase_url
        }
    except Exception as e:
        return {
            'error': f'Error processing LinkedIn profiles: {str(e)}',
            'source_url': firebase_url
        }