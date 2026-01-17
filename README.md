# BORD

**Build Once, Run Daily** — Monorepo for AI automations.

## Install

1. Run `claude --dangerously-skip-permissions`
2. Copy the prompt below and paste:

```
You are installing BORD, a monorepo for AI-powered automations.

STEP 1: SHOW WELCOME
Print this exactly:

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

STEP 2: CHECK NODE.JS
Run: node -v
- If v18+: Continue
- If not installed: Tell user to install from https://nodejs.org

STEP 2.5: INSTALL NOTIFICATIONS
Run: brew install terminal-notifier
Tell user: "A popup will ask to allow notifications - click Allow. This lets BORD notify you when tasks complete."

STEP 3: INSTALL BORD
Check if ~/bord exists: ls ~/bord 2>/dev/null
- If exists: Ask "Use existing ~/bord? (yes/no)"
- If not: Run: git clone https://github.com/borddev/bord ~/bord
Print: [██████████░░░░░░░░░░] 50% - BORD cloned

STEP 4: INSTALL DEPENDENCIES
Run: cd ~/bord && npm install
Print: [████████████████████] 100% - Dependencies installed

STEP 5: CREATE ENV FILE
Run: cp ~/bord/.env.example ~/bord/.env.local

STEP 6: COMPLETE
Print:
════════════════════════════════════════════════════════════════
 ✓ BORD INSTALLED
════════════════════════════════════════════════════════════════

 Location: ~/bord

 NEXT STEPS:
 1. A new terminal will open at ~/bord
 2. Run: claude --dangerously-skip-permissions
 3. Say "start the dev server"

 INSTALL AN APP:
 • x-reply-guy: https://github.com/borddev/x-reply-guy

════════════════════════════════════════════════════════════════

STEP 7: OPEN NEW TERMINAL
Run: osascript -e 'tell application "Terminal" to do script "cd ~/bord && echo Welcome to BORD! && echo && echo Run: claude --dangerously-skip-permissions"'
Tell user: "New terminal opened. Run claude --dangerously-skip-permissions there."
```

## Apps

| App | Description |
|-----|-------------|
| [x-reply-guy](https://github.com/borddev/x-reply-guy) | AI-powered Twitter/X reply bot |

## Links

- [bord.dev](https://bord.dev)
- [Issues](https://github.com/borddev/bord/issues)
