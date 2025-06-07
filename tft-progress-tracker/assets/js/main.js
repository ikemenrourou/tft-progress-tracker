// TFT Progress Tracker - Main JavaScript
// Enhanced functionality for the TFT tools platform

class TFTProgressTracker {
    constructor() {
        this.apiKey = 'RGAPI-4ffd66c0-a644-4f36-b84f-3a05a0004446';
        this.regions = {
            americas: 'americas.api.riotgames.com',
            asia: 'asia.api.riotgames.com',
            europe: 'europe.api.riotgames.com'
        };
        this.platforms = {
            na1: 'na1.api.riotgames.com',
            kr: 'kr.api.riotgames.com',
            euw1: 'euw1.api.riotgames.com',
            eun1: 'eun1.api.riotgames.com',
            jp1: 'jp1.api.riotgames.com',
            oc1: 'oc1.api.riotgames.com'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeComponents();
    }

    bindEvents() {
        // Quick search form
        const quickSearchForm = document.getElementById('quickSearchForm');
        if (quickSearchForm) {
            quickSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickSearch();
            });
        }

        // Navigation active state
        this.updateActiveNavigation();

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Feature card hover effects
        this.initializeFeatureCards();
    }

    initializeComponents() {
        // Initialize floating animations
        this.initializeFloatingAnimations();
        
        // Initialize tooltips if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    handleQuickSearch() {
        const searchInput = document.getElementById('quickSearchInput');
        if (!searchInput) return;

        const riotId = searchInput.value.trim();
        if (!riotId) {
            this.showNotification('Please enter a Riot ID', 'warning');
            return;
        }

        // Validate Riot ID format (GameName#TagLine)
        if (!this.validateRiotId(riotId)) {
            this.showNotification('Please enter a valid Riot ID (e.g., Faker#KR1)', 'error');
            return;
        }

        // Redirect to player search page with the Riot ID
        const [gameName, tagLine] = riotId.split('#');
        window.location.href = `player-search.html?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;
    }

    validateRiotId(riotId) {
        // Riot ID format: GameName#TagLine
        const riotIdPattern = /^[a-zA-Z0-9\u4e00-\u9fa5\s]{1,16}#[a-zA-Z0-9]{1,5}$/;
        return riotIdPattern.test(riotId);
    }

    updateActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    initializeFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card, .main-feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    initializeFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.floating');
        
        floatingElements.forEach((element, index) => {
            // Add staggered animation delays
            element.style.animationDelay = `${index * 0.2}s`;
            
            // Add intersection observer for performance
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.animationPlayState = 'running';
                        } else {
                            entry.target.style.animationPlayState = 'paused';
                        }
                    });
                });
                
                observer.observe(element);
            }
        });
    }

    // Riot API Methods
    async makeApiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Riot-Token': this.apiKey,
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async getPlayerByRiotId(gameName, tagLine, region = 'americas') {
        const url = `https://${this.regions[region]}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        return this.makeApiRequest(url);
    }

    async getTFTPlayerData(puuid, platform = 'na1') {
        const url = `https://${this.platforms[platform]}/tft/summoner/v1/summoners/by-puuid/${puuid}`;
        return this.makeApiRequest(url);
    }

    async getTFTRankData(summonerId, platform = 'na1') {
        const url = `https://${this.platforms[platform]}/tft/league/v1/entries/by-summoner/${summonerId}`;
        return this.makeApiRequest(url);
    }

    async getTFTMatchHistory(puuid, count = 20, region = 'americas') {
        const url = `https://${this.regions[region]}/tft/match/v1/matches/by-puuid/${puuid}/ids?count=${count}`;
        return this.makeApiRequest(url);
    }

    async getTFTMatchDetail(matchId, region = 'americas') {
        const url = `https://${this.regions[region]}/tft/match/v1/matches/${matchId}`;
        return this.makeApiRequest(url);
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    formatRank(tier, rank, lp) {
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
            return `${tierName} ${lp} LP`;
        }
        
        return `${tierName} ${rank} ${lp} LP`;
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const gameTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - gameTime) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
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

    // Loading states
    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading-spinner"></div>';
            element.classList.add('loading');
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
        }
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        
        if (error.message.includes('404')) {
            message = 'Player not found';
        } else if (error.message.includes('403')) {
            message = 'API access forbidden';
        } else if (error.message.includes('429')) {
            message = 'Rate limit exceeded. Please try again later';
        } else if (error.message.includes('500')) {
            message = 'Server error. Please try again later';
        }
        
        this.showNotification(message, 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tftTracker = new TFTProgressTracker();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TFTProgressTracker;
}
