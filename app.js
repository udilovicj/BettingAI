// Initialize the sports data service
const sportsData = new SportsData();

// Initialize empty data for matches
let matchesData = [];
let filteredMatches = [];
let betslip = [];

// DOM Elements
const matchesContainer = document.getElementById('matchesContainer');
const leagueSelector = document.getElementById('leagueSelector');
const sportSelector = document.getElementById('sportSelector');
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const aiResponse = document.getElementById('aiResponse');
const betslipContainer = document.getElementById('betslip');
const stakeAmount = document.getElementById('stakeAmount');
const potentialReturn = document.getElementById('potentialReturn');
const placeBetBtn = document.getElementById('placeBetBtn');
const teamSearch = document.getElementById('teamSearch');
const sortButtons = document.querySelectorAll('.sort-button');
const refreshButton = document.getElementById('refreshData');
const dateRangeSelector = document.getElementById('dateRange');

// Initialize the page
async function init() {
    showLoadingState(matchesContainer);
    await setupSportsAndLeagues();
    await loadAndRenderMatches();
    setupEventListeners();
    updateBetslip();
}

// Show loading state in a container
function showLoadingState(container) {
    container.innerHTML = '<div class="loading">Loading data...</div>';
}

// Set up sports and leagues dropdowns
async function setupSportsAndLeagues() {
    // Set up sports selector
    const sports = Object.keys(sportsData.api.leagues);
    sportSelector.innerHTML = '';
    
    sports.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport.charAt(0).toUpperCase() + sport.slice(1);
        sportSelector.appendChild(option);
    });
    
    // Set up leagues selector based on default sport
    await updateLeagueSelector();
}

// Update leagues dropdown based on selected sport
async function updateLeagueSelector() {
    showLoadingState(leagueSelector);
    
    const leagues = await sportsData.loadLeagues();
    leagueSelector.innerHTML = '';
    
    leagues.forEach(league => {
        const option = document.createElement('option');
        option.value = league.id;
        option.textContent = league.name;
        leagueSelector.appendChild(option);
    });
    
    // Set the active league
    leagueSelector.value = sportsData.activeLeague;
}

// Load and render matches
async function loadAndRenderMatches() {
    showLoadingState(matchesContainer);
    
    try {
        // Load matches from the API
        matchesData = await sportsData.loadMatches();
        
        // Update filtered matches
        filteredMatches = [...matchesData];
        
        // Sort and render
        sortMatches('time');
    } catch (error) {
        console.error("Error loading matches:", error);
        matchesContainer.innerHTML = '<div class="error">Error loading matches. Please try again later.</div>';
    }
}

// Render matches to the page
function renderMatches() {
    matchesContainer.innerHTML = '';
    
    if (filteredMatches.length === 0) {
        matchesContainer.innerHTML = '<div class="no-matches">No matches found matching your search.</div>';
        return;
    }
    
    filteredMatches.forEach(match => {
        const bestOdds = Math.max(match.odds.home, match.odds.draw, match.odds.away);
        const bestBet = match.odds.home === bestOdds ? 'home' : 
                       match.odds.draw === bestOdds ? 'draw' : 'away';
        
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <div class="league-badge">${match.league}</div>
            ${match.homeTeamLogo ? `<img class="team-logo home-logo" src="${match.homeTeamLogo}" alt="${match.homeTeam}">` : ''}
            <div class="team home-team" data-team-id="${match.homeTeamId}">${match.homeTeam}</div>
            <div class="vs">VS</div>
            <div class="team away-team" data-team-id="${match.awayTeamId}">${match.awayTeam}</div>
            ${match.awayTeamLogo ? `<img class="team-logo away-logo" src="${match.awayTeamLogo}" alt="${match.awayTeam}">` : ''}
            <div class="match-time">${match.time}</div>
            ${match.status !== 'SCHEDULED' ? `<div class="match-status">${match.status}</div>` : ''}
            <div class="odds">
                <button class="odd-btn ${bestBet === 'home' ? 'best-odds' : ''}" data-match-id="${match.id}" data-bet-type="home">${match.odds.home.toFixed(2)}</button>
                <button class="odd-btn ${bestBet === 'draw' ? 'best-odds' : ''}" data-match-id="${match.id}" data-bet-type="draw">${match.odds.draw.toFixed(2)}</button>
                <button class="odd-btn ${bestBet === 'away' ? 'best-odds' : ''}" data-match-id="${match.id}" data-bet-type="away">${match.odds.away.toFixed(2)}</button>
            </div>
        `;
        matchesContainer.appendChild(matchCard);
    });
    
    // Add event listeners to the newly created odds buttons
    document.querySelectorAll('.odd-btn').forEach(btn => {
        btn.addEventListener('click', handleOddsClick);
    });
    
    // Add event listeners to team names for team info
    document.querySelectorAll('.team').forEach(team => {
        team.addEventListener('click', handleTeamClick);
    });
}

// Handle click on team name
async function handleTeamClick(e) {
    const teamId = parseInt(e.target.dataset.teamId);
    if (!teamId) return;
    
    // Find the team in available teams
    let team;
    
    try {
        // Get teams for the current sport and league
        const teams = await sportsData.api.getTeams(sportsData.activeSport, sportsData.activeLeague);
        team = teams.find(t => t.id === teamId);
        
        if (!team) {
            // If not found in current teams, try to find in the match data
            const match = matchesData.find(m => 
                m.homeTeamId === teamId || m.awayTeamId === teamId
            );
            
            if (match) {
                team = {
                    id: teamId,
                    name: match.homeTeamId === teamId ? match.homeTeam : match.awayTeam
                };
            } else {
                throw new Error("Team not found");
            }
        }
        
        // Get team stats and upcoming matches
        const stats = await sportsData.loadTeamStats(teamId);
        const matches = await sportsData.loadTeamMatches(teamId);
        
        // Build prompt about this team
        let prompt = `Tell me about ${team.name} current form and their chances in the upcoming matches. `;
        
        if (matches && matches.length > 0) {
            prompt += `They're playing against ${matches[0].homeTeamId === teamId ? 
                matches[0].awayTeam : matches[0].homeTeam} next.`;
        }
        
        promptInput.value = prompt;
        
        // Scroll to AI section
        document.querySelector('.ai-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error(`Error loading team data:`, error);
        promptInput.value = `Tell me about the team with ID ${teamId}`;
    }
}

// Filter matches by search term
function filterMatches(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        // If search term is empty, show all matches
        filteredMatches = [...matchesData];
    } else {
        // Convert to lowercase for case-insensitive search
        const term = searchTerm.toLowerCase().trim();
        
        // Filter matches that contain the search term in team names or league
        filteredMatches = matchesData.filter(match => {
            const homeTeam = match.homeTeam ? match.homeTeam.toLowerCase() : '';
            const awayTeam = match.awayTeam ? match.awayTeam.toLowerCase() : '';
            const league = match.league ? match.league.toLowerCase() : '';
            
            return homeTeam.includes(term) || 
                   awayTeam.includes(term) || 
                   league.includes(term);
        });
    }
    
    // Re-apply the current sort and render the filtered matches
    sortMatches(getCurrentSortMethod());
}

// Get current sort method
function getCurrentSortMethod() {
    const activeButton = document.querySelector('.sort-button.active');
    return activeButton ? activeButton.dataset.sort : 'time';
}

// Sort matches by the given criteria
function sortMatches(sortBy) {
    // Set the active sort button
    document.querySelectorAll('.sort-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sortBy);
    });
    
    switch(sortBy) {
        case 'time':
            // Sort by time (Today first, then chronologically)
            filteredMatches.sort((a, b) => {
                const aIsToday = a.time && a.time.includes('Today');
                const bIsToday = b.time && b.time.includes('Today');
                
                if (aIsToday && !bIsToday) return -1;
                if (!aIsToday && bIsToday) return 1;
                
                return a.date - b.date;
            });
            break;
            
        case 'league':
            // Sort alphabetically by league
            filteredMatches.sort((a, b) => {
                const leagueA = a.league || '';
                const leagueB = b.league || '';
                return leagueA.localeCompare(leagueB);
            });
            break;
            
        case 'odds':
            // Sort by best odds (highest value first)
            filteredMatches.sort((a, b) => {
                if (!a.odds || !b.odds) return 0;
                
                const aBestOdds = Math.max(a.odds.home || 0, a.odds.draw || 0, a.odds.away || 0);
                const bBestOdds = Math.max(b.odds.home || 0, b.odds.draw || 0, b.odds.away || 0);
                return bBestOdds - aBestOdds;
            });
            break;
    }
    
    renderMatches();
}

// Set up event listeners
function setupEventListeners() {
    // Sport selector
    sportSelector.addEventListener('change', async (e) => {
        sportsData.setActiveSport(e.target.value);
        await updateLeagueSelector();
        await loadAndRenderMatches();
    });
    
    // League selector
    leagueSelector.addEventListener('change', async (e) => {
        sportsData.setActiveLeague(parseInt(e.target.value));
        await loadAndRenderMatches();
    });
    
    // Date range selector
    if (dateRangeSelector) {
        dateRangeSelector.addEventListener('change', async (e) => {
            const range = e.target.value;
            const today = new Date();
            let endDate = new Date();
            
            switch(range) {
                case 'today':
                    endDate = today;
                    break;
                case 'tomorrow':
                    endDate.setDate(today.getDate() + 1);
                    break;
                case 'week':
                    endDate.setDate(today.getDate() + 7);
                    break;
                case 'month':
                    endDate.setDate(today.getDate() + 30);
                    break;
            }
            
            sportsData.setDateRange(
                today.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            
            await loadAndRenderMatches();
        });
    }
    
    // AI generation button
    generateBtn.addEventListener('click', handleGenerateResponse);
    
    // Team search
    teamSearch.addEventListener('input', (e) => {
        filterMatches(e.target.value);
    });
    
    // Sort buttons
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            sortMatches(button.dataset.sort);
        });
    });
    
    // Refresh button
    refreshButton.addEventListener('click', async () => {
        refreshButton.classList.add('loading');
        refreshButton.disabled = true;
        
        try {
            // Clear API cache to get fresh data
            sportsData.api.clearCache('matches');
            await loadAndRenderMatches();
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            refreshButton.classList.remove('loading');
            refreshButton.disabled = false;
        }
    });

    // Stake amount input
    stakeAmount.addEventListener('input', updatePotentialReturn);

    // Place bet button
    placeBetBtn.addEventListener('click', () => {
        alert('This is a demo. No real bets are placed.');
        betslip = [];
        updateBetslip();
    });
}

// Handle clicking on odds buttons
function handleOddsClick(e) {
    const matchId = parseInt(e.target.dataset.matchId);
    const betType = e.target.dataset.betType;
    const odds = parseFloat(e.target.textContent);
    const match = matchesData.find(m => m.id === matchId);
    
    if (!match) return;
    
    let betTypeText = betType;
    if (betType === 'home') betTypeText = match.homeTeam;
    if (betType === 'away') betTypeText = match.awayTeam;
    
    // Add to bet slip
    addToBetslip(matchId, match, betType, betTypeText, odds);
    
    // Update the prompt with a suggestion
    promptInput.value = `What are the chances of ${betTypeText} winning in the ${match.homeTeam} vs ${match.awayTeam} match?`;
    
    // Add visual feedback
    e.target.classList.add('selected');
    setTimeout(() => e.target.classList.remove('selected'), 500);
}

// Add selection to betslip
function addToBetslip(matchId, match, betType, betTypeText, odds) {
    // Check if bet for this match already exists
    const existingBetIndex = betslip.findIndex(bet => bet.matchId === matchId);
    
    if (existingBetIndex !== -1) {
        // Replace existing bet
        betslip[existingBetIndex] = {
            matchId,
            match: `${match.homeTeam} vs ${match.awayTeam}`,
            betType,
            betTypeText,
            odds,
            league: match.league
        };
    } else {
        // Add new bet
        betslip.push({
            matchId,
            match: `${match.homeTeam} vs ${match.awayTeam}`,
            betType,
            betTypeText,
            odds,
            league: match.league
        });
    }
    
    updateBetslip();
}

// Update betslip display
function updateBetslip() {
    if (betslip.length === 0) {
        betslipContainer.innerHTML = '<div class="empty-betslip">Your bet slip is empty</div>';
        placeBetBtn.disabled = true;
    } else {
        betslipContainer.innerHTML = '';
        
        betslip.forEach(bet => {
            const betItem = document.createElement('div');
            betItem.className = 'bet-item';
            betItem.innerHTML = `
                <div class="bet-info">
                    <div class="bet-type">${bet.betTypeText}</div>
                    <div class="bet-match">${bet.match}</div>
                    <div class="bet-league">${bet.league}</div>
                </div>
                <div class="bet-odds">${bet.odds.toFixed(2)}</div>
                <div class="remove-bet" data-match-id="${bet.matchId}">×</div>
            `;
            betslipContainer.appendChild(betItem);
        });
        
        // Add remove bet listeners
        document.querySelectorAll('.remove-bet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matchId = parseInt(e.target.dataset.matchId);
                betslip = betslip.filter(bet => bet.matchId !== matchId);
                updateBetslip();
            });
        });
        
        placeBetBtn.disabled = false;
    }
    
    updatePotentialReturn();
}

// Update potential return amount
function updatePotentialReturn() {
    if (betslip.length === 0) {
        potentialReturn.textContent = '$0.00';
        return;
    }
    
    const stake = parseFloat(stakeAmount.value) || 0;
    
    // Calculate total odds (multiply all odds for accumulator bet)
    const totalOdds = betslip.reduce((total, bet) => total * bet.odds, 1);
    
    // Calculate potential return
    const returns = stake * totalOdds;
    
    potentialReturn.textContent = '$' + returns.toFixed(2);
}

// Handle generating AI response
async function handleGenerateResponse() {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert("Please enter a question for the AI");
        return;
    }
    
    // Show loading indicator
    aiResponse.innerHTML = '<div class="loading">Analyzing sports data...</div>';
    
    try {
        // Generate enhanced prompt with sports data
        const enhancedPrompt = await sportsData.generateEnhancedPrompt(prompt);
        
        // Call the API function from api.js
        if (typeof generateAIResponse === 'function') {
            generateAIResponse(enhancedPrompt)
                .then(response => {
                    displayAIResponse(response);
                })
                .catch(error => {
                    console.error("Error in AI response:", error);
                    aiResponse.innerHTML = `<div class="error">Error: ${error.message || 'Failed to generate response'}</div>`;
                    
                    setTimeout(() => {
                        const fallbackResponse = "Unable to generate a response at this time. Please try again later.";
                        displayAIResponse(fallbackResponse);
                    }, 1500);
                });
        } else {
            // Fallback if API function not available
            displayAIResponse("AI analysis function is not available. This is a demo with limited functionality.");
        }
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        aiResponse.innerHTML = `<div class="error">Error: ${error.message || 'Failed to generate response'}</div>`;
        
        setTimeout(() => {
            displayAIResponse("Unable to analyze the data at this time. Please try again later.");
        }, 1500);
    }
}

// Display AI response
function displayAIResponse(response) {
    aiResponse.innerHTML = '';
    
    const responseElement = document.createElement('div');
    responseElement.className = 'ai-text';
    responseElement.textContent = response;
    
    aiResponse.appendChild(responseElement);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 