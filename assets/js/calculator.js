// TFT Rolling Probability Calculator
// Based on TFT-Rolling-Calculator with enhancements

class TFTCalculator {
    constructor() {
        this.chart = null;
        this.champions = {
            1: [
                { name: "Caitlyn", pool: 22 },
                { name: "Fiora", pool: 22 },
                { name: "Graves", pool: 22 },
                { name: "Jayce", pool: 22 },
                { name: "Jinx", pool: 22 },
                { name: "Maddie", pool: 22 },
                { name: "Powder", pool: 22 },
                { name: "Singed", pool: 22 },
                { name: "Trundle", pool: 22 },
                { name: "Vander", pool: 22 },
                { name: "Vi", pool: 22 },
                { name: "Violet", pool: 22 },
                { name: "Zyra", pool: 22 }
            ],
            2: [
                { name: "Akali", pool: 20 },
                { name: "Camille", pool: 20 },
                { name: "Darius", pool: 20 },
                { name: "Draven", pool: 20 },
                { name: "Leona", pool: 20 },
                { name: "Nocturne", pool: 20 },
                { name: "Rell", pool: 20 },
                { name: "Renata Glasc", pool: 20 },
                { name: "Sett", pool: 20 },
                { name: "Swain", pool: 20 },
                { name: "Tristana", pool: 20 },
                { name: "Urgot", pool: 20 },
                { name: "Zeri", pool: 20 }
            ],
            3: [
                { name: "Blitzcrank", pool: 17 },
                { name: "Cassiopeia", pool: 17 },
                { name: "Ezreal", pool: 17 },
                { name: "Gangplank", pool: 17 },
                { name: "Garen", pool: 17 },
                { name: "Katarina", pool: 17 },
                { name: "Kogmaw", pool: 17 },
                { name: "Nunu", pool: 17 },
                { name: "Scar", pool: 17 },
                { name: "Smeech", pool: 17 },
                { name: "Twisted Fate", pool: 17 },
                { name: "Vex", pool: 17 },
                { name: "Vladimir", pool: 17 }
            ],
            4: [
                { name: "Ambessa", pool: 12 },
                { name: "Corki", pool: 12 },
                { name: "Dr. Mundo", pool: 12 },
                { name: "Heimerdinger", pool: 12 },
                { name: "Illaoi", pool: 12 },
                { name: "Irelia", pool: 12 },
                { name: "Nami", pool: 12 },
                { name: "Olaf", pool: 12 },
                { name: "Renni", pool: 12 },
                { name: "Silco", pool: 12 },
                { name: "Twitch", pool: 12 },
                { name: "Ziggs", pool: 12 }
            ],
            5: [
                { name: "Caitlyn", pool: 9 },
                { name: "Ekko", pool: 9 },
                { name: "Gnar", pool: 9 },
                { name: "Jayce", pool: 9 },
                { name: "Jinx", pool: 9 },
                { name: "LeBlanc", pool: 9 },
                { name: "Malzahar", pool: 9 },
                { name: "Rumble", pool: 9 },
                { name: "Sevika", pool: 9 },
                { name: "Vi", pool: 9 },
                { name: "Viktor", pool: 9 },
                { name: "Warwick", pool: 9 }
            ]
        };
        
        this.levelOdds = {
            1: [1.00, 0.00, 0.00, 0.00, 0.00],
            2: [1.00, 0.00, 0.00, 0.00, 0.00],
            3: [0.75, 0.25, 0.00, 0.00, 0.00],
            4: [0.55, 0.30, 0.15, 0.00, 0.00],
            5: [0.45, 0.33, 0.20, 0.02, 0.00],
            6: [0.30, 0.40, 0.25, 0.05, 0.00],
            7: [0.19, 0.30, 0.35, 0.15, 0.01],
            8: [0.18, 0.25, 0.32, 0.22, 0.03],
            9: [0.10, 0.20, 0.25, 0.35, 0.10],
            10: [0.05, 0.10, 0.20, 0.40, 0.25],
            11: [0.01, 0.02, 0.12, 0.50, 0.35]
        };
        
        this.init();
    }

    init() {
        this.populateChampionSelect();
        this.bindEvents();
        this.initChart();
    }

    populateChampionSelect() {
        const select = document.getElementById('championSelect');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Choose a champion...</option>';

        // Add champions grouped by cost
        Object.keys(this.champions).forEach(cost => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${cost} Cost Champions`;
            
            this.champions[cost].forEach(champion => {
                const option = document.createElement('option');
                option.value = `${champion.name}|${cost}|${champion.pool}`;
                option.textContent = `${champion.name} (${cost} cost)`;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        });
    }

    bindEvents() {
        const calculateBtn = document.getElementById('calculateBtn');
        const championSelect = document.getElementById('championSelect');
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculate());
        }

        if (championSelect) {
            championSelect.addEventListener('change', () => this.onChampionChange());
        }

        // Auto-calculate on input change
        ['levelSelect', 'copiesOut', 'poolOut', 'goldAmount'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    if (document.getElementById('championSelect').value) {
                        this.calculate();
                    }
                });
            }
        });
    }

    onChampionChange() {
        const select = document.getElementById('championSelect');
        if (!select || !select.value) return;

        const [name, cost, pool] = select.value.split('|');
        
        // Update pool out placeholder
        const poolOutInput = document.getElementById('poolOut');
        if (poolOutInput) {
            poolOutInput.placeholder = `Total ${cost}-cost champions taken`;
        }

        // Auto-calculate if we have a selection
        this.calculate();
    }

    calculate() {
        const championSelect = document.getElementById('championSelect');
        const levelSelect = document.getElementById('levelSelect');
        const copiesOutInput = document.getElementById('copiesOut');
        const poolOutInput = document.getElementById('poolOut');
        const goldAmountInput = document.getElementById('goldAmount');

        if (!championSelect.value) {
            this.showError('Please select a champion first');
            return;
        }

        const [name, cost, totalPool] = championSelect.value.split('|');
        const level = parseInt(levelSelect.value);
        const copiesOut = parseInt(copiesOutInput.value) || 0;
        const poolOut = parseInt(poolOutInput.value) || 0;
        const goldAmount = parseInt(goldAmountInput.value) || 0;

        if (goldAmount < 2) {
            this.showError('You need at least 2 gold to roll');
            return;
        }

        // Calculate probabilities
        const results = this.calculateProbabilities(
            parseInt(cost),
            level,
            copiesOut,
            poolOut,
            goldAmount,
            parseInt(totalPool)
        );

        this.displayResults(results, goldAmount);
        this.updateChart(results);
    }

    calculateProbabilities(cost, level, copiesOut, poolOut, gold, totalPool) {
        const rolls = Math.floor(gold / 2);
        const odds = this.levelOdds[level];
        const costIndex = cost - 1;
        
        // Calculate remaining champions in pool
        const remainingChampions = Math.max(0, totalPool - copiesOut);
        const totalCostPool = this.getTotalCostPool(cost);
        const remainingCostPool = Math.max(1, totalCostPool - poolOut);
        
        // Probability of hitting the champion in one shop slot
        const hitProbability = odds[costIndex] * (remainingChampions / remainingCostPool);
        
        // Calculate probabilities for getting at least X copies
        const results = [];
        
        for (let copies = 0; copies <= 10; copies++) {
            const probability = this.calculateAtLeastXCopies(hitProbability, rolls * 5, copies);
            results.push({
                copies: copies,
                probability: probability
            });
        }

        return results;
    }

    calculateAtLeastXCopies(hitProb, totalSlots, targetCopies) {
        if (targetCopies === 0) return 1.0;
        if (hitProb === 0) return 0.0;
        
        // Use binomial distribution
        let probability = 0;
        
        for (let k = targetCopies; k <= Math.min(totalSlots, 13); k++) {
            probability += this.binomialProbability(totalSlots, k, hitProb);
        }
        
        return Math.min(1.0, probability);
    }

    binomialProbability(n, k, p) {
        if (k > n) return 0;
        if (k === 0) return Math.pow(1 - p, n);
        if (k === n) return Math.pow(p, n);
        
        // Calculate binomial coefficient
        let coefficient = 1;
        for (let i = 0; i < k; i++) {
            coefficient *= (n - i) / (i + 1);
        }
        
        return coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    getTotalCostPool(cost) {
        return this.champions[cost].reduce((total, champion) => total + champion.pool, 0);
    }

    displayResults(results, goldSpent) {
        document.getElementById('goldSpentResult').textContent = goldSpent;
        
        // Expected copies (sum of probabilities)
        const expectedCopies = results.reduce((sum, result, index) => {
            if (index === 0) return sum;
            return sum + (result.probability - (results[index - 1]?.probability || 0));
        }, 0);
        
        document.getElementById('expectedCopiesResult').textContent = expectedCopies.toFixed(2);
        document.getElementById('atLeast1Result').textContent = (results[1]?.probability * 100 || 0).toFixed(1) + '%';
        document.getElementById('atLeast2Result').textContent = (results[2]?.probability * 100 || 0).toFixed(1) + '%';
        document.getElementById('atLeast3Result').textContent = (results[3]?.probability * 100 || 0).toFixed(1) + '%';
    }

    initChart() {
        const ctx = document.getElementById('probabilityChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Probability (%)',
                    data: [],
                    borderColor: '#7ec7e6',
                    backgroundColor: 'rgba(126, 199, 230, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e6eaf3'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Number of Copies',
                            color: '#b3b9c9'
                        },
                        ticks: {
                            color: '#b3b9c9'
                        },
                        grid: {
                            color: 'rgba(179, 185, 201, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Probability (%)',
                            color: '#b3b9c9'
                        },
                        ticks: {
                            color: '#b3b9c9',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(179, 185, 201, 0.1)'
                        }
                    }
                }
            }
        });
    }

    updateChart(results) {
        if (!this.chart) return;

        const labels = results.slice(1, 8).map(r => `${r.copies}+`);
        const data = results.slice(1, 8).map(r => (r.probability * 100).toFixed(1));

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    showError(message) {
        if (window.tftTracker) {
            window.tftTracker.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tftCalculator = new TFTCalculator();
});
