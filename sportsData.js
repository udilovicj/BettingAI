/**
 * SportsData - Data layer for the BettingAI platform
 * Connects the SportsAPI with the UI
 */
class SportsData {
    constructor() {
        this.api = new SportsAPI();
        this.activeSport = 'football';
        this.activeLeague = 2021; // Premier League by default
        this.teams = [];
        this.matches = [];
        this.matchDetails = {};
        this.teamStats = {};
        this.favoritesMap = this._loadFavorites();
        
        // Date ranges for matches
        const today = new Date();
        this.dateFrom = today.toISOString().split('T')[0];
        
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        this.dateTo = nextWeek.toISOString().split('T')[0];
    }
    
    /**
     * Load user favorites from localStorage
     * @private 
     */
    _loadFavorites() {
        try {
            const saved = localStorage.getItem('bettingAI_favorites');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading favorites:', e);
            return {};
        }
    }
    
    /**
     * Save favorites to localStorage
     * @private
     */
    _saveFavorites() {
        try {
            localStorage.setItem('bettingAI_favorites', JSON.stringify(this.favoritesMap));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }
    
    /**
     * Toggle a team as favorite
     * @param {string} sport - Sport name
     * @param {number} teamId - Team ID
     * @returns {boolean} - Whether team is now a favorite
     */
    toggleFavorite(sport, teamId) {
        const key = `${sport}_${teamId}`;
        if (this.favoritesMap[key]) {
            delete this.favoritesMap[key];
        } else {
            this.favoritesMap[key] = true;
        }
        this._saveFavorites();
        return !!this.favoritesMap[key];
    }
    
    /**
     * Check if a team is favorite
     * @param {string} sport - Sport name
     * @param {number} teamId - Team ID
     * @returns {boolean} - Whether team is a favorite
     */
    isFavorite(sport, teamId) {
        return !!this.favoritesMap[`${sport}_${teamId}`];
    }
    
    /**
     * Load all supported leagues
     * @returns {Promise<Array>} - List of leagues
     */
    async loadLeagues() {
        return await this.api.getLeagues(this.activeSport);
    }
    
    /**
     * Set the active sport
     * @param {string} sport - Sport name
     */
    setActiveSport(sport) {
        this.activeSport = sport;
        // Reset league to a valid one for this sport
        this.activeLeague = this.api.leagues[sport][0].id;
    }
    
    /**
     * Set the active league
     * @param {number} leagueId - League ID
     */
    setActiveLeague(leagueId) {
        this.activeLeague = leagueId;
    }
    
    /**
     * Load all teams for current league
     * @returns {Promise<Array>} - List of teams
     */
    async loadTeams() {
        this.teams = await this.api.getTeams(this.activeSport, this.activeLeague);
        return this.teams;
    }
    
    /**
     * Load upcoming matches
     * @returns {Promise<Array>} - List of matches
     */
    async loadMatches() {
        this.matches = await this.api.getMatches(
            this.activeSport,
            this.activeLeague,
            this.dateFrom,
            this.dateTo
        );
        
        // Format for UI
        return this.matches.map(match => this._formatMatchForUI(match));
    }
    
    /**
     * Format a match object for UI display
     * @param {Object} match - Match data
     * @returns {Object} - Formatted match
     * @private
     */
    _formatMatchForUI(match) {
        const today = new Date();
        const matchDate = new Date(match.utcDate || match.date);
        
        const isToday = matchDate.toDateString() === today.toDateString();
        const isTomorrow = new Date(today.setDate(today.getDate() + 1)).toDateString() === matchDate.toDateString();
        
        const timeString = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const datePrefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : matchDate.toLocaleDateString();
        
        // Different sports have different match structures
        if (this.activeSport === 'football') {
            return {
                id: match.id,
                homeTeam: match.homeTeam.name,
                awayTeam: match.awayTeam.name,
                homeTeamId: match.homeTeam.id,
                awayTeamId: match.awayTeam.id,
                homeTeamLogo: match.homeTeam.crest,
                awayTeamLogo: match.awayTeam.crest,
                time: `${datePrefix}, ${timeString}`,
                date: matchDate,
                status: match.status,
                league: match.competition.name,
                leagueId: match.competition.id,
                score: {
                    home: match.score?.fullTime?.home !== null ? match.score.fullTime.home : '-',
                    away: match.score?.fullTime?.away !== null ? match.score.fullTime.away : '-'
                },
                odds: this._getMatchOdds(match)
            };
        } else {
            // Generic format for other sports
            return {
                id: match.id,
                homeTeam: match.homeTeam.name,
                awayTeam: match.awayTeam.name,
                homeTeamId: match.homeTeam.id,
                awayTeamId: match.awayTeam.id,
                time: `${datePrefix}, ${timeString}`,
                date: matchDate,
                status: match.status,
                league: match.competition.name,
                leagueId: match.competition.id,
                score: {
                    home: match.homeTeam.score !== undefined ? match.homeTeam.score : '-',
                    away: match.awayTeam.score !== undefined ? match.awayTeam.score : '-'
                },
                odds: this._getMatchOdds(match)
            };
        }
    }
    
    /**
     * Get match odds or use defaults if not available
     * @param {Object} match - Match data
     * @returns {Object} - Odds
     * @private
     */
    _getMatchOdds(match) {
        // If odds are provided by the API, use them
        if (match.odds && match.odds.home !== undefined && 
            match.odds.draw !== undefined && match.odds.away !== undefined) {
            return {
                home: parseFloat(match.odds.home) || 1.0,
                draw: parseFloat(match.odds.draw) || 1.0,
                away: parseFloat(match.odds.away) || 1.0
            };
        }
        
        // If no odds are available, use neutral values
        return {
            home: 1.0,
            draw: 1.0,
            away: 1.0
        };
    }
    
    /**
     * Load matches for a specific team
     * @param {number} teamId - Team ID
     * @returns {Promise<Array>} - List of matches
     */
    async loadTeamMatches(teamId) {
        // Filter all matches to find those involving this team
        if (this.matches.length === 0) {
            await this.loadMatches();
        }
        
        return this.matches
            .filter(match => {
                return match.homeTeam.id === teamId || match.awayTeam.id === teamId;
            })
            .map(match => this._formatMatchForUI(match));
    }
    
    /**
     * Load team statistics
     * @param {number} teamId - Team ID
     * @returns {Promise<Object>} - Team statistics
     */
    async loadTeamStats(teamId) {
        if (this.teamStats[teamId]) {
            return this.teamStats[teamId];
        }
        
        const currentYear = new Date().getFullYear();
        const stats = await this.api.getTeamStats(this.activeSport, teamId, currentYear);
        
        this.teamStats[teamId] = stats;
        return stats;
    }
    
    /**
     * Load match details
     * @param {number} matchId - Match ID
     * @returns {Promise<Object>} - Match details
     */
    async loadMatchDetails(matchId) {
        if (this.matchDetails[matchId]) {
            return this.matchDetails[matchId];
        }
        
        const details = await this.api.getMatchDetails(this.activeSport, matchId);
        
        this.matchDetails[matchId] = details;
        return details;
    }
    
    /**
     * Load players for a team
     * @param {number} teamId - Team ID
     * @returns {Promise<Array>} - List of players
     */
    async loadTeamPlayers(teamId) {
        return await this.api.getPlayers(this.activeSport, teamId);
    }
    
    /**
     * Find teams by name
     * @param {string} query - Search query
     * @returns {Promise<Array>} - List of matching teams
     */
    async searchTeams(query) {
        if (!query) return [];
        
        if (this.teams.length === 0) {
            await this.loadTeams();
        }
        
        const searchTerm = query.toLowerCase();
        return this.teams.filter(team => {
            return team.name.toLowerCase().includes(searchTerm) || 
                   (team.shortName && team.shortName.toLowerCase().includes(searchTerm));
        });
    }
    
    /**
     * Set the date range for matches
     * @param {string} from - Start date (YYYY-MM-DD)
     * @param {string} to - End date (YYYY-MM-DD)
     */
    setDateRange(from, to) {
        this.dateFrom = from;
        this.dateTo = to;
    }
    
    /**
     * Generate AI prompt with enhanced sports data
     * @param {string} userPrompt - Original user prompt
     * @returns {Promise<string>} - Enhanced prompt
     */
    async generateEnhancedPrompt(userPrompt) {
        // Extract team names from the prompt
        const teamMentions = [];
        
        // Look for team names in our data
        if (this.teams.length === 0) {
            await this.loadTeams();
        }
        
        const lowerPrompt = userPrompt.toLowerCase();
        this.teams.forEach(team => {
            if (lowerPrompt.includes(team.name.toLowerCase()) || 
                (team.shortName && lowerPrompt.includes(team.shortName.toLowerCase()))) {
                teamMentions.push({
                    id: team.id,
                    name: team.name
                });
            }
        });
        
        // If no teams found in current league, try all matches
        if (teamMentions.length === 0 && this.matches.length > 0) {
            this.matches.forEach(match => {
                const homeTeamName = match.homeTeam.name || match.homeTeam;
                const awayTeamName = match.awayTeam.name || match.awayTeam;
                
                if (lowerPrompt.includes(homeTeamName.toLowerCase())) {
                    teamMentions.push({
                        id: match.homeTeam.id || 0,
                        name: homeTeamName
                    });
                }
                
                if (lowerPrompt.includes(awayTeamName.toLowerCase())) {
                    teamMentions.push({
                        id: match.awayTeam.id || 0,
                        name: awayTeamName
                    });
                }
            });
        }
        
        // Remove duplicates
        const uniqueTeams = [];
        teamMentions.forEach(team => {
            if (!uniqueTeams.some(t => t.id === team.id)) {
                uniqueTeams.push(team);
            }
        });
        
        // If we found teams, enhance the prompt with their stats
        let enhancedPrompt = userPrompt;
        
        if (uniqueTeams.length > 0) {
            enhancedPrompt += "\n\nTeam Statistics:\n";
            
            for (const team of uniqueTeams) {
                if (team.id) {
                    try {
                        const stats = await this.loadTeamStats(team.id);
                        if (stats) {
                            enhancedPrompt += `\n${team.name}:\n`;
                            enhancedPrompt += JSON.stringify(stats, null, 2);
                            enhancedPrompt += "\n";
                        }
                    } catch (e) {
                        console.error(`Error loading stats for ${team.name}:`, e);
                    }
                }
            }
        }
        
        return enhancedPrompt;
    }
}

// Export the class
window.SportsData = SportsData; 