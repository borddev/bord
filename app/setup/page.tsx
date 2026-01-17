'use client';

import { useState, useEffect, useRef } from 'react';

interface SetupStatus {
  step: number;
  message: string;
  progress: number;
  complete: boolean;
  error?: string;
  redirect?: string;
  logs?: string[];
  app?: {
    name: string;
    description: string;
    icon: string;
    features: string[];
  };
  waitingForLogin?: boolean;
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus>({
    step: 0,
    message: 'Initializing...',
    progress: 0,
    complete: false,
    logs: []
  });
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/setup');
        const data = await res.json();
        setStatus(data);

        if (data.complete && data.redirect) {
          clearInterval(poll);
          // Play success sound
          try {
            const audio = new Audio('/api/setup/sound?type=complete');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 2500);
        }
      } catch (e) {
        // Keep polling
      }
    }, 500);

    return () => clearInterval(poll);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [status.logs]);

  const steps = [
    { num: 1, label: 'Install' },
    { num: 2, label: 'Browser' },
    { num: 3, label: 'Login' },
    { num: 4, label: 'Ready' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex'
    }}>
      {/* Left side - Progress */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRight: '1px solid #222'
      }}>
        {/* BORD Logo */}
        <pre style={{
          fontSize: 12,
          lineHeight: 1.2,
          marginBottom: 30,
          color: '#444',
          fontFamily: 'monospace'
        }}>
{`██████╗  ██████╗ ██████╗ ██████╗
██╔══██╗██╔═══██╗██╔══██╗██╔══██╗
██████╔╝██║   ██║██████╔╝██║  ██║
██╔══██╗██║   ██║██╔══██╗██║  ██║
██████╔╝╚██████╔╝██║  ██║██████╔╝
╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝`}
        </pre>

        {/* App being installed */}
        {status.app && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
            padding: 20,
            background: '#111',
            borderRadius: 12,
            border: '1px solid #222',
            width: '100%',
            maxWidth: 360
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1d9bf0 0%, #0d8bd9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{status.app.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{status.app.description}</div>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div style={{
          fontSize: 18,
          marginBottom: 24,
          color: status.error ? '#ef4444' : status.complete ? '#22c55e' : '#fff',
          textAlign: 'center',
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {status.waitingForLogin && (
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f59e0b',
              animation: 'pulse 1.5s infinite'
            }} />
          )}
          {status.message}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: 360,
          maxWidth: '90vw',
          height: 6,
          background: '#222',
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 30
        }}>
          <div style={{
            width: `${status.progress}%`,
            height: '100%',
            background: status.error ? '#ef4444' : status.complete ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #1d9bf0)',
            transition: 'width 0.5s ease',
            borderRadius: 3
          }} />
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: s.num < status.step ? '#22c55e' : s.num === status.step ? '#3b82f6' : '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: s.num <= status.step ? '#fff' : '#666',
                  transition: 'all 0.3s ease',
                  boxShadow: s.num === status.step ? '0 0 20px rgba(59,130,246,0.5)' : 'none'
                }}>
                  {s.num < status.step ? '✓' : s.num}
                </div>
                <span style={{
                  fontSize: 10,
                  color: s.num <= status.step ? '#888' : '#444'
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 40,
                  height: 2,
                  background: s.num < status.step ? '#22c55e' : '#222',
                  marginLeft: 8,
                  marginRight: 8,
                  marginBottom: 20,
                  transition: 'background 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Features (when app is set) */}
        {status.app?.features && status.app.features.length > 0 && (
          <div style={{
            marginTop: 40,
            padding: 16,
            background: '#0a0a0a',
            borderRadius: 8,
            width: '100%',
            maxWidth: 360
          }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 10 }}>FEATURES</div>
            {status.app.features.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: '#888',
                marginBottom: 6
              }}>
                <span style={{ color: '#22c55e' }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Terminal Log */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a'
      }}>
        {/* Terminal header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca42' }} />
          </div>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>Setup Log</span>
        </div>

        {/* Terminal content */}
        <div
          ref={logRef}
          style={{
            flex: 1,
            padding: 16,
            fontFamily: 'Monaco, Menlo, monospace',
            fontSize: 11,
            lineHeight: 1.6,
            overflowY: 'auto',
            color: '#888'
          }}
        >
          {(!status.logs || status.logs.length === 0) ? (
            <div style={{ color: '#444' }}>Waiting for setup to start...</div>
          ) : (
            status.logs.map((log, i) => (
              <div key={i} style={{
                color: log.startsWith('✓') ? '#22c55e' :
                       log.startsWith('→') ? '#3b82f6' :
                       log.startsWith('!') ? '#f59e0b' :
                       log.startsWith('✗') ? '#ef4444' : '#888'
              }}>
                {log}
              </div>
            ))
          )}
          {!status.complete && (
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 14,
              background: '#3b82f6',
              animation: 'blink 1s infinite'
            }} />
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
