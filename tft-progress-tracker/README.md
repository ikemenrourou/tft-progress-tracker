# TFT Progress Tracker

A comprehensive Teamfight Tactics tools platform that combines rolling probability calculations with player analytics using the Riot Games API.

## 🎯 Features

### 🎲 Probability Calculator
- **Advanced Rolling Calculator**: Calculate exact rolling probabilities using Markov chain models
- **Interactive Charts**: Visual representation of your odds with Chart.js
- **Real-time Updates**: Instant calculations as you adjust parameters
- **Champion Pool Tracking**: Account for champions already taken by other players

### 👤 Player Analytics
- **Player Search**: Look up any player by Riot ID
- **Rank Tracking**: View current rank, LP, and progression
- **Match History**: Detailed analysis of recent games
- **Performance Statistics**: Win rate, average placement, and more

### 🌍 Multi-language Support
- **English**: Full English interface
- **中文**: Complete Chinese translation
- **Dynamic Switching**: Change language on the fly

### 🎨 Modern Design
- **Dark Theme**: Eye-friendly dark interface inspired by TFT aesthetics
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Polished user experience with CSS transitions

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Internet connection for API calls
- Riot Games API key (temporary key included for demo)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start using the tools!

### API Configuration
The project uses a temporary Riot Games API key for demonstration:
```javascript
const API_KEY = 'RGAPI-4ffd66c0-a644-4f36-b84f-3a05a0004446';
```

For production use, you'll need to:
1. Register at [Riot Developer Portal](https://developer.riotgames.com/)
2. Create your application
3. Replace the API key in `assets/js/main.js` and `assets/js/player-search.js`

## 📁 Project Structure

```
tft-progress-tracker/
├── index.html                 # Main landing page
├── calculator.html            # Probability calculator
├── player-search.html         # Player lookup tool
├── assets/
│   ├── css/
│   │   └── main.css          # Main stylesheet
│   └── js/
│       ├── main.js           # Core functionality
│       ├── i18n.js           # Internationalization
│       ├── calculator.js     # Rolling calculator logic
│       └── player-search.js  # Player search & API calls
├── languages/
│   ├── en.json              # English translations
│   └── zh.json              # Chinese translations
└── README.md
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript ES6+**: Modern JavaScript features
- **Bootstrap 5**: Responsive framework
- **Chart.js**: Interactive charts
- **Font Awesome**: Icons
- **Riot Games API**: Real-time game data

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### API Endpoints Used
- **Account API**: Player identification
- **TFT Summoner API**: Player profile data
- **TFT League API**: Rank information
- **TFT Match API**: Match history and details

## 🎮 How to Use

### Probability Calculator
1. Navigate to the Calculator page
2. Select your current level
3. Choose the champion you want to roll for
4. Set the number of copies already taken
5. Enter your gold amount
6. View the probability charts and statistics

### Player Search
1. Go to the Player Search page
2. Enter a Riot ID (e.g., "Faker#KR1")
3. Select the appropriate region
4. Click Search to view detailed player statistics

### Language Switching
- Click the language selector in the top-right corner
- Choose between English and 中文
- The interface will update immediately

## 🔒 Privacy & Compliance

### Riot Games Policy Compliance
- ✅ Uses only official Riot Games APIs
- ✅ No real-time game assistance
- ✅ No opponent tracking or scouting
- ✅ Educational and analytical purpose only
- ✅ Includes required legal disclaimers

### Data Handling
- No personal data is stored locally
- All API calls are made directly to Riot servers
- No data is shared with third parties
- Respects Riot Games rate limits

## 📄 Legal

This project is not endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## 🤝 Contributing

This is a demonstration project. For production use:
1. Obtain your own Riot Games API key
2. Update the API configuration
3. Consider implementing proper error handling and rate limiting
4. Add more comprehensive testing

## 📞 Support

For questions about Riot Games API usage, visit the [Riot Developer Portal](https://developer.riotgames.com/).

For technical issues with this implementation, please check the browser console for error messages.

## 🎉 Acknowledgments

- **TFT-Rolling-Calculator**: Original probability calculation logic
- **Riot Games**: For providing the comprehensive TFT API
- **Bootstrap Team**: For the excellent CSS framework
- **Chart.js Team**: For the beautiful charting library

---

**Built with ❤️ for the TFT community**
