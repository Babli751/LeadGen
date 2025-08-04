import os
from typing import List, Dict
import httpx

class GoogleMapsService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    async def search_businesses(self, query: str, location: str, max_results: int = 20) -> List[Dict]:
        params = {
            "query": f"{query} in {location}",
            "key": self.api_key,
            "language": "en"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(self.base_url, params=params)
            data = response.json()

            if data.get('status') != 'OK':
                raise Exception(f"Google Maps API error: {data.get('status')}")

            businesses = data.get('results', [])[:max_results]

            detailed_businesses = []
            for business in businesses:
                if 'place_id' in business:
                    details = await self.get_place_details(business['place_id'], client)
                    detailed_businesses.append({**business, **details})

            return detailed_businesses

    async def get_place_details(self, place_id: str, client: httpx.AsyncClient) -> Dict:
        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "key": self.api_key,
            "fields": "website,international_phone_number",
        }
        response = await client.get(details_url, params=params)
        data = response.json()
        return data.get('result', {})
