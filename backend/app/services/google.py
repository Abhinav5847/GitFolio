import os
import httpx
from typing import Dict, Any, Optional

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

class GoogleService:
    @staticmethod
    def get_auth_url() -> str:
        """
        Generate the Google authorization URL where the user is redirected.
        """
        scope = "openid email profile"
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={GOOGLE_CLIENT_ID}"
            f"&redirect_uri={GOOGLE_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope={scope}"
            f"&access_type=offline"
            f"&prompt=select_account"
        )

    @staticmethod
    async def exchange_code_for_token(code: str) -> Optional[str]:
        """
        Exchange the OAuth code for a Google access token.
        """
        url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data)
            if response.status_code == 200:
                res_data = response.json()
                return res_data.get("access_token")
            return None

    @staticmethod
    async def get_user_profile(access_token: str) -> Optional[Dict[str, Any]]:
        """
        Fetch the user profile data using the access token.
        """
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            return None
