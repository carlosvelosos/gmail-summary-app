# Setup Guide

## Google OAuth Credentials Setup

To run this application, you need to set up Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Configure the OAuth consent screen
5. Create OAuth client ID credentials
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)

## Environment Variables

Create a `.env.local` file in the root directory with:
