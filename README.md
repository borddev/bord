# BORD - Build Once, Run Daily

A monorepo framework designed for **Claude Code CLI** and AI-powered development. Go from prompt to working automation in one shot.

## Philosophy

BORD is built around one idea: **paste a prompt, get a working app**.

Traditional setup:
```
Read docs → Clone repo → Configure → Debug → Configure more → Maybe it works
```

BORD setup:
```
Paste prompt → Watch progress bar → Done
```

## How It Works

BORD is a **monorepo** that integrates with AI coding assistants (Claude Code, Cursor, etc.):

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR MACHINE                            │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │ Claude Code  │────▶│    BORD      │────▶│   Apps       │   │
│  │    CLI       │     │  (monorepo)  │     │ (installed)  │   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│         │                    │                    │            │
│         ▼                    ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    .env.local                             │ │
│  │  (all secrets in one place, never committed)              │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### The PROMPT.md Pattern

Every BORD app includes a `PROMPT.md` file. This is a **magic installer** - copy its contents, paste into Claude Code, and watch:

```
Step 1: [████████████████████] 100% - Cloning BORD...
Step 2: [████████████████████] 100% - Installing app...
Step 3: [████████████████████] 100% - Setting up database...
Step 4: [████████████████████] 100% - Configuring secrets...
Step 5: [████████████████████] 100% - Starting server...

✓ Ready at http://localhost:3000/x-reply-guy
```

The prompt contains:
- ASCII art welcome screen
- Step-by-step progress tracking
- All git clone commands
- Database schema (if needed)
- Environment variable setup
- Automatic browser launch

**Zero manual configuration. Zero reading docs. Just paste and wait.**

## Quick Start

### Option 1: Install with Claude Code (Recommended)

1. Install [Claude Code CLI](https://docs.anthropic.com/claude-code)
2. Find an app you want (e.g., [x-reply-guy](https://github.com/borddev/x-reply-guy))
3. Open its `PROMPT.md`
4. Copy everything and paste into Claude Code
5. Done

### Option 2: Manual Install

```bash
git clone https://github.com/borddev/bord
cd bord
npm install
cp .env.example .env.local
npm run dev
```

## Monorepo Structure

```
bord/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home dashboard (app grid)
│   ├── secrets/             # API key manager UI
│   ├── open-source/         # App marketplace
│   └── [app-name]/          # ← Apps install their pages here
│
├── apps/                     # App configurations
│   └── [app-name]/
│       └── config.json      # App metadata
│
├── lib/                      # Shared utilities
├── .env.local               # ALL secrets (gitignored)
├── .env.example             # Template for secrets
└── CLAUDE.md                # AI assistant instructions
```

### Why a Monorepo?

1. **Single secrets file** - One `.env.local` for everything
2. **Shared components** - Apps can use BORD's UI primitives
3. **Unified routing** - All apps under one Next.js instance
4. **Easy deployment** - One `npm run dev`, all apps running

## The CLAUDE.md Convention

Every folder has a `CLAUDE.md` file. This tells AI assistants:
- What the folder contains
- How to set things up
- What NOT to do (security)
- Database schemas, API patterns, etc.

When you paste a PROMPT.md, Claude Code reads these files automatically and knows exactly what to do.

## Installing Apps

### Via Dashboard
1. Go to `http://localhost:3000/open-source`
2. Click "Install" on any app
3. Follow the prompt

### Via CLI
```bash
# Clone app into the apps folder
git clone https://github.com/borddev/x-reply-guy ./apps/x-reply-guy

# The app's pages are already set up to work with BORD's routing
```

## Creating Your Own App

```
your-app/
├── PROMPT.md              # Magic installer (required)
├── CLAUDE.md              # AI instructions (required)
├── config.json            # App metadata (required)
├── README.md              # Human docs
├── app/                   # Next.js pages
│   ├── page.tsx          # Main page at /your-app
│   └── settings/         # Sub-routes
├── api/                   # API routes
└── automations/          # Bot scripts (if any)
```

### config.json
```json
{
  "name": "Your App",
  "slug": "your-app",
  "description": "What it does",
  "icon": "emoji-or-svg",
  "repo": "https://github.com/you/your-app",
  "requiredSecrets": ["API_KEY", "DATABASE_URL"]
}
```

## Available Apps

| App | Description | Install |
|-----|-------------|---------|
| [x-reply-guy](https://github.com/borddev/x-reply-guy) | AI-powered Twitter/X reply bot | [PROMPT.md](https://github.com/borddev/x-reply-guy/blob/main/PROMPT.md) |

## Tech Stack

- **Next.js 15** - App Router, Server Components
- **React 19** - Latest React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (optional)

## CLI Tools Integration

BORD works with any CLI tool that can read files:

| Tool | How It Works |
|------|--------------|
| **Claude Code** | Reads CLAUDE.md, executes PROMPT.md |
| **Cursor** | Same - paste prompt in composer |
| **Aider** | Same pattern works |
| **GitHub Copilot CLI** | Can follow PROMPT.md steps |

The magic is in the `PROMPT.md` format - it's AI-agnostic.

## Security

- Secrets live in `.env.local` (gitignored)
- Never hardcode credentials
- Every app declares required secrets in `config.json`
- CLAUDE.md files remind AI assistants about security

## License

MIT

---

**[bord.dev](https://bord.dev)** · **[GitHub](https://github.com/borddev/bord)** · **[X Reply Guy](https://github.com/borddev/x-reply-guy)**
