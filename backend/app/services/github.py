import os
import httpx
from typing import Dict, Any, Optional

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI")

class GitHubService:
    @staticmethod
    def get_auth_url() -> str:
        """
        Generate the GitHub authorization URL where the user is redirected.
        """
        # We request read-only access to user profile and repositories
        scope = "user:email read:user"
        return (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={GITHUB_CLIENT_ID}"
            f"&redirect_uri={GITHUB_REDIRECT_URI}"
            f"&scope={scope}"
        )

    @staticmethod
    async def exchange_code_for_token(code: str) -> Optional[str]:
        """
        Exchange the OAuth code for a GitHub access token.
        """
        url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": GITHUB_REDIRECT_URI,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            if response.status_code == 200:
                res_data = response.json()
                return res_data.get("access_token")
            return None

    @staticmethod
    async def get_user_profile(access_token: str) -> Optional[Dict[str, Any]]:
        """
        Fetch the user profile data using the access token.
        """
        url = "https://api.github.com/user"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "GitFolio-App"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                
                # Fetch user's emails if email is not public
                if not user_data.get("email"):
                    email_url = "https://api.github.com/user/emails"
                    email_response = await client.get(email_url, headers=headers)
                    if email_response.status_code == 200:
                        emails = email_response.json()
                        primary_email = next((e["email"] for e in emails if e["primary"]), None)
                        user_data["email"] = primary_email
                
                return user_data
            return None
