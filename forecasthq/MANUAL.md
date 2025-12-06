# ForecastHQ - Manual Setup Guide

## Prerequisites
- Node.js 18+
- npm
- Anthropic API key (for AI features)

## Local Development

1. Navigate to the project directory:
```bash
cd forecasthq
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## Deployment to Render.com

### Option 1: One-Click Deploy
1. Fork this repository to your GitHub account
2. Go to https://render.com and sign up/login
3. Click "New" -> "Web Service"
4. Connect your GitHub account and select the repository
5. Configure the service:
   - **Name**: forecasthq (or your preferred name)
   - **Root Directory**: forecasthq
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
7. Click "Create Web Service"

### Option 2: Manual Deploy
1. Create a new Web Service on Render
2. Set the following:
   - **Environment**: Node
   - **Build Command**: `cd forecasthq && npm install && npm run build`
   - **Start Command**: `cd forecasthq && npm start`
3. Add environment variable `ANTHROPIC_API_KEY`

## Alternative: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd forecasthq
vercel
```

3. Add environment variable in Vercel dashboard:
   - Go to Project Settings -> Environment Variables
   - Add `ANTHROPIC_API_KEY`

4. Redeploy to apply environment variables:
```bash
vercel --prod
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Your Anthropic API key for Claude |

## Features

### Works without API key:
- Landing page
- Dashboard with demo data
- Market browsing
- Trading interface (demo mode)
- Probability charts

### Requires API key:
- AI Question Generator
- AI Forecasting Assistant
- AI Executive Summary

## Troubleshooting

### AI features not working
- Verify ANTHROPIC_API_KEY is set correctly
- Check that the API key has sufficient credits
- Check browser console for error messages

### Build errors
- Ensure Node.js 18+ is installed
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`

### Port already in use
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill`
- Or use a different port: `npm run dev -- -p 3001`
