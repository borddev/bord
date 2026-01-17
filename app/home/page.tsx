'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const coreApps: App[] = [
  {
    id: 'secrets',
    name: 'Secrets',
    description: 'Manage API keys',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    href: '/secrets',
    color: '#22c55e'
  },
  {
    id: 'claude-md',
    name: 'CLAUDE.md',
    description: 'Edit AI instructions',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    href: '/claude-md',
    color: '#f97316'
  },
  {
    id: 'chats',
    name: 'Chats',
    description: 'View Claude Code history',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    href: '/chats',
    color: '#8b5cf6'
  }
];

export default function HomePage() {
  const [installedApps, setInstalledApps] = useState<App[]>([]);

  useEffect(() => {
    const checkInstalledApps = async () => {
      try {
        const res = await fetch('/api/apps');
        const data = await res.json();
        setInstalledApps(data.apps || []);
      } catch {
        setInstalledApps([]);
      }
    };
    checkInstalledApps();
  }, []);

  const allApps = [...coreApps, ...installedApps];

  return (
    <div style={{
      minHeight: '100vh',
      padding: '60px 40px',
      background: '#000'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 50, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: '-0.02em'
        }}>
          BORD
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Build Once, Run Daily
        </p>
      </div>

      {/* App Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        maxWidth: 700,
        margin: '0 auto'
      }}>
        {allApps.map(app => (
          <Link
            key={app.id}
            href={app.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: '28px 20px',
              transition: 'all 0.15s',
              textDecoration: 'none',
              color: '#fff'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.background = '#151515';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#222';
              e.currentTarget.style.background = '#111';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: app.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              color: '#fff'
            }}>
              {app.icon}
            </div>

            {/* Content */}
            <h3 style={{
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 4,
              textAlign: 'center'
            }}>
              {app.name}
            </h3>
            <p style={{
              color: '#666',
              fontSize: 12,
              textAlign: 'center'
            }}>
              {app.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 60,
        textAlign: 'center',
        color: '#444',
        fontSize: 11
      }}>
        <a
          href="https://github.com/borddev/bord"
          target="_blank"
          style={{ color: '#555', textDecoration: 'none' }}
        >
          github.com/borddev/bord
        </a>
      </div>
    </div>
  );
}
