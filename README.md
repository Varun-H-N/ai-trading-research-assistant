# AI Trading Research Assistant

An AI-powered trading research assistant that converts natural-language trading questions into structured experiments and presents research results through an interactive dashboard.

## 🚀 Overview

The AI Trading Research Assistant helps users explore trading hypotheses without manually designing a research experiment.

For example:

> Does buying NIFTY after a 1% fall work better during high-volatility periods?

The application understands the question, extracts important trading parameters, defines an experiment, runs a simulated research test, and presents the results using performance metrics and charts.

## ✨ Features

- Natural-language trading question input
- Automatic extraction of trading parameters
- Instrument identification
- Entry condition detection
- Holding-period detection
- Volatility condition detection
- Timeframe identification
- Exit condition handling
- Transaction-cost consideration
- Structured experiment generation
- Simulated trading research
- Win-rate analysis
- Average-return analysis
- Total-return calculation
- Market-condition comparison
- Interactive charts
- Research insights and caveats
- Responsive trading dashboard
- REST API backend

## 🧠 How It Works

The application follows a research workflow:

### 1. ASK

The user enters a trading research question in natural language.

### 2. UNDERSTAND

The system extracts important parameters such as the instrument, entry condition, volatility condition, timeframe, and holding period.

### 3. CLARIFY

The system identifies missing or ambiguous information instead of blindly assuming every parameter.

### 4. DEFINE

The extracted information is converted into a structured trading experiment.

### 5. TEST

The experiment is evaluated using simulated/sample market data.

### 6. LEARN

The application presents results, charts, insights, and research limitations.

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│       React Frontend        │
│       Vite + JavaScript     │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│       Node.js Backend       │
│         Express.js          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Research / NLP Engine     │
│ Experiment Generation       │
│ Simulated Market Data       │
└─────────────────────────────┘
