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
