# BettingAI

An online betting platform that uses AI for generation of match probabilities via sport/club preferences.

## Overview

BettingAI is a platform that leverages Gemini AI to provide natural language-based analysis for sports betting. Users can interact with the AI to get insights on matches, odds, and betting strategies.

## Features

- Interactive sports match listings with odds
- AI-powered analysis of betting scenarios
- Educational content about responsible betting
- Natural language processing for sports betting queries

## Technologies Used

- HTML5, CSS3, and JavaScript for frontend
- Gemini AI API for text generation (with fallback mock responses)
- Responsive design for all device types

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Start interacting with the AI by typing questions about the displayed matches

## API Limitations for Client-Side Apps

**Important Notes for Local Testing:**

1. **CORS Limitations**: The Gemini API has CORS restrictions that prevent direct browser-to-API communication. For production use, you would need a backend server to proxy these requests.

2. **Fallback Mode**: This demo includes a fallback mode that simulates AI responses when the API can't be reached directly from the browser.

3. **For Full Functionality**: To use the actual AI API, you would need to:
   - Deploy a simple backend server to proxy requests
   - Move the API key to server-side code for security
   - Make requests to your backend instead of directly to Gemini

## API Key Security Note

**Important:** In a production environment, the API key should never be exposed in frontend code. This implementation is for demonstration purposes only. In a real-world scenario, API requests should be proxied through a secure backend service.

## Responsible Betting

This platform is designed for educational purposes only. Always remember that betting carries financial risk, and users should practice responsible gambling behavior.
