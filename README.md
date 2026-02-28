# Sales Simulation Platform v2

AI-powered sales simulation platform for training students. Practice cold calls, discovery calls, negotiations, and more with realistic AI personas. Get framework-based feedback with actionable coaching.

## What's New in V2

- 🎯 **Rebranded**: "Interview Prep" → "Sales Simulation"
- 📋 **Pre-call Research**: Students research before the call, get scored on preparation
- 🎤 **Fixed Voice Input**: Working microphone with Sarvam AI for Indian accents
- 📦 **Product Context**: Specify what you're selling, not just who you're calling
- 📊 **Coach Dashboard**: Trainers can view student performance and weak areas
- 🎮 **Gamification**: XP, levels, badges, and actionable feedback
- ✨ **Better Feedback UI**: Tabbed interface with key moments highlighting

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Auth & Database**: Supabase
- **AI**: Anthropic Claude API
- **Voice**: Sarvam AI (Indian accents) with browser fallback

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL from `supabase-schema.sql` in SQL Editor (use the one from v1)
4. Go to **Settings → API** and copy URL + anon key

### 3. Get API Keys

**Anthropic Claude:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key

**Sarvam AI (for Indian accent voice):**
1. Go to [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Sign up and get API key

### 4. Configure Environment

Create `.env` file:

```
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SARVAM_API_KEY=your_sarvam_key
VITE_COACH_EMAILS=coach1@email.com,coach2@email.com
```

### 5. Run Locally

```bash
npm run dev
```

## Coach Dashboard

Add coach email addresses to `VITE_COACH_EMAILS` (comma-separated). Coaches will see a "Coach View" button on the home screen.

Coach features:
- Class overview stats
- Common weak areas across all students
- Individual student drill-down
- Sort/filter students by score, activity, etc.

## Student Flow

1. **Setup**: Select role → Target company → Simulation type → Product context
2. **Research**: Fill in pre-call research (persona, challenges, questions) → Get scored
3. **Ready**: See scenario brief with success criteria
4. **Simulation**: 5-minute voice conversation with AI prospect
5. **Feedback**: Score, key moments, strengths, improvements, XP earned

## Simulation Types

| Type | Available For |
|------|---------------|
| Cold Call | SDR, AE |
| Discovery | All roles |
| Objection Handling | AE |
| Negotiation | AE, Sales Leader, Enterprise AE |
| CSM Renewal | CSM |
| CSM Escalation | CSM |
| QBR | CSM |
| Job Interview | All roles |

## Cost Estimates

- **Supabase**: Free tier (50k MAU)
- **Claude API**: ~₹3-4 per simulation
- **Sarvam AI**: ~₹0.50 per minute of speech
- **60 students × 10 simulations/month**: ~₹3,000-4,000/month

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (auth)
├── lib/              # API helpers
│   ├── ai.js         # Claude AI functions
│   ├── supabase.js   # Database functions
│   └── voice.js      # Sarvam/browser speech
├── pages/            # Route pages
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Home.jsx
│   ├── Setup.jsx
│   ├── Research.jsx      # NEW: Pre-call research
│   ├── Ready.jsx
│   ├── Simulation.jsx    # Renamed from Interview
│   ├── Feedback.jsx      # Improved UI
│   ├── Progress.jsx
│   └── CoachDashboard.jsx  # NEW: Coach view
├── App.jsx
├── main.jsx
└── index.css
```

## License

Private - For educational use only.
