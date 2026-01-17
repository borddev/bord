# BORD

**Build Once, Run Daily** — A monorepo for AI-powered automations.

## Install

**1. Start Claude Code:**
```bash
claude --dangerously-skip-permissions
```

**2. Copy everything below and paste:**

---

You are installing **BORD**, a monorepo for AI-powered automations.

## Step 1: Show Welcome

Print this exactly:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│    ██████╗  ██████╗ ██████╗ ██████╗                          │
│    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗                         │
│    ██████╔╝██║   ██║██████╔╝██║  ██║                         │
│    ██╔══██╗██║   ██║██╔══██╗██║  ██║                         │
│    ██████╔╝╚██████╔╝██║  ██║██████╔╝                         │
│    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝                          │
│                                                              │
│    Build Once, Run Daily                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Step 2: Check Node.js

Run `node -v` to check if Node.js is installed.
- If installed (v18+): ✓ Node.js ready
- If not installed: Tell user to install from https://nodejs.org and come back

## Step 3: Install BORD

Check if ~/bord already exists:
```bash
ls ~/bord 2>/dev/null
```

If it exists, ask: "BORD is already installed at ~/bord. Use existing installation? (yes/no)"
- If yes: Skip to Step 5
- If no: Ask if they want to delete and reinstall

If it doesn't exist, clone:
```bash
git clone https://github.com/borddev/bord ~/bord
```

Print: `[██████████░░░░░░░░░░] 50% - BORD cloned`

## Step 4: Install Dependencies

```bash
cd ~/bord && npm install
```

Print: `[████████████████████] 100% - Dependencies installed`

## Step 5: Create Environment File

Check if ~/bord/.env.local exists. If not, create it:

```bash
cp ~/bord/.env.example ~/bord/.env.local
```

## Step 6: Complete

Print this:

```
════════════════════════════════════════════════════════════════
 ✓ BORD INSTALLED
════════════════════════════════════════════════════════════════

 Location: ~/bord

 NEXT STEPS:
 ───────────
 1. A new terminal window will open at ~/bord
 2. Run: claude --dangerously-skip-permissions
 3. Say "start the dev server" to launch BORD

 INSTALL AN APP:
 ───────────────
 Go to an app repo and copy its install prompt:
 • x-reply-guy: https://github.com/borddev/x-reply-guy

════════════════════════════════════════════════════════════════

Opening new terminal...
```

## Step 7: Open New Terminal

Run this to open a new terminal window in ~/bord:

```bash
osascript -e 'tell application "Terminal" to do script "cd ~/bord && echo \"Welcome to BORD!\" && echo \"\" && echo \"Run: claude --dangerously-skip-permissions\" && echo \"\""'
```

Tell the user: "A new Terminal window opened. Run `claude --dangerously-skip-permissions` there to continue."

---

## What is BORD?

BORD is a monorepo that hosts automation apps. Each app is a separate repo that installs into BORD.

```
~/bord/
├── app/           # Dashboard pages
│   ├── home/      # App grid
│   ├── secrets/   # API key manager
│   ├── claude-md/ # Edit CLAUDE.md files
│   └── chats/     # Claude Code history
├── apps/          # Installed apps go here
│   └── x-reply-guy/
└── .env.local     # All your secrets
```

## Apps

| App | Description |
|-----|-------------|
| [x-reply-guy](https://github.com/borddev/x-reply-guy) | AI-powered Twitter/X reply bot |

## Links

- [bord.dev](https://bord.dev)
- [Report Issues](https://github.com/borddev/bord/issues)
