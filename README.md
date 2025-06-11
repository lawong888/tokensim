# LLM Token Simulator

A visual simulator that demonstrates how Large Language Model (LLM) token consumption and billing works in real-time. This interactive tool helps users understand context windows, token eviction, and API pricing models.

## Features

### 🎯 Core Functionality
- **Visual Token Representation**: See tokens as coloured blocks with their lengths
- **Context Window Simulation**: Configurable context sizes (1K to 32K tokens)
- **Token Eviction**: Watch older tokens get removed when context fills up
- **Real-time Billing**: Track costs with realistic API pricing

### 🎨 Token Types
- **Blue (System Tokens)**: Never evicted, always present at the top
- **Green (User Query Tokens)**: Input from user prompts
- **Purple (LLM Response Tokens)**: Generated responses from the AI

### 💰 Billing Features
- **Dual Pricing Model**: Separate input/output token pricing (3x multiplier)
- **Current Request Cost**: Cost of processing entire context window
- **Session Total**: Cumulative cost across all requests
- **Token Statistics**: Track total tokens generated

### ⚡ Interactive Controls
- **Manual Mode**: Click "Ask LLM" to generate user queries and responses
- **Auto Mode**: Automatic token generation every 0.5 seconds
- **Configurable Pricing**: Adjust input/output token prices
- **Context Window Selection**: Choose from 1K to 32K token limits

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser to:**

   ```
   http://localhost:5174
   ```

### Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static web hosting service.

## How It Works

### Token Generation

1. **Initial Load**: System tokens + initial response tokens are generated
2. **User Interaction**: Click "Ask LLM" to add user query tokens
3. **Auto Response**: Response tokens are automatically generated after user tokens
4. **Token Eviction**: When context fills up, oldest non-system tokens are removed

### Billing Simulation

The simulator uses realistic API pricing models:

- **Input Tokens**: System + User tokens (default: $0.000003 per token)
- **Output Tokens**: Response tokens (default: $0.000009 per token, 3x input price)
- **Current Request**: Cost of entire context window for this request
- **Session Total**: Cumulative cost of all API requests made

### Context Window Management

- System tokens are **never evicted** (always stay at the top)
- User and response tokens are evicted in FIFO order when space is needed
- Visual meter shows token distribution and remaining capacity

## File Structure

```
src/
├── App.jsx           # Main application component
├── App.js            # Legacy version (not used)
├── App.css           # Application styles
├── TokenPlate.jsx    # Visual token display component
├── TokenMeter.jsx    # Horizontal token usage meter
└── main.jsx          # React entry point

public/
└── index.html        # HTML template (backup)

Root files:
├── index.html        # Vite entry point
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## Configuration

### Default Settings

- **Context Window**: 4,096 tokens
- **Input Token Price**: $0.000003 per token ($3 per million)
- **Output Token Price**: $0.000009 per token ($9 per million)
- **Auto Ask Interval**: 500ms

### Customisation

All settings can be adjusted through the UI:

- Context window size dropdown (1K, 2K, 4K, 8K, 32K tokens)
- Input/output token price inputs
- Auto mode toggle
- Manual reset functionality

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **React Spring**: Smooth animations for token transitions
- **UUID**: Unique token identification
- **CSS3**: Styling with flexbox layouts

## Educational Use Cases

### For Developers

- Understand LLM API billing models
- Visualise context window limitations
- Learn about token management strategies
- Experiment with different pricing scenarios

### For Students

- See how conversation history affects costs
- Understand why longer conversations become expensive
- Learn about system prompts and their persistence
- Visualise the concept of "context windows"

### For Product Managers

- Estimate API costs for different usage patterns
- Understand the relationship between context size and billing
- Plan for cost optimisation strategies

## Key Features Explained

### System Tokens

- Always displayed in blue at the top of the context window
- Never get evicted, representing persistent system prompts
- Generated randomly on startup and reset

### Token Eviction

- When context window fills up, oldest user/response tokens are removed
- System tokens remain protected
- Visual animation shows tokens disappearing

### Billing Model

- **Current Request Cost**: What you'd pay for processing the current context
- **Session Total**: Cumulative cost of all requests in this session
- **Realistic Pricing**: Based on actual LLM API rates (GPT-4, Claude, etc.)

### Auto Mode

- Automatically generates user queries and responses
- Useful for demonstrating token eviction and cost accumulation
- Can be toggled on/off

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers supported

## Contributing

This is an educational tool. Feel free to:

- Report bugs or suggest improvements
- Fork and modify for your own use cases
- Add new features like different LLM pricing models
- Improve the visual design

## License

Open source - feel free to use and modify for educational purposes.

## Acknowledgments

- Inspired by real LLM API pricing models from OpenAI, Anthropic, and Google
- Built to help developers understand token economics
- Designed for educational and demonstration purposes
