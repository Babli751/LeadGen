from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import re
from typing import Dict, Optional

class ScraperService:
    EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    PHONE_REGEX = r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"

    async def extract_contact_info(self, url: str) -> Dict[str, Optional[str]]:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                context = await browser.new_context(ignore_https_errors=True)
                page = await context.new_page()
                await page.goto(url, timeout=15000)
                content = await page.content()
                await browser.close()

                soup = BeautifulSoup(content, 'html.parser')
                text = soup.get_text()

                emails = set(re.findall(self.EMAIL_REGEX, text))
                phones = set(re.findall(self.PHONE_REGEX, text))

                return {
                    'email': emails.pop() if emails else None,
                    'phone': phones.pop() if phones else None
                }
        except Exception as e:
            print(f"Scraping error for {url}: {str(e)}")
            return {'email': None, 'phone': None}
