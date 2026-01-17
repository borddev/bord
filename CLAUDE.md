# BORD - Claude Code Instructions

You are working with BORD (Build Once, Run Daily), a self-hosted automation platform.

## What is BORD?

BORD is a Next.js dashboard that:
1. Manages secrets/API keys securely
2. Uses stealth Playwright browser for automation (no AdsPower needed)
3. Hosts multiple automation "apps"
4. Provides a unified UI for all your bots

## Directory Structure

```
~/bord/
├── app/                    # Next.js pages
│   ├── home/              # Home dashboard with app grid
│   ├── secrets/           # API key manager
│   ├── claude-md/         # CLAUDE.md editor
│   ├── chats/             # Claude Code chat history
│   ├── setup/             # Setup wizard (no sidebar)
│   └── x-reply-guy/       # X Reply Guy app
│       ├── page.tsx       # Main dashboard
│       ├── f4f/           # Follow4Follow
│       ├── school/        # Training interface
│       └── api/           # API routes
├── apps/                   # Installed app configs
│   └── x-reply-guy/
│       └── config.json    # App metadata
├── components/
│   └── Sidebar.tsx        # Navigation sidebar
├── lib/                    # Shared utilities
│   ├── browser.ts         # Stealth Playwright browser
│   ├── check-x-login.ts   # Login detection
│   └── x-reply-guy-db.ts  # SQLite database
├── data/                   # Created at runtime
│   ├── browser-profiles/  # Persistent browser sessions
│   └── x-reply-guy/       # App data & database
├── public/
│   └── icons/             # App icons
├── .env.local             # Your secrets (gitignored)
└── .env.example           # Template
```

## Quick Commands

```bash
# Start dashboard
npm run dev

# Launch stealth browser
npx tsx lib/browser.ts launch x-reply-guy

# List browser profiles
npx tsx lib/browser.ts list
```

## Browser Automation

BORD uses a built-in stealth Playwright browser instead of AdsPower:
- Anti-detection features enabled
- Persistent sessions (stay logged in)
- Profile stored in `~/bord/data/browser-profiles/`

## Data Storage

- **Database**: SQLite at `~/bord/data/x-reply-guy/replies.db`
- **Browser profiles**: `~/bord/data/browser-profiles/[profile-name]/`
- **Secrets**: `.env.local` (never commit this)

## Adding New Apps

Apps are installed to `apps/[app-name]/` with a `config.json`:

```json
{
  "id": "my-app",
  "name": "My App",
  "description": "What it does",
  "href": "/my-app",
  "color": "#hex",
  "icon": "/icons/my-app.webp"
}
```

Then create pages in `app/[app-name]/`.

## X Reply Guy App

The X Reply Guy app has a **dark theme** with its own layout. Key files:

- `app/x-reply-guy/layout.tsx` - Dark sidebar layout (overrides root layout)
- `app/x-reply-guy/page.tsx` - Main dashboard
- `app/x-reply-guy/f4f/page.tsx` - Follow4Follow tracker
- `app/x-reply-guy/school/page.tsx` - Reply training interface
- `app/x-reply-guy/agent-config.ts` - Bot configuration and prompts
- `lib/x-reply-guy-db.ts` - SQLite database functions

### Dark Theme Pattern

X Reply Guy uses a custom `layout.tsx` to override the default light sidebar:
- Background: `#000` (black)
- Sidebar: `#0a0a0a` with `#222` borders
- Text: `#888` (gray), white on hover
- Active item: `#1d9bf0` (Twitter blue)

### API Routes

All API routes use local SQLite storage (no external database):
- `/x-reply-guy/api/replies` - Get/list replies
- `/x-reply-guy/api/follow4follow` - F4F tracking
- `/x-reply-guy/api/sync` - Run sync scripts
- `/api/x-reply-guy/school` - Training ratings
- `/api/x-reply-guy/school/prompt` - Generate training prompt

### Database Schema

SQLite tables in `~/bord/data/x-reply-guy/replies.db`:
- `x_replies` - Tweet replies with impressions, likes, strategy, school ratings
- `x_following` - Follow4Follow tracking with follow-back status

---

**This is an open source project. Never commit credentials or personal data.**
