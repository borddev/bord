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
  installed: boolean;
}

const coreApps: App[] = [
  {
    id: 'secrets',
    name: 'Secrets',
    description: 'Manage API keys securely',
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    href: '/secrets',
    color: '#22c55e',
    installed: true
  },
  {
    id: 'open-source',
    name: 'Apps',
    description: 'Browse & install automation apps',
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    href: '/open-source',
    color: '#8b5cf6',
    installed: true
  }
];

export default function Home() {
  const [installedApps, setInstalledApps] = useState<App[]>([]);

  useEffect(() => {
    // Check for installed apps by looking for their config files
    // This would be populated by installed apps
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
    <div style={{ minHeight: '100vh', padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8 }}>
          BORD
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Build Once, Run Daily
        </p>
      </div>

      {/* App Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
        maxWidth: 900,
        margin: '0 auto'
      }}>
        {allApps.map(app => (
          <Link
            key={app.id}
            href={app.href}
            style={{
              display: 'block',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = app.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#222';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: app.color + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              {app.icon}
            </div>

            {/* Content */}
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
              {app.name}
            </h3>
            <p style={{ color: '#888', fontSize: 13 }}>
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
        fontSize: 12
      }}>
        <p>
          <a
            href="https://bord.dev"
            target="_blank"
            style={{ color: '#666', textDecoration: 'underline' }}
          >
            bord.dev
          </a>
          {' · '}
          <a
            href="https://github.com/user/bord"
            target="_blank"
            style={{ color: '#666', textDecoration: 'underline' }}
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
