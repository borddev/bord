'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AppInfo {
  id: string;
  name: string;
  description: string;
  repo: string;
  color: string;
  stars?: number;
  installed: boolean;
}

// Available apps from the BORD ecosystem
const AVAILABLE_APPS: AppInfo[] = [
  {
    id: 'x-reply-guy',
    name: 'X Reply Guy',
    description: 'AI-powered Twitter/X reply bot that generates witty responses to viral tweets',
    repo: 'https://github.com/user/x-reply-guy',
    color: '#1d9bf0',
    installed: false
  },
  // More apps will be added here
];

export default function OpenSourcePage() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyInstallPrompt(app: AppInfo) {
    const prompt = `# Install ${app.name} for BORD

Follow these steps to install ${app.name}:

1. If BORD is not installed, clone it first:
   git clone https://github.com/user/bord ./bord

2. Clone ${app.name}:
   git clone ${app.repo} ./bord/apps/${app.id}

3. Install and run:
   cd bord && npm install && npm run dev

4. Open http://localhost:3000/${app.id}

Show progress while installing.`;

    await navigator.clipboard.writeText(prompt);
    setCopied(app.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Link href="/" style={{ color: '#666', fontSize: 12, display: 'block', marginBottom: 16 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8b5cf6" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 10 }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          Open Source Apps
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Browse and install automation apps for BORD
        </p>
      </div>

      {/* How to Install */}
      <div style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>How to Install Apps</h3>
        <ol style={{ color: '#888', fontSize: 13, lineHeight: 1.8, paddingLeft: 20 }}>
          <li>Click "Copy Install Prompt" on any app below</li>
          <li>Open Claude Code (or your AI coding assistant)</li>
          <li>Paste the prompt and let it install everything</li>
          <li>The app will appear in your BORD dashboard</li>
        </ol>
      </div>

      {/* Apps Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {AVAILABLE_APPS.map(app => (
          <div
            key={app.id}
            style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: app.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={app.color}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{app.name}</h3>
                  <a
                    href={app.repo}
                    target="_blank"
                    style={{ fontSize: 11, color: '#666', textDecoration: 'underline' }}
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
              <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
                {app.description}
              </p>
            </div>

            <button
              onClick={() => copyInstallPrompt(app)}
              style={{
                background: copied === app.id ? '#22c55e' : '#222',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginLeft: 20
              }}
            >
              {copied === app.id ? 'Copied!' : 'Copy Install Prompt'}
            </button>
          </div>
        ))}
      </div>

      {/* Contribute */}
      <div style={{
        marginTop: 40,
        padding: 20,
        background: '#111',
        border: '1px solid #222',
        borderRadius: 12,
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Build Your Own App</h3>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
          Create an automation app and share it with the BORD community
        </p>
        <a
          href="https://github.com/user/bord#contributing"
          target="_blank"
          style={{
            display: 'inline-block',
            background: '#8b5cf6',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          Contribution Guide
        </a>
      </div>
    </div>
  );
}
