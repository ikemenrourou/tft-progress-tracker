// TFT Player Search - Riot API Integration
// Uses the provided API key: RGAPI-4ffd66c0-a644-4f36-b84f-3a05a0004446

class PlayerSearch {
    constructor() {
        this.apiKey = 'RGAPI-4ffd66c0-a644-4f36-b84f-3a05a0004446';
        this.regions = {
            americas: 'americas.api.riotgames.com',
            asia: 'asia.api.riotgames.com',
            europe: 'europe.api.riotgames.com'
        };
        this.platforms = {
            americas: 'na1.api.riotgames.com',
            asia: 'kr.api.riotgames.com',
            europe: 'euw1.api.riotgames.com'
        };
        
        this.currentPlayerData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkUrlParams();
    }

    bindEvents() {
        const searchForm = document.getElementById('playerSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchPlayer();
            });
        }
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const gameName = urlParams.get('gameName');
        const tagLine = urlParams.get('tagLine');
        
        if (gameName && tagLine) {
            document.getElementById('playerSearchInput').value = `${gameName}#${tagLine}`;
            this.searchPlayer();
        }
    }

    async searchPlayer() {
        const searchInput = document.getElementById('playerSearchInput');
        const regionSelect = document.getElementById('regionSelect');
        
        const riotId = searchInput.value.trim();
        const region = regionSelect.value;

        if (!riotId) {
            this.showError('Please enter a Riot ID');
            return;
        }

        if (!this.validateRiotId(riotId)) {
            this.showError('Please enter a valid Riot ID (e.g., Faker#KR1)');
            return;
        }

        const [gameName, tagLine] = riotId.split('#');
        
        this.showLoading();
        
        try {
            // Step 1: Get account by Riot ID
            const account = await this.getAccountByRiotId(gameName, tagLine, region);
            
            // Step 2: Get TFT summoner data
            const summoner = await this.getTFTSummoner(account.puuid, region);
            
            // Step 3: Get rank data
            const rankData = await this.getTFTRank(summoner.id, region);
            
            // Step 4: Get match history
            const matchHistory = await this.getMatchHistory(account.puuid, region);
            
            // Step 5: Get match details
            const matchDetails = await this.getMatchDetails(matchHistory.slice(0, 10), region);
            
            // Display results
            this.displayPlayerData({
                account,
                summoner,
                rankData,
                matchDetails
            });
            
        } catch (error) {
            console.error('Search error:', error);
            this.handleSearchError(error);
        }
    }

    async getAccountByRiotId(gameName, tagLine, region) {
        const url = `https://${this.regions[region]}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        return this.makeApiRequest(url);
    }

    async getTFTSummoner(puuid, region) {
        const platform = this.platforms[region];
        const url = `https://${platform}/tft/summoner/v1/summoners/by-puuid/${puuid}`;
        return this.makeApiRequest(url);
    }

    async getTFTRank(summonerId, region) {
        const platform = this.platforms[region];
        const url = `https://${platform}/tft/league/v1/entries/by-summoner/${summonerId}`;
        const data = await this.makeApiRequest(url);
        return data.length > 0 ? data[0] : null;
    }

    async getMatchHistory(puuid, region, count = 20) {
        const url = `https://${this.regions[region]}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
        return this.makeApiRequest(url);
    }

    async getMatchDetails(matchIds, region) {
        const matchPromises = matchIds.map(matchId => 
            this.getMatchDetail(matchId, region)
        );
        
        try {
            return await Promise.all(matchPromises);
        } catch (error) {
            console.warn('Some match details failed to load:', error);
            // Return partial results
            const results = await Promise.allSettled(matchPromises);
            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
        }
    }

    async getMatchDetail(matchId, region) {
        const url = `https://${this.regions[region]}/tft/match/v1/matches/${matchId}`;
        return this.makeApiRequest(url);
    }

    async makeApiRequest(url) {
        const response = await fetch(url, {
            headers: {
                'X-Riot-Token': this.apiKey
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Player not found');
            } else if (response.status === 403) {
                throw new Error('API access forbidden');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later');
            } else {
                throw new Error(`API request failed: ${response.status}`);
            }
        }

        return response.json();
    }

    displayPlayerData(data) {
        const { account, summoner, rankData, matchDetails } = data;
        this.currentPlayerData = data;

        // Update player profile
        document.getElementById('playerName').textContent = account.gameName;
        document.getElementById('playerTag').textContent = `#${account.tagLine}`;
        document.getElementById('playerLevel').textContent = summoner.summonerLevel;

        // Update rank display
        if (rankData) {
            document.getElementById('rankTier').textContent = this.formatRank(rankData.tier, rankData.rank);
            document.getElementById('rankLP').textContent = `${rankData.leaguePoints} LP`;
            
            // Update rank icon based on tier
            const rankIcon = document.getElementById('rankIcon');
            rankIcon.className = `rank-icon ${rankData.tier.toLowerCase()}`;
        } else {
            document.getElementById('rankTier').textContent = 'Unranked';
            document.getElementById('rankLP').textContent = '0 LP';
        }

        // Calculate and display statistics
        this.displayStatistics(matchDetails, account.puuid);

        // Display match history
        this.displayMatchHistory(matchDetails, account.puuid);

        // Show results
        this.hideLoading();
        document.getElementById('playerResults').style.display = 'block';
    }

    displayStatistics(matches, puuid) {
        if (!matches || matches.length === 0) {
            document.getElementById('winRateValue').textContent = 'N/A';
            document.getElementById('avgPlacementValue').textContent = 'N/A';
            document.getElementById('gamesPlayedValue').textContent = '0';
            document.getElementById('top4RateValue').textContent = 'N/A';
            return;
        }

        const playerMatches = matches.map(match => {
            const participant = match.info.participants.find(p => p.puuid === puuid);
            return participant;
        }).filter(p => p);

        const totalGames = playerMatches.length;
        const wins = playerMatches.filter(p => p.placement === 1).length;
        const top4s = playerMatches.filter(p => p.placement <= 4).length;
        const avgPlacement = playerMatches.reduce((sum, p) => sum + p.placement, 0) / totalGames;

        const winRate = totalGames > 0 ? (wins / totalGames * 100) : 0;
        const top4Rate = totalGames > 0 ? (top4s / totalGames * 100) : 0;

        document.getElementById('winRateValue').textContent = `${winRate.toFixed(1)}%`;
        document.getElementById('avgPlacementValue').textContent = avgPlacement.toFixed(1);
        document.getElementById('gamesPlayedValue').textContent = totalGames;
        document.getElementById('top4RateValue').textContent = `${top4Rate.toFixed(1)}%`;
    }

    displayMatchHistory(matches, puuid) {
        const container = document.getElementById('matchHistoryContainer');
        
        if (!matches || matches.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent matches found</p>';
            return;
        }

        const matchElements = matches.map(match => {
            const participant = match.info.participants.find(p => p.puuid === puuid);
            if (!participant) return '';

            const placement = participant.placement;
            const placementClass = placement <= 4 ? 'success' : 'danger';
            const gameLength = this.formatGameLength(match.info.game_length);
            const timeAgo = this.formatTimeAgo(match.info.game_datetime);

            return `
                <div class="match-item">
                    <div class="match-placement placement-${placementClass}">
                        #${placement}
                    </div>
                    <div class="match-info">
                        <div class="match-time">${timeAgo}</div>
                        <div class="match-duration">${gameLength}</div>
                    </div>
                    <div class="match-traits">
                        ${this.formatTraits(participant.traits)}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = matchElements;
    }

    formatRank(tier, rank) {
        if (!tier) return 'Unranked';
        
        const tierNames = {
            'IRON': 'Iron',
            'BRONZE': 'Bronze',
            'SILVER': 'Silver',
            'GOLD': 'Gold',
            'PLATINUM': 'Platinum',
            'DIAMOND': 'Diamond',
            'MASTER': 'Master',
            'GRANDMASTER': 'Grandmaster',
            'CHALLENGER': 'Challenger'
        };

        const tierName = tierNames[tier] || tier;
        
        if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
            return tierName;
        }
        
        return `${tierName} ${rank}`;
    }

    formatGameLength(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const gameTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - gameTime) / 1000);

        const intervals = [
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    formatTraits(traits) {
        if (!traits || traits.length === 0) return '';
        
        return traits
            .filter(trait => trait.tier_current > 0)
            .sort((a, b) => b.tier_current - a.tier_current)
            .slice(0, 4)
            .map(trait => `
                <span class="trait-badge trait-tier-${trait.tier_current}">
                    ${trait.name} ${trait.tier_current}
                </span>
            `)
            .join('');
    }

    validateRiotId(riotId) {
        const riotIdPattern = /^[a-zA-Z0-9\u4e00-\u9fa5\s]{1,16}#[a-zA-Z0-9]{1,5}$/;
        return riotIdPattern.test(riotId);
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('playerResults').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('playerResults').style.display = 'none';
    }

    handleSearchError(error) {
        let message = 'An unexpected error occurred';
        
        if (error.message.includes('Player not found')) {
            message = 'Player not found. Please check the Riot ID and try again.';
        } else if (error.message.includes('Rate limit exceeded')) {
            message = 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('API access forbidden')) {
            message = 'API access is currently unavailable. Please try again later.';
        }
        
        this.showError(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.playerSearch = new PlayerSearch();
});
