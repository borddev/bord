# BORD - Build Once, Run Daily

Self-hosted AI automation platform. One dashboard to manage all your bots.

## What is BORD?

BORD is a platform that hosts automation "apps" - AI-powered bots that run daily tasks for you. Each app is a standalone project that integrates with BORD.

## Quick Start

```bash
git clone https://github.com/user/bord
cd bord
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Installing Apps

1. Go to the **Apps** page in BORD
2. Click "Copy Install Prompt" on any app
3. Paste into Claude Code (or any AI assistant)
4. The app gets installed automatically

Or manually:
```bash
git clone https://github.com/user/[app-name] ./apps/[app-name]
npm install
```

## Features

- **Secrets Manager** - Store API keys securely in `.env.local`
- **App Marketplace** - Browse and install community apps
- **Unified Dashboard** - All your bots in one place
- **AdsPower Integration** - Browser automation support

## Available Apps

| App | Description |
|-----|-------------|
| [x-reply-guy](https://github.com/user/x-reply-guy) | Twitter/X AI reply bot |

## Building Your Own App

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to create an app.

Basic structure:
```
your-app/
├── config.json       # App metadata
├── app/              # Next.js pages (copied to bord/app/your-app/)
├── automations/      # Bot scripts
└── PROMPT.md         # Install instructions
```

## Project Structure

```
bord/
├── app/
│   ├── page.tsx          # Home dashboard
│   ├── secrets/          # API key manager
│   ├── open-source/      # App browser
│   └── [app-name]/       # Installed apps
├── apps/                 # App configs
├── lib/                  # Shared utilities
└── .env.local           # Secrets (gitignored)
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript

## License

MIT

---

**[bord.dev](https://bord.dev)** · **[GitHub](https://github.com/user/bord)**
