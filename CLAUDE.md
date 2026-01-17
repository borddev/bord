# BORD - Claude Code Instructions

You are setting up BORD (Build Once, Run Daily), a self-hosted automation platform.

## What is BORD?

BORD is a Next.js dashboard that:
1. Manages secrets/API keys securely
2. Integrates with AdsPower for browser automation
3. Hosts multiple automation "apps"
4. Provides a unified UI for all your bots

## Quick Setup

```bash
npm install
cp .env.example .env.local
npm run dev
# Open http://localhost:3000
```

## Directory Structure

```
bord/
├── app/
│   ├── page.tsx           # Home dashboard
│   ├── secrets/           # API key manager
│   ├── open-source/       # Browse & install apps
│   └── [app-name]/        # Apps install here
├── apps/                  # Installed app configs
├── lib/                   # Shared utilities
├── .env.local            # Your secrets (gitignored)
└── .env.example          # Template
```

## Installing Apps

Apps are installed via PROMPT.md files. Each app:
1. Gets cloned to `apps/[app-name]/`
2. Has its pages copied to `app/[app-name]/`
3. Adds its API routes
4. Registers in the home dashboard

## Environment Variables

BORD core requires no env vars. Apps add their own.

## Available Apps

Check https://github.com/[user]/bord for available apps.

---

**This is an open source project. Never commit credentials or personal data.**
