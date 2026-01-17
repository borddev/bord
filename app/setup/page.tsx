'use client';

import { useState, useEffect } from 'react';

interface SetupStatus {
  step: number;
  message: string;
  progress: number;
  complete: boolean;
  error?: string;
  redirect?: string;
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus>({
    step: 0,
    message: 'Starting setup...',
    progress: 0,
    complete: false
  });

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/setup');
        const data = await res.json();
        setStatus(data);

        if (data.complete && data.redirect) {
          clearInterval(poll);
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 2000);
        }
      } catch (e) {
        // Keep polling
      }
    }, 500);

    return () => clearInterval(poll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: 40
    }}>
      {/* BORD Logo */}
      <pre style={{
        fontSize: 14,
        lineHeight: 1.2,
        marginBottom: 40,
        color: '#fff',
        fontFamily: 'monospace'
      }}>
{`██████╗  ██████╗ ██████╗ ██████╗
██╔══██╗██╔═══██╗██╔══██╗██╔══██╗
██████╔╝██║   ██║██████╔╝██║  ██║
██╔══██╗██║   ██║██╔══██╗██║  ██║
██████╔╝╚██████╔╝██║  ██║██████╔╝
╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝`}
      </pre>

      {/* Status Message */}
      <div style={{
        fontSize: 18,
        marginBottom: 30,
        color: status.error ? '#ef4444' : status.complete ? '#22c55e' : '#fff',
        textAlign: 'center',
        minHeight: 30
      }}>
        {status.message}
      </div>

      {/* Progress Bar */}
      <div style={{
        width: 400,
        maxWidth: '90vw',
        height: 8,
        background: '#222',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 20
      }}>
        <div style={{
          width: `${status.progress}%`,
          height: '100%',
          background: status.error ? '#ef4444' : status.complete ? '#22c55e' : '#3b82f6',
          transition: 'width 0.3s ease',
          borderRadius: 4
        }} />
      </div>

      {/* Progress Text */}
      <div style={{
        fontSize: 12,
        color: '#666'
      }}>
        {status.progress}% complete
      </div>

      {/* Steps indicator */}
      {status.step > 0 && (
        <div style={{
          marginTop: 40,
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}>
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: s < status.step ? '#22c55e' : s === status.step ? '#3b82f6' : '#222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: s <= status.step ? '#fff' : '#666',
                transition: 'all 0.3s ease'
              }}
            >
              {s < status.step ? '✓' : s}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 30,
        color: '#444',
        fontSize: 11
      }}>
        Build Once, Run Daily
      </div>
    </div>
  );
}
