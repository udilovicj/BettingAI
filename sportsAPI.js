/**
 * SportsAPI - JavaScript implementation inspired by Sportsipy
 * A comprehensive sports data API client
 */
class SportsAPI {
    constructor() {
        // Base URLs for different sports data APIs
        this.endpoints = {
            football: 'https://api.football-data.org/v4',
            nba: 'https://api.balldontlie.io/v1',
            mlb: 'https://statsapi.mlb.com/api/v1',
            nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
            nhl: 'https://statsapi.web.nhl.com/api/v1'
        };
        
        // API keys (would typically be stored securely on a backend)
        this.apiKeys = {
            football: 'YOUR_FOOTBALL_API_KEY',
            // Most other APIs don't require keys for basic access
        };
        
        // Cache to reduce duplicate API calls
        this.cache = {
            leagues: {},
            teams: {},
            matches: {},
            players: {},
            stats: {}
        };
        
        // Initialize leagues data structure
        this.leagues = {
            football: [
                { id: 2021, name: 'Premier League', country: 'England' },
                { id: 2014, name: 'La Liga', country: 'Spain' },
                { id: 2019, name: 'Serie A', country: 'Italy' },
                { id: 2002, name: 'Bundesliga', country: 'Germany' },
                { id: 2015, name: 'Ligue 1', country: 'France' },
                { id: 2001, name: 'UEFA Champions League', country: 'Europe' }
            ],
            nba: [
                { id: 0, name: 'NBA', country: 'USA' }
            ],
            mlb: [
                { id: 103, name: 'American League', country: 'USA' },
                { id: 104, name: 'National League', country: 'USA' }
            ],
            nfl: [
                { id: 1, name: 'AFC', country: 'USA' },
                { id: 2, name: 'NFC', country: 'USA' }
            ],
            nhl: [
                { id: 0, name: 'NHL', country: 'USA/Canada' }
            ]
        };
    }
    
    /**
     * Get all supported leagues for a sport
     * @param {string} sport - The sport to get leagues for
     * @returns {Promise<Array>} - List of leagues
     */
    async getLeagues(sport) {
        // Check cache first
        if (this.cache.leagues[sport]) {
            return this.cache.leagues[sport];
        }
        
        // For most sports, we'll use predefined leagues
        if (this.leagues[sport]) {
            this.cache.leagues[sport] = this.leagues[sport];
            return this.leagues[sport];
        }
        
        // For football, we could fetch all competitions
        if (sport === 'football') {
            try {
                const headers = new Headers();
                headers.append('X-Auth-Token', this.apiKeys.football);
                
                const response = await fetch(`${this.endpoints.football}/competitions`, { headers });
                const data = await response.json();
                
                const leagues = data.competitions.map(comp => ({
                    id: comp.id,
                    name: comp.name,
                    country: comp.area.name
                }));
                
                this.cache.leagues[sport] = leagues;
                return leagues;
            } catch (error) {
                console.error(`Error fetching ${sport} leagues:`, error);
                return this.leagues[sport] || [];
            }
        }
        
        return [];
    }
    
    /**
     * Get all teams for a specific league
     * @param {string} sport - Sport name
     * @param {number} leagueId - League ID
     * @returns {Promise<Array>} - List of teams
     */
    async getTeams(sport, leagueId) {
        const cacheKey = `${sport}_${leagueId}`;
        
        // Check cache first
        if (this.cache.teams[cacheKey]) {
            return this.cache.teams[cacheKey];
        }
        
        // MOCK DATA for testing
        if (sport === 'football') {
            console.log('Using mock football teams data');
            const mockTeams = [
                {
                    id: 1,
                    name: "Manchester United",
                    shortName: "Man United",
                    tla: "MUN",
                    crest: "https://crests.football-data.org/66.svg"
                },
                {
                    id: 2,
                    name: "Liverpool",
                    shortName: "Liverpool",
                    tla: "LIV",
                    crest: "https://crests.football-data.org/64.svg"
                },
                {
                    id: 3,
                    name: "Arsenal",
                    shortName: "Arsenal",
                    tla: "ARS",
                    crest: "https://crests.football-data.org/57.svg"
                },
                {
                    id: 4,
                    name: "Chelsea",
                    shortName: "Chelsea",
                    tla: "CHE",
                    crest: "https://crests.football-data.org/61.svg"
                },
                {
                    id: 5,
                    name: "Manchester City",
                    shortName: "Man City",
                    tla: "MCI",
                    crest: "https://crests.football-data.org/65.svg"
                },
                {
                    id: 6,
                    name: "Tottenham Hotspur",
                    shortName: "Spurs",
                    tla: "TOT",
                    crest: "https://crests.football-data.org/73.svg"
                },
                {
                    id: 7,
                    name: "Newcastle United",
                    shortName: "Newcastle",
                    tla: "NEW",
                    crest: "https://crests.football-data.org/67.svg"
                },
                {
                    id: 8,
                    name: "Aston Villa",
                    shortName: "Aston Villa",
                    tla: "AVL",
                    crest: "https://crests.football-data.org/58.svg"
                }
            ];
            
            // Save to cache
            this.cache.teams[cacheKey] = mockTeams;
            return mockTeams;
        }
        
        if (sport === 'nba') {
            console.log('Using mock NBA teams data');
            const mockTeams = [
                {
                    id: 101,
                    name: "Los Angeles Lakers",
                    shortName: "Lakers",
                    abbreviation: "LAL"
                },
                {
                    id: 102,
                    name: "Boston Celtics",
                    shortName: "Celtics",
                    abbreviation: "BOS"
                },
                {
                    id: 103,
                    name: "Golden State Warriors",
                    shortName: "Warriors",
                    abbreviation: "GSW"
                },
                {
                    id: 104,
                    name: "Brooklyn Nets",
                    shortName: "Nets",
                    abbreviation: "BKN"
                }
            ];
            
            // Save to cache
            this.cache.teams[cacheKey] = mockTeams;
            return mockTeams;
        }
        
        // Attempt to get real data
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/competitions/${leagueId}/teams`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                url = `${this.endpoints.nba}/teams`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/teams`;
                break;
                
            case 'nfl':
                url = `${this.endpoints.nfl}/teams`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/teams`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            console.log(`Fetching ${sport} teams from: ${url}`);
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            let teams = this._formatTeamsResponse(sport, data);
            
            // Save to cache
            this.cache.teams[cacheKey] = teams;
            
            return teams;
        } catch (error) {
            console.error(`Error fetching ${sport} teams:`, error);
            return [];
        }
    }
    
    /**
     * Get matches/games for a specific league
     * @param {string} sport - Sport name
     * @param {number} leagueId - League ID
     * @param {string} dateFrom - Start date (YYYY-MM-DD)
     * @param {string} dateTo - End date (YYYY-MM-DD)
     * @returns {Promise<Array>} - List of matches
     */
    async getMatches(sport, leagueId, dateFrom, dateTo) {
        const cacheKey = `${sport}_${leagueId}_${dateFrom}_${dateTo}`;
        
        // Check cache first
        if (this.cache.matches[cacheKey]) {
            return this.cache.matches[cacheKey];
        }
        
        // FOR DEMO: Return mock data for testing since API keys are required
        // This will display sample data without requiring API keys
        if (sport === 'football') {
            console.log('Using mock football data for testing');
            const mockMatches = [
                {
                    id: 1001,
                    utcDate: new Date(new Date().getTime() + 3600000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 1,
                        name: "Manchester United",
                        shortName: "Man United",
                        crest: "https://crests.football-data.org/66.svg"
                    },
                    awayTeam: {
                        id: 2,
                        name: "Liverpool",
                        shortName: "Liverpool",
                        crest: "https://crests.football-data.org/64.svg"
                    },
                    score: { fullTime: { home: null, away: null } },
                    competition: {
                        id: leagueId,
                        name: "Premier League",
                        emblem: "https://crests.football-data.org/PL.png"
                    }
                },
                {
                    id: 1002,
                    utcDate: new Date(new Date().getTime() + 7200000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 3,
                        name: "Arsenal",
                        shortName: "Arsenal",
                        crest: "https://crests.football-data.org/57.svg"
                    },
                    awayTeam: {
                        id: 4,
                        name: "Chelsea",
                        shortName: "Chelsea",
                        crest: "https://crests.football-data.org/61.svg"
                    },
                    score: { fullTime: { home: null, away: null } },
                    competition: {
                        id: leagueId,
                        name: "Premier League",
                        emblem: "https://crests.football-data.org/PL.png"
                    }
                },
                {
                    id: 1003,
                    utcDate: new Date(new Date().getTime() + 10800000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 5,
                        name: "Manchester City",
                        shortName: "Man City",
                        crest: "https://crests.football-data.org/65.svg"
                    },
                    awayTeam: {
                        id: 6,
                        name: "Tottenham Hotspur",
                        shortName: "Spurs",
                        crest: "https://crests.football-data.org/73.svg"
                    },
                    score: { fullTime: { home: null, away: null } },
                    competition: {
                        id: leagueId,
                        name: "Premier League",
                        emblem: "https://crests.football-data.org/PL.png" 
                    }
                },
                {
                    id: 1004,
                    utcDate: new Date(new Date().getTime() + 14400000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 7,
                        name: "Newcastle United",
                        shortName: "Newcastle",
                        crest: "https://crests.football-data.org/67.svg"
                    },
                    awayTeam: {
                        id: 8,
                        name: "Aston Villa",
                        shortName: "Aston Villa",
                        crest: "https://crests.football-data.org/58.svg"
                    },
                    score: { fullTime: { home: null, away: null } },
                    competition: {
                        id: leagueId,
                        name: "Premier League",
                        emblem: "https://crests.football-data.org/PL.png"
                    }
                }
            ];
            
            // Save to cache
            this.cache.matches[cacheKey] = mockMatches;
            return mockMatches;
        }
        
        // For NBA
        if (sport === 'nba') {
            console.log('Using mock NBA data for testing');
            const mockMatches = [
                {
                    id: 2001,
                    date: new Date(new Date().getTime() + 3600000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 101,
                        name: "Los Angeles Lakers",
                        abbreviation: "LAL",
                        score: null
                    },
                    awayTeam: {
                        id: 102,
                        name: "Boston Celtics",
                        abbreviation: "BOS",
                        score: null
                    },
                    competition: {
                        id: leagueId,
                        name: "NBA"
                    }
                },
                {
                    id: 2002,
                    date: new Date(new Date().getTime() + 7200000).toISOString(),
                    status: "SCHEDULED",
                    homeTeam: {
                        id: 103,
                        name: "Golden State Warriors",
                        abbreviation: "GSW",
                        score: null
                    },
                    awayTeam: {
                        id: 104,
                        name: "Brooklyn Nets",
                        abbreviation: "BKN",
                        score: null
                    },
                    competition: {
                        id: leagueId,
                        name: "NBA"
                    }
                }
            ];
            
            // Save to cache
            this.cache.matches[cacheKey] = mockMatches;
            return mockMatches;
        }
        
        // Attempt to get real data if mock data isn't provided
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/competitions/${leagueId}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                url = `${this.endpoints.nba}/games?start_date=${dateFrom}&end_date=${dateTo}`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/schedule?sportId=1&startDate=${dateFrom}&endDate=${dateTo}`;
                break;
                
            case 'nfl':
                // ESPN API requires different date format and has different endpoints
                const year = new Date(dateFrom).getFullYear();
                url = `${this.endpoints.nfl}/scoreboard?dates=${year}`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/schedule?startDate=${dateFrom}&endDate=${dateTo}`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            console.log(`Fetching ${sport} matches from: ${url}`);
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            let matches = this._formatMatchesResponse(sport, data, leagueId);
            
            // If odds are not provided by the API, we need to handle this case
            matches = matches.map(match => {
                if (!match.odds) {
                    match.odds = {
                        home: 0,
                        draw: 0, 
                        away: 0
                    };
                }
                return match;
            });
            
            // Save to cache
            this.cache.matches[cacheKey] = matches;
            
            return matches;
        } catch (error) {
            console.error(`Error fetching ${sport} matches:`, error);
            // Return empty array if API call fails
            return [];
        }
    }
    
    /**
     * Get details about a specific match/game
     * @param {string} sport - Sport name
     * @param {number} matchId - Match ID
     * @returns {Promise<Object>} - Match details
     */
    async getMatchDetails(sport, matchId) {
        const cacheKey = `${sport}_match_${matchId}`;
        
        // Check cache first
        if (this.cache.matches[cacheKey]) {
            return this.cache.matches[cacheKey];
        }
        
        // MOCK DATA for testing
        if (sport === 'football' && matchId) {
            console.log('Using mock match details data');
            const mockMatchDetails = {
                id: matchId,
                utcDate: new Date(new Date().getTime() + 86400000).toISOString(),
                status: "SCHEDULED",
                matchday: 30,
                stage: "REGULAR_SEASON",
                homeTeam: {
                    id: 1,
                    name: "Manchester United",
                    shortName: "Man United",
                    crest: "https://crests.football-data.org/66.svg",
                    coach: { name: "Erik ten Hag", nationality: "Netherlands" },
                    lineup: [
                        { id: 101, name: "David de Gea", position: "Goalkeeper" },
                        { id: 102, name: "Aaron Wan-Bissaka", position: "Defender" },
                        { id: 103, name: "Raphael Varane", position: "Defender" },
                        { id: 104, name: "Lisandro Martinez", position: "Defender" }
                    ]
                },
                awayTeam: {
                    id: 2,
                    name: "Liverpool",
                    shortName: "Liverpool",
                    crest: "https://crests.football-data.org/64.svg",
                    coach: { name: "Jürgen Klopp", nationality: "Germany" },
                    lineup: [
                        { id: 201, name: "Alisson", position: "Goalkeeper" },
                        { id: 202, name: "Trent Alexander-Arnold", position: "Defender" },
                        { id: 203, name: "Virgil van Dijk", position: "Defender" },
                        { id: 204, name: "Andrew Robertson", position: "Defender" }
                    ]
                },
                score: {
                    winner: null,
                    fullTime: { home: null, away: null },
                    halfTime: { home: null, away: null }
                },
                venue: "Old Trafford",
                attendance: 74000,
                headToHead: {
                    totalMatches: 12,
                    homeWins: 5,
                    awayWins: 4,
                    draws: 3
                }
            };
            
            // Save to cache
            this.cache.matches[cacheKey] = mockMatchDetails;
            return mockMatchDetails;
        }
        
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/matches/${matchId}`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                url = `${this.endpoints.nba}/games/${matchId}`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/game/${matchId}/boxscore`;
                break;
                
            case 'nfl':
                url = `${this.endpoints.nfl}/summary?event=${matchId}`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/game/${matchId}/boxscore`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            console.log(`Fetching ${sport} match details from: ${url}`);
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            const matchDetails = this._formatMatchDetailsResponse(sport, data);
            
            // Save to cache
            this.cache.matches[cacheKey] = matchDetails;
            
            return matchDetails;
        } catch (error) {
            console.error(`Error fetching ${sport} match details:`, error);
            return null;
        }
    }
    
    /**
     * Get team statistics for a season
     * @param {string} sport - Sport name
     * @param {number} teamId - Team ID
     * @param {number} season - Season year
     * @returns {Promise<Object>} - Team statistics
     */
    async getTeamStats(sport, teamId, season) {
        const cacheKey = `${sport}_team_${teamId}_${season}`;
        
        // Check cache first
        if (this.cache.stats[cacheKey]) {
            return this.cache.stats[cacheKey];
        }
        
        // MOCK DATA for testing
        if (sport === 'football') {
            console.log('Using mock football team stats data');
            
            // Different stats based on team
            let mockStats;
            
            switch(teamId) {
                case 1: // Manchester United
                    mockStats = {
                        played: 28,
                        wins: 16,
                        draws: 6,
                        losses: 6,
                        goalsFor: 48,
                        goalsAgainst: 33,
                        cleanSheets: 9,
                        points: 54,
                        goalDifference: 15,
                        winRate: 57.1,
                        form: ["W", "D", "W", "L", "W"]
                    };
                    break;
                case 2: // Liverpool
                    mockStats = {
                        played: 29,
                        wins: 19,
                        draws: 7,
                        losses: 3,
                        goalsFor: 65,
                        goalsAgainst: 26,
                        cleanSheets: 12,
                        points: 64,
                        goalDifference: 39,
                        winRate: 65.5,
                        form: ["W", "W", "W", "D", "W"]
                    };
                    break;
                case 3: // Arsenal
                    mockStats = {
                        played: 29,
                        wins: 21,
                        draws: 4,
                        losses: 4,
                        goalsFor: 70,
                        goalsAgainst: 24,
                        cleanSheets: 11,
                        points: 67,
                        goalDifference: 46,
                        winRate: 72.4,
                        form: ["W", "W", "W", "L", "W"]
                    };
                    break;
                case 4: // Chelsea
                    mockStats = {
                        played: 28,
                        wins: 11,
                        draws: 7,
                        losses: 10,
                        goalsFor: 44,
                        goalsAgainst: 39,
                        cleanSheets: 8,
                        points: 40,
                        goalDifference: 5,
                        winRate: 39.3,
                        form: ["L", "W", "L", "D", "W"]
                    };
                    break;
                case 5: // Manchester City
                    mockStats = {
                        played: 28,
                        wins: 20,
                        draws: 5,
                        losses: 3,
                        goalsFor: 67,
                        goalsAgainst: 26,
                        cleanSheets: 10,
                        points: 65,
                        goalDifference: 41,
                        winRate: 71.4,
                        form: ["W", "W", "D", "W", "W"]
                    };
                    break;
                default:
                    mockStats = {
                        played: 28,
                        wins: 12,
                        draws: 8,
                        losses: 8,
                        goalsFor: 42,
                        goalsAgainst: 40,
                        cleanSheets: 7,
                        points: 44,
                        goalDifference: 2,
                        winRate: 42.9,
                        form: ["W", "L", "D", "W", "L"]
                    };
            }
            
            // Save to cache
            this.cache.stats[cacheKey] = mockStats;
            return mockStats;
        }
        
        if (sport === 'nba') {
            console.log('Using mock NBA team stats data');
            
            const mockStats = {
                wins: 42,
                losses: 30,
                winPercentage: 0.583,
                pointsPerGame: 115.7,
                reboundsPerGame: 44.2,
                assistsPerGame: 25.8,
                stealsPerGame: 7.5,
                blocksPerGame: 5.2,
                turnoversPerGame: 13.5,
                fieldGoalPercentage: 47.6,
                threePointPercentage: 36.2,
                freeThrowPercentage: 78.3,
                form: ["W", "W", "L", "W", "L"]
            };
            
            // Save to cache
            this.cache.stats[cacheKey] = mockStats;
            return mockStats;
        }
        
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/teams/${teamId}/matches?season=${season}`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                url = `${this.endpoints.nba}/teams/${teamId}/stats?seasons[]=${season}`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/teams/${teamId}/stats?stats=season&season=${season}`;
                break;
                
            case 'nfl':
                url = `${this.endpoints.nfl}/teams/${teamId}/statistics?season=${season}`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/teams/${teamId}/stats?season=${season}`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            console.log(`Fetching ${sport} team stats from: ${url}`);
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            let stats = this._formatTeamStatsResponse(sport, data);
            
            if (sport === 'football') {
                // For football, process the matches to calculate stats
                stats = this._calculateFootballTeamStats(data);
            }
            
            // Save to cache
            this.cache.stats[cacheKey] = stats;
            
            return stats;
        } catch (error) {
            console.error(`Error fetching ${sport} team stats:`, error);
            return null;
        }
    }
    
    /**
     * Get players for a team
     * @param {string} sport - Sport name
     * @param {number} teamId - Team ID
     * @returns {Promise<Array>} - List of players
     */
    async getPlayers(sport, teamId) {
        const cacheKey = `${sport}_players_${teamId}`;
        
        // Check cache first
        if (this.cache.players[cacheKey]) {
            return this.cache.players[cacheKey];
        }
        
        // MOCK DATA for testing
        if (sport === 'football') {
            console.log('Using mock football players data');
            
            let mockPlayers;
            
            switch(teamId) {
                case 1: // Manchester United
                    mockPlayers = [
                        { id: 101, name: "David de Gea", position: "Goalkeeper", nationality: "Spain", dateOfBirth: "1990-11-07", shirtNumber: 1 },
                        { id: 102, name: "Aaron Wan-Bissaka", position: "Defender", nationality: "England", dateOfBirth: "1997-11-26", shirtNumber: 29 },
                        { id: 103, name: "Raphael Varane", position: "Defender", nationality: "France", dateOfBirth: "1993-04-25", shirtNumber: 19 },
                        { id: 104, name: "Lisandro Martinez", position: "Defender", nationality: "Argentina", dateOfBirth: "1998-01-18", shirtNumber: 6 },
                        { id: 105, name: "Luke Shaw", position: "Defender", nationality: "England", dateOfBirth: "1995-07-12", shirtNumber: 23 },
                        { id: 106, name: "Casemiro", position: "Midfielder", nationality: "Brazil", dateOfBirth: "1992-02-23", shirtNumber: 18 },
                        { id: 107, name: "Bruno Fernandes", position: "Midfielder", nationality: "Portugal", dateOfBirth: "1994-09-08", shirtNumber: 8 },
                        { id: 108, name: "Mason Mount", position: "Midfielder", nationality: "England", dateOfBirth: "1999-01-10", shirtNumber: 7 },
                        { id: 109, name: "Marcus Rashford", position: "Attacker", nationality: "England", dateOfBirth: "1997-10-31", shirtNumber: 10 },
                        { id: 110, name: "Rasmus Højlund", position: "Attacker", nationality: "Denmark", dateOfBirth: "2003-02-04", shirtNumber: 11 },
                        { id: 111, name: "Antony", position: "Attacker", nationality: "Brazil", dateOfBirth: "2000-02-24", shirtNumber: 21 }
                    ];
                    break;
                case 2: // Liverpool
                    mockPlayers = [
                        { id: 201, name: "Alisson", position: "Goalkeeper", nationality: "Brazil", dateOfBirth: "1992-10-02", shirtNumber: 1 },
                        { id: 202, name: "Trent Alexander-Arnold", position: "Defender", nationality: "England", dateOfBirth: "1998-10-07", shirtNumber: 66 },
                        { id: 203, name: "Virgil van Dijk", position: "Defender", nationality: "Netherlands", dateOfBirth: "1991-07-08", shirtNumber: 4 },
                        { id: 204, name: "Andrew Robertson", position: "Defender", nationality: "Scotland", dateOfBirth: "1994-03-11", shirtNumber: 26 },
                        { id: 205, name: "Ibrahima Konaté", position: "Defender", nationality: "France", dateOfBirth: "1999-05-25", shirtNumber: 5 },
                        { id: 206, name: "Alexis Mac Allister", position: "Midfielder", nationality: "Argentina", dateOfBirth: "1998-12-24", shirtNumber: 10 },
                        { id: 207, name: "Dominik Szoboszlai", position: "Midfielder", nationality: "Hungary", dateOfBirth: "2000-10-25", shirtNumber: 8 },
                        { id: 208, name: "Ryan Gravenberch", position: "Midfielder", nationality: "Netherlands", dateOfBirth: "2002-05-16", shirtNumber: 38 },
                        { id: 209, name: "Mohamed Salah", position: "Attacker", nationality: "Egypt", dateOfBirth: "1992-06-15", shirtNumber: 11 },
                        { id: 210, name: "Luis Díaz", position: "Attacker", nationality: "Colombia", dateOfBirth: "1997-01-13", shirtNumber: 7 },
                        { id: 211, name: "Darwin Núñez", position: "Attacker", nationality: "Uruguay", dateOfBirth: "1999-06-24", shirtNumber: 9 }
                    ];
                    break;
                default:
                    mockPlayers = [
                        { id: 901, name: "Goalkeeper", position: "Goalkeeper", nationality: "England", dateOfBirth: "1990-01-01", shirtNumber: 1 },
                        { id: 902, name: "Defender 1", position: "Defender", nationality: "England", dateOfBirth: "1992-01-01", shirtNumber: 2 },
                        { id: 903, name: "Defender 2", position: "Defender", nationality: "France", dateOfBirth: "1993-01-01", shirtNumber: 3 },
                        { id: 904, name: "Defender 3", position: "Defender", nationality: "Spain", dateOfBirth: "1994-01-01", shirtNumber: 4 },
                        { id: 905, name: "Midfielder 1", position: "Midfielder", nationality: "Brazil", dateOfBirth: "1995-01-01", shirtNumber: 6 },
                        { id: 906, name: "Midfielder 2", position: "Midfielder", nationality: "Argentina", dateOfBirth: "1996-01-01", shirtNumber: 8 },
                        { id: 907, name: "Midfielder 3", position: "Midfielder", nationality: "Germany", dateOfBirth: "1997-01-01", shirtNumber: 10 },
                        { id: 908, name: "Forward 1", position: "Attacker", nationality: "Portugal", dateOfBirth: "1998-01-01", shirtNumber: 7 },
                        { id: 909, name: "Forward 2", position: "Attacker", nationality: "Italy", dateOfBirth: "1999-01-01", shirtNumber: 9 },
                        { id: 910, name: "Forward 3", position: "Attacker", nationality: "Belgium", dateOfBirth: "2000-01-01", shirtNumber: 11 }
                    ];
            }
            
            // Save to cache
            this.cache.players[cacheKey] = mockPlayers;
            return mockPlayers;
        }
        
        if (sport === 'nba') {
            console.log('Using mock NBA players data');
            
            const mockPlayers = [
                { id: 301, name: "LeBron James", position: "Forward", number: 23, height: "6-9", weight: 250, team: "Los Angeles Lakers" },
                { id: 302, name: "Anthony Davis", position: "Forward-Center", number: 3, height: "6-10", weight: 253, team: "Los Angeles Lakers" },
                { id: 303, name: "Austin Reaves", position: "Guard", number: 15, height: "6-5", weight: 197, team: "Los Angeles Lakers" },
                { id: 304, name: "D'Angelo Russell", position: "Guard", number: 1, height: "6-4", weight: 193, team: "Los Angeles Lakers" },
                { id: 305, name: "Jarred Vanderbilt", position: "Forward", number: 2, height: "6-9", weight: 214, team: "Los Angeles Lakers" },
                { id: 306, name: "Rui Hachimura", position: "Forward", number: 28, height: "6-8", weight: 230, team: "Los Angeles Lakers" },
                { id: 307, name: "Gabe Vincent", position: "Guard", number: 7, height: "6-3", weight: 200, team: "Los Angeles Lakers" },
                { id: 308, name: "Taurean Prince", position: "Forward", number: 12, height: "6-7", weight: 218, team: "Los Angeles Lakers" },
                { id: 309, name: "Christian Wood", position: "Center", number: 35, height: "6-9", weight: 214, team: "Los Angeles Lakers" },
                { id: 310, name: "Jaxson Hayes", position: "Center", number: 11, height: "7-0", weight: 220, team: "Los Angeles Lakers" }
            ];
            
            // Save to cache
            this.cache.players[cacheKey] = mockPlayers;
            return mockPlayers;
        }
        
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/teams/${teamId}`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                // NBA API doesn't have a direct endpoint for players by team
                // Use workaround with season roster
                url = `${this.endpoints.nba}/players?team_ids[]=${teamId}&per_page=100`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/teams/${teamId}/roster`;
                break;
                
            case 'nfl':
                url = `${this.endpoints.nfl}/teams/${teamId}/roster`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/teams/${teamId}/roster`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            console.log(`Fetching ${sport} players from: ${url}`);
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            const players = this._formatPlayersResponse(sport, data);
            
            // Save to cache
            this.cache.players[cacheKey] = players;
            
            return players;
        } catch (error) {
            console.error(`Error fetching ${sport} players:`, error);
            return [];
        }
    }
    
    /**
     * Get player statistics
     * @param {string} sport - Sport name
     * @param {number} playerId - Player ID
     * @param {number} season - Season year
     * @returns {Promise<Object>} - Player statistics
     */
    async getPlayerStats(sport, playerId, season) {
        const cacheKey = `${sport}_player_${playerId}_${season}`;
        
        // Check cache first
        if (this.cache.stats[cacheKey]) {
            return this.cache.stats[cacheKey];
        }
        
        let url = '';
        const headers = new Headers();
        
        switch(sport) {
            case 'football':
                url = `${this.endpoints.football}/persons/${playerId}`;
                headers.append('X-Auth-Token', this.apiKeys.football);
                break;
                
            case 'nba':
                url = `${this.endpoints.nba}/season_averages?season=${season}&player_ids[]=${playerId}`;
                break;
                
            case 'mlb':
                url = `${this.endpoints.mlb}/people/${playerId}/stats?stats=season&season=${season}`;
                break;
                
            case 'nfl':
                url = `${this.endpoints.nfl}/athletes/${playerId}/statistics?season=${season}`;
                break;
                
            case 'nhl':
                url = `${this.endpoints.nhl}/people/${playerId}/stats?stats=statsSingleSeason&season=${season}`;
                break;
                
            default:
                throw new Error(`Sport '${sport}' not supported`);
        }
        
        try {
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            // Format the response based on sport
            const stats = this._formatPlayerStatsResponse(sport, data);
            
            // Save to cache
            this.cache.stats[cacheKey] = stats;
            
            return stats;
        } catch (error) {
            console.error(`Error fetching ${sport} player stats:`, error);
            return null;
        }
    }
    
    /**
     * Format teams API response to a consistent structure
     * @private
     */
    _formatTeamsResponse(sport, data) {
        switch(sport) {
            case 'football':
                return data.teams.map(team => ({
                    id: team.id,
                    name: team.name,
                    shortName: team.shortName,
                    tla: team.tla,
                    crest: team.crest,
                    address: team.address,
                    website: team.website,
                    founded: team.founded,
                    venue: team.venue,
                    coach: team.coach?.name || null,
                    clubColors: team.clubColors
                }));
                
            case 'nba':
                return data.data.map(team => ({
                    id: team.id,
                    name: team.full_name,
                    shortName: team.name,
                    abbreviation: team.abbreviation,
                    city: team.city,
                    conference: team.conference,
                    division: team.division
                }));
                
            case 'mlb':
                return data.teams.map(team => ({
                    id: team.id,
                    name: team.name,
                    shortName: team.teamName,
                    abbreviation: team.abbreviation,
                    locationName: team.locationName,
                    league: team.league?.name,
                    division: team.division?.name,
                    venue: team.venue?.name
                }));
                
            case 'nfl':
                if (data.sports && data.sports[0] && data.sports[0].leagues) {
                    const allTeams = [];
                    data.sports[0].leagues.forEach(league => {
                        league.teams.forEach(teamData => {
                            const team = teamData.team;
                            allTeams.push({
                                id: team.id,
                                name: team.displayName,
                                shortName: team.name,
                                abbreviation: team.abbreviation,
                                city: team.location,
                                logo: team.logos ? team.logos[0].href : null,
                                conference: league.name,
                                division: team.franchise?.conference?.division?.name || null
                            });
                        });
                    });
                    return allTeams;
                }
                return [];
                
            case 'nhl':
                return data.teams.map(team => ({
                    id: team.id,
                    name: team.name,
                    shortName: team.teamName,
                    abbreviation: team.abbreviation,
                    locationName: team.locationName,
                    division: team.division?.name,
                    conference: team.conference?.name,
                    venue: team.venue?.name
                }));
                
            default:
                return [];
        }
    }
    
    /**
     * Format matches API response to a consistent structure
     * @private
     */
    _formatMatchesResponse(sport, data, leagueId) {
        switch(sport) {
            case 'football':
                if (!data.matches) return [];
                return data.matches.map(match => ({
                    id: match.id,
                    utcDate: match.utcDate,
                    status: match.status,
                    matchday: match.matchday,
                    homeTeam: {
                        id: match.homeTeam.id,
                        name: match.homeTeam.name,
                        shortName: match.homeTeam.shortName,
                        crest: match.homeTeam.crest
                    },
                    awayTeam: {
                        id: match.awayTeam.id,
                        name: match.awayTeam.name,
                        shortName: match.awayTeam.shortName,
                        crest: match.awayTeam.crest
                    },
                    score: match.score,
                    competition: {
                        id: data.competition?.id || leagueId,
                        name: data.competition?.name || this._getLeagueName('football', leagueId),
                        emblem: data.competition?.emblem
                    }
                }));
                
            // Add other sports formatting here, similar to above
            case 'nba':
                if (!data.data) return [];
                return data.data.map(game => ({
                    id: game.id,
                    date: game.date,
                    status: game.status,
                    period: game.period,
                    homeTeam: {
                        id: game.home_team.id,
                        name: game.home_team.full_name,
                        abbreviation: game.home_team.abbreviation,
                        score: game.home_team_score
                    },
                    awayTeam: {
                        id: game.visitor_team.id,
                        name: game.visitor_team.full_name,
                        abbreviation: game.visitor_team.abbreviation,
                        score: game.visitor_team_score
                    },
                    time: game.time,
                    competition: {
                        id: 0,
                        name: 'NBA'
                    }
                }));
                
            case 'mlb':
                if (!data.dates) return [];
                
                const games = [];
                data.dates.forEach(date => {
                    date.games.forEach(game => {
                        games.push({
                            id: game.gamePk,
                            date: game.gameDate,
                            status: game.status.detailedState,
                            homeTeam: {
                                id: game.teams.home.team.id,
                                name: game.teams.home.team.name,
                                score: game.teams.home.score
                            },
                            awayTeam: {
                                id: game.teams.away.team.id,
                                name: game.teams.away.team.name,
                                score: game.teams.away.score
                            },
                            venue: game.venue.name,
                            competition: {
                                id: leagueId,
                                name: this._getLeagueName('mlb', leagueId)
                            }
                        });
                    });
                });
                return games;
                
            // NFL and NHL formatting would follow similar patterns
            
            default:
                return [];
        }
    }
    
    /**
     * Format match details API response
     * @private
     */
    _formatMatchDetailsResponse(sport, data) {
        // Implementation would follow similar pattern to the above methods
        return data;
    }
    
    /**
     * Format team stats API response
     * @private
     */
    _formatTeamStatsResponse(sport, data) {
        // Implementation would follow similar pattern to the above methods
        return data;
    }
    
    /**
     * Format players API response
     * @private
     */
    _formatPlayersResponse(sport, data) {
        switch(sport) {
            case 'football':
                if (!data.squad) return [];
                return data.squad.map(player => ({
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    dateOfBirth: player.dateOfBirth,
                    nationality: player.nationality,
                    shirtNumber: player.shirtNumber
                }));
                
            // Add formatting for other sports
            
            default:
                return [];
        }
    }
    
    /**
     * Format player stats API response
     * @private
     */
    _formatPlayerStatsResponse(sport, data) {
        // Implementation would follow similar pattern to the above methods
        return data;
    }
    
    /**
     * Calculate football team statistics from matches
     * @private
     */
    _calculateFootballTeamStats(matchesData) {
        if (!matchesData.matches) return null;
        
        const stats = {
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            cleanSheets: 0,
            points: 0
        };
        
        // Get the first team ID from the first match to identify "our" team
        const firstMatch = matchesData.matches[0];
        const teamId = firstMatch.homeTeam.id; // Assuming we're looking at a specific team's matches
        
        matchesData.matches.forEach(match => {
            // Only count completed matches
            if (match.status !== 'FINISHED') return;
            
            const isHome = match.homeTeam.id === teamId;
            const ourTeam = isHome ? match.homeTeam : match.awayTeam;
            const opposingTeam = isHome ? match.awayTeam : match.homeTeam;
            
            const ourScore = match.score.fullTime[isHome ? 'home' : 'away'] || 0;
            const opposingScore = match.score.fullTime[isHome ? 'away' : 'home'] || 0;
            
            stats.played++;
            stats.goalsFor += ourScore;
            stats.goalsAgainst += opposingScore;
            
            if (ourScore > opposingScore) {
                stats.wins++;
                stats.points += 3;
            } else if (ourScore === opposingScore) {
                stats.draws++;
                stats.points += 1;
            } else {
                stats.losses++;
            }
            
            if (opposingScore === 0) {
                stats.cleanSheets++;
            }
        });
        
        // Calculate additional stats
        stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
        stats.winRate = stats.played > 0 ? (stats.wins / stats.played * 100).toFixed(1) : 0;
        
        return stats;
    }
    
    /**
     * Get league name from ID
     * @private
     */
    _getLeagueName(sport, leagueId) {
        if (this.leagues[sport]) {
            const league = this.leagues[sport].find(l => l.id === leagueId);
            return league ? league.name : 'Unknown League';
        }
        return 'Unknown League';
    }
    
    /**
     * Clear cache for a specific key or all cache
     * @param {string} cacheType - Type of cache to clear (leagues, teams, matches, players, stats)
     * @param {string} key - Specific key to clear, or all if omitted
     */
    clearCache(cacheType, key) {
        if (!cacheType) {
            // Clear all cache
            this.cache = {
                leagues: {},
                teams: {},
                matches: {},
                players: {},
                stats: {}
            };
            return;
        }
        
        if (!this.cache[cacheType]) return;
        
        if (key) {
            // Clear specific key
            delete this.cache[cacheType][key];
        } else {
            // Clear all cache of this type
            this.cache[cacheType] = {};
        }
    }
}

// Export the class
window.SportsAPI = SportsAPI; 