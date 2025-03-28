// Gemini API Key - normally this would be stored securely on a server
const API_KEY = 'AIzaSyDWpQmCXfDDxriOyokrAZEW90oq1DUih14';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate AI response from Gemini API
 * @param {string} prompt - The user's prompt
 * @returns {Promise<string>} - The AI generated response
 */
async function generateAIResponse(prompt) {
    try {
        // Enhance the prompt with betting context
        const enhancedPrompt = enhancePromptWithContext(prompt);
        
        // Prepare the request payload
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: enhancedPrompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        console.log('Sending request to Gemini API...');

        // Make the API request with proper error handling
        try {
            // Using the URL with API key as a query parameter
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);
            
            // Handle non-OK responses
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
                } catch (jsonError) {
                    throw new Error(`API Error: Status ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('API response received:', data);
            
            // Extract the text from the response
            if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from API');
            }
        } catch (fetchError) {
            // Handle network or CORS errors
            console.error('API call error:', fetchError);
            return useMockResponse(prompt);
        }
    } catch (error) {
        console.error('Error generating AI response:', error);
        return useMockResponse(prompt);
    }
}

/**
 * Enhance the user prompt with betting context
 * @param {string} userPrompt - The user's original prompt
 * @returns {string} - Enhanced prompt with context
 */
function enhancePromptWithContext(userPrompt) {
    // Add context for the AI to respond appropriately
    return `You are an AI betting assistant that provides analysis on sports matches and betting odds. 
You should provide thoughtful, balanced analysis that considers multiple factors.
Important rules to follow:
1. NEVER encourage gambling addiction or irresponsible betting
2. Always remind users that betting involves risks and should be done responsibly
3. You should be transparent about the limitations of your predictions
4. Provide educational information about how odds work
5. Avoid making definitive predictions about the outcome of matches

User question: ${userPrompt}

Please provide a helpful, educational response about this betting-related question.`;
}

/**
 * Generate a mock response when the API fails
 * @param {string} prompt - The user's prompt
 * @returns {string} - A realistic mock response
 */
function useMockResponse(prompt) {
    console.log('Using mock response for prompt:', prompt);
    
    // Extract team names if they exist in the prompt
    const promptLower = prompt.toLowerCase();
    let homeTeam = "the home team";
    let awayTeam = "the away team";
    
    // Simple pattern matching to try to find team names in common formats
    const vsMatch = promptLower.match(/([a-z\s]+)\s+vs\.?\s+([a-z\s]+)/i);
    const winningMatch = promptLower.match(/chances\s+of\s+([a-z\s]+)\s+winning/i);
    
    if (vsMatch && vsMatch.length >= 3) {
        homeTeam = vsMatch[1].trim();
        awayTeam = vsMatch[2].trim();
    } else if (winningMatch && winningMatch.length >= 2) {
        // If we only caught one team, assume it's the one they're asking about
        homeTeam = winningMatch[1].trim();
    }
    
    return `Based on historical data and current form, the match between ${homeTeam} and ${awayTeam} is likely to be competitive. When analyzing betting odds, remember that they reflect both the bookmaker's assessment of probabilities and the betting market's behavior.

The odds for matches like this typically indicate several factors:
- Current team form and recent performance
- Head-to-head history between the teams
- Home advantage (which statistically provides about a 60% edge)
- Injuries and available key players
- Tactical matchups between the teams

If you're considering placing a bet, here are some educational points to consider:
1. Odds of around 2.0-3.0 indicate moderate probability events
2. Lower odds (1.2-1.8) suggest strong favorites
3. Higher odds (3.5+) indicate underdogs

Remember that all betting carries financial risk, and these analyses should never be considered guarantees. Always bet responsibly and only with money you can afford to lose.

(Note: This is a simulated response as the live API connection could not be established)`;
}

// Explicitly make the function available to other scripts
window.generateAIResponse = generateAIResponse; 