# LLM Context Window Simulator

A visual simulator that demonstrates how a modern coding agent's context window is composed, consumed, and compacted — modelled on Claude Code's `/context` view. This interactive tool helps users understand that most of the window is **fixed overhead loaded before the first message** (system prompt, tools, MCP servers, memory, agents, skills), why adding MCP servers is so expensive, and how "context rot" sets in when old messages are evicted.

## Features

### 🎯 Core Functionality
- **`/context`-style breakdown**: The window is split into the same categories Claude Code reports, each with token counts and percentages.
- **Grid block-map**: The signature colored-cell grid showing what fills the window.
- **Interactive configuration**: Add/remove MCP servers, toggle skills and custom agents, and adjust system-prompt/memory/buffer size — the visuals update live.
- **Autocompact & Context Rot**: When messages exceed the budget they are evicted, and a color-coded "Context Rot" warning (badge + toast + audio beep) surfaces the lost context.
- **Real-time Billing**: Accurate per-request pricing — the full resent context is billed as input and only each turn's newly generated tokens as output, so cost growth over a conversation is realistic. Optional **prompt caching** bills the stable overhead prefix at 1.25× on first write then 0.1× on reads, with a live "cache saved" readout.
- **Compact dashboard**: A fit-to-viewport layout (config panel · grid + breakdown · billing/controls strip) designed to show everything without page scrolling.

### 🎨 Context Categories
Loaded before the conversation even starts (never evicted):
- **System prompt**, **System tools**, **MCP tools**, **Memory (CLAUDE.md)**, **Custom agents**, **Skills**

The conversation and reserved space:
- **Messages**: user (green), assistant (purple) and tool (orange) turns — the only evictable region
- **Free space**: what's left
- **Autocompact buffer**: reserved headroom held back from the window

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
├── App.jsx                 # Main component: state, autocompact, billing, layout
├── contextModel.js         # Category config, token estimates, breakdown/billing/compaction, rot severity
├── ContextGrid.jsx         # /context-style colored grid block-map
├── ContextBreakdown.jsx    # Per-category token counts + percentages
├── ContextConfigPanel.jsx  # Interactive MCP / skills / agents / memory controls
├── ContextRot.jsx          # Context Rot badge + toast
├── i18n.js                 # Translation table (en/zh) + t() and language context
├── TokenPlate.jsx          # Animated Messages (conversation) strip
├── TokenMeter.jsx          # Data-driven usage meter (legacy; not mounted in the compact layout)
├── App.css                 # Application styles
└── main.jsx                # React entry point

Root files:
├── index.html              # Vite entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Where your judgment shapes the model

Four spots in the code are intentionally simple defaults, marked with `YOUR DESIGN CHOICE` comments, so you can tune the model's behavior:

1. **Token-estimate heuristics** (`contextModel.js` → `ESTIMATE`) — tokens per MCP tool / skill / agent / memory-KB.
2. **Autocompact strategy** (`contextModel.js` → `compactMessages`) — drop-oldest vs. summarize-and-keep-recent vs. protect-first-message.
3. **Grid cell sizing / rounding** (`ContextGrid.jsx` → `CELL_COUNT` / `buildCells`).
4. **Context Rot severity thresholds** (`contextModel.js` → `rotSeverity`).

## Configuration

### Default Settings

- **Context Window**: 200,000 tokens (8K / 32K / 128K / 200K / 500K / 1M available)
- **Starting profile**: a realistic Claude Code overhead load (~30-40% full on open)
- **Input Token Price**: $0.000003 per token ($3 per million)
- **Output Token Price**: $0.000009 per token ($9 per million)
- **Auto Ask Interval**: 1000ms

### Customisation

All settings can be adjusted through the UI:

- Context window size dropdown (8K, 32K, 128K, 200K, 500K, 1M tokens)
- Interactive context configuration panel (MCP servers, skills, agents, memory, system prompt, autocompact buffer)
- Input/output token price inputs
- Auto mode toggle
- Prompt caching toggle (Cache) with a live "cache saved" pill
- Context Rot beep mute toggle (🔊/🔇)
- Language toggle (English / 中文)
- Manual reset functionality (clears the conversation and restores the initial profile, window, and prices)

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
