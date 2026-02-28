# Sales Interview Prep

AI-powered interview practice app for sales students. Practice cold calls, discovery calls, CSM renewals, and more with realistic AI interviewers. Get scored feedback based on proven frameworks.

## Features

- 🎤 **Voice-first practice** - Speak naturally, AI responds in real-time
- 🎯 **Role-based scenarios** - SDR, AE, CSM, and more
- ⏱️ **5-minute focused sessions** - Quick, effective practice
- 📊 **Framework-based feedback** - Scores based on SPIN, Challenger, etc.
- 📝 **Annotated transcripts** - See teachable moments highlighted
- 📈 **Progress tracking** - Track improvement over time

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Auth & Database**: Supabase
- **AI**: Anthropic Claude API
- **Voice**: Browser Speech Recognition API

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - Anon public key

### 3. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key

### 4. Configure environment

Create `.env` file:

```
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run locally

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
├── components/       # Reusable components
├── contexts/         # React contexts (auth)
├── lib/              # API helpers (supabase, ai)
├── pages/            # Route pages
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Home.jsx
│   ├── Setup.jsx
│   ├── Ready.jsx
│   ├── Interview.jsx
│   ├── Feedback.jsx
│   └── Progress.jsx
├── App.jsx           # Main app with routing
├── main.jsx          # Entry point
└── index.css         # Tailwind + custom styles
```

## Interview Types

| Type | Available For |
|------|---------------|
| Cold Call | SDR, AE |
| Discovery | SDR, AE, CSM, Enterprise AE |
| Objection Handling | AE |
| Negotiation | AE, Sales Leader, Enterprise AE |
| CSM Renewal | CSM |
| CSM Escalation | CSM |
| QBR | CSM |
| Job Interview | All roles |
| Multi-Stakeholder | Enterprise AE |
| Team Scenario | Sales Leader |

## Cost Estimates

- **Supabase**: Free tier (50k MAU)
- **Claude API**: ~₹3-4 per interview session
- **60 students × 10 interviews/month**: ~₹2,000-3,000/month

## License

Private - For educational use only.
