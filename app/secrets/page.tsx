'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Secret {
  key: string;
  value: string;
  masked: string;
}

interface SecretKey {
  key: string;
  description: string;
  required: boolean;
  default?: string;
}

// Core BORD secrets - apps can add their own
const CORE_SECRET_KEYS: SecretKey[] = [
  { key: 'ADSPOWER_API', description: 'AdsPower API URL', required: false, default: 'http://127.0.0.1:50325' },
];

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [secretKeys, setSecretKeys] = useState<SecretKey[]>(CORE_SECRET_KEYS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showValues, setShowValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSecrets();
    loadSecretKeys();
  }, []);

  async function loadSecrets() {
    try {
      const res = await fetch('/api/secrets');
      const data = await res.json();
      setSecrets(data.secrets || []);
    } catch (e) {
      console.error('Failed to load secrets');
    }
    setLoading(false);
  }

  async function loadSecretKeys() {
    // Apps register their required secrets here
    try {
      const res = await fetch('/api/secrets/keys');
      const data = await res.json();
      setSecretKeys([...CORE_SECRET_KEYS, ...(data.keys || [])]);
    } catch {
      // Use core keys only
    }
  }

  async function saveSecret(key: string, value: string) {
    try {
      await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      await loadSecrets();
      setEditing(null);
      setEditValue('');
    } catch (e) {
      console.error('Failed to save secret');
    }
  }

  function toggleShowValue(key: string) {
    const newSet = new Set(showValues);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setShowValues(newSet);
  }

  function getSecretValue(key: string): string | null {
    const secret = secrets.find(s => s.key === key);
    return secret?.value || null;
  }

  function getMaskedValue(key: string): string {
    const secret = secrets.find(s => s.key === key);
    if (!secret?.value) return '(not set)';
    const val = secret.value;
    if (val.length <= 8) return '••••••••';
    return val.slice(0, 4) + '••••••••' + val.slice(-4);
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <Link href="/" style={{ color: '#666', fontSize: 12, display: 'block', marginBottom: 16 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 10 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Secrets
        </h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Manage your API keys and credentials securely
        </p>
      </div>

      {/* Secrets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {secretKeys.map(({ key, description, required }) => {
          const isSet = !!getSecretValue(key);
          const isEditing = editing === key;

          return (
            <div
              key={key}
              style={{
                background: '#111',
                border: `1px solid ${isSet ? '#222' : '#442'}`,
                borderRadius: 12,
                padding: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{key}</span>
                    {required && (
                      <span style={{ fontSize: 10, color: '#f97316', background: '#f9731620', padding: '2px 6px', borderRadius: 4 }}>
                        Required
                      </span>
                    )}
                    {isSet && (
                      <span style={{ fontSize: 10, color: '#22c55e', background: '#22c55e20', padding: '2px 6px', borderRadius: 4 }}>
                        Set
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{description}</p>
                </div>
                <button
                  onClick={() => {
                    if (isEditing) {
                      setEditing(null);
                      setEditValue('');
                    } else {
                      setEditing(key);
                      setEditValue(getSecretValue(key) || '');
                    }
                  }}
                  style={{
                    background: isEditing ? '#333' : 'transparent',
                    border: '1px solid #333',
                    color: '#888',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`Enter ${key}`}
                    style={{
                      flex: 1,
                      background: '#000',
                      border: '1px solid #333',
                      borderRadius: 6,
                      padding: '8px 12px',
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: 13
                    }}
                  />
                  <button
                    onClick={() => saveSecret(key, editValue)}
                    style={{
                      background: '#22c55e',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <code style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: isSet ? '#888' : '#555',
                    background: '#0a0a0a',
                    padding: '4px 8px',
                    borderRadius: 4
                  }}>
                    {showValues.has(key) && isSet ? getSecretValue(key) : getMaskedValue(key)}
                  </code>
                  {isSet && (
                    <button
                      onClick={() => toggleShowValue(key)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: 11
                      }}
                    >
                      {showValues.has(key) ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div style={{
        marginTop: 40,
        padding: 16,
        background: '#111',
        border: '1px solid #222',
        borderRadius: 12,
        fontSize: 13,
        color: '#666'
      }}>
        <strong style={{ color: '#888' }}>Note:</strong> Secrets are stored in{' '}
        <code style={{ color: '#888' }}>.env.local</code> file which is gitignored.
        They are never committed to your repository.
      </div>
    </div>
  );
}
