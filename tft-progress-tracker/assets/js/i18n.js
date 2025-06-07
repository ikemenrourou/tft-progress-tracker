// TFT Progress Tracker - Internationalization
// Extended from TFT-Rolling-Calculator i18n system

class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.languages = {
            'en': { name: 'English', flag: 'EN', file: 'languages/en.json' },
            'zh': { name: '中文', flag: 'CN', file: 'languages/zh.json' }
        };
        
        // Initialize
        this.init();
    }

    async init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('tft-tracker-language') || 'en';
        await this.loadLanguage(savedLang);
        this.updateLanguageSelector();
        this.bindEvents();
    }

    async loadLanguage(langCode) {
        try {
            const response = await fetch(this.languages[langCode].file);
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${langCode}`);
            }
            
            this.translations = await response.json();
            this.currentLanguage = langCode;
            
            // Save preference
            localStorage.setItem('tft-tracker-language', langCode);
            
            // Update page content
            this.updatePageContent();
            this.updateLanguageSelector();
            
        } catch (error) {
            console.error('Error loading language:', error);
            // Fallback to English if loading fails
            if (langCode !== 'en') {
                await this.loadLanguage('en');
            }
        }
    }

    translate(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return key if translation not found
            }
        }
        
        // Replace parameters in translation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] || match;
            });
        }
        
        return value;
    }

    updatePageContent() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                // Don't update input values, only placeholders
                return;
            }
            
            element.textContent = translation;
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            element.placeholder = translation;
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.translate(key);
            element.title = translation;
        });

        // Update document title
        const titleKey = document.documentElement.getAttribute('data-i18n-title');
        if (titleKey) {
            document.title = this.translate(titleKey);
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    updateLanguageSelector() {
        const currentBtn = document.getElementById('current-language');
        const dropdown = document.getElementById('language-dropdown');
        
        if (currentBtn && dropdown) {
            const currentLang = this.languages[this.currentLanguage];
            currentBtn.innerHTML = `<span class="flag-badge">${currentLang.flag}</span> ${currentLang.name}`;
            
            // Update dropdown options
            dropdown.innerHTML = '';
            Object.entries(this.languages).forEach(([code, lang]) => {
                const option = document.createElement('div');
                option.className = 'language-option';
                option.setAttribute('data-lang', code);
                option.innerHTML = `<span class="flag-badge">${lang.flag}</span> ${lang.name}`;
                
                if (code === this.currentLanguage) {
                    option.classList.add('active');
                }
                
                dropdown.appendChild(option);
            });
        }
    }

    bindEvents() {
        // Language selector toggle
        const currentBtn = document.getElementById('current-language');
        const dropdown = document.getElementById('language-dropdown');
        
        if (currentBtn && dropdown) {
            currentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // Language option selection
            dropdown.addEventListener('click', (e) => {
                const option = e.target.closest('.language-option');
                if (option) {
                    const langCode = option.getAttribute('data-lang');
                    if (langCode && langCode !== this.currentLanguage) {
                        this.loadLanguage(langCode);
                    }
                    dropdown.classList.remove('show');
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.classList.remove('show');
            });
        }
    }

    // Utility method for dynamic content
    t(key, params = {}) {
        return this.translate(key, params);
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get available languages
    getAvailableLanguages() {
        return this.languages;
    }

    // Format numbers according to locale
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Format dates according to locale
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime(date) {
        const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        const now = new Date();
        const diffInSeconds = Math.floor((date - now) / 1000);
        
        const intervals = [
            { unit: 'year', seconds: 31536000 },
            { unit: 'month', seconds: 2592000 },
            { unit: 'day', seconds: 86400 },
            { unit: 'hour', seconds: 3600 },
            { unit: 'minute', seconds: 60 },
            { unit: 'second', seconds: 1 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
            if (count >= 1) {
                return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
            }
        }
        
        return rtf.format(0, 'second');
    }
}

// Global instance
window.i18n = new I18n();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
