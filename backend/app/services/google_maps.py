import requests
import os
from typing import List, Dict

class GoogleMapsService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    def search_businesses(self, query: str, location: str, max_results: int = 20) -> List[Dict]:
        params = {
            "query": f"{query} in {location}",
            "key": self.api_key,
            "fields": "name,formatted_address,international_phone_number,website",
            "language": "en"
        }
        
        response = requests.get(self.base_url, params=params)
        data = response.json()
        
        if data.get('status') != 'OK':
            raise Exception(f"Google Maps API error: {data.get('status')}")
        
        businesses = data.get('results', [])[:max_results]
        
        # Detaylı bilgileri al
        detailed_businesses = []
        for business in businesses:
            if 'place_id' in business:
                details = self.get_place_details(business['place_id'])
                detailed_businesses.append({**business, **details})
        
        return detailed_businesses
    
    def get_place_details(self, place_id: str) -> Dict:
        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "key": self.api_key,
            "fields": "website,international_phone_number",
        }
        response = requests.get(details_url, params=params)
        data = response.json()
        return data.get('result', {})