'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, Plus, Key } from 'lucide-react';

interface SecretInfo {
  key: string;
  hasValue: boolean;
  valuePreview: string;
  fullValue?: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<SecretInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      const response = await fetch('/api/secrets');
      const data = await response.json();
      setSecrets(data.secrets || []);
    } catch (error) {
      console.error('Failed to load secrets:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecret = async (key: string, value: string) => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${key} saved` });
        setEditingKey(null);
        setEditValue('');
        setNewKey('');
        setNewValue('');
        setShowAddForm(false);
        await loadSecrets();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteSecret = async (key: string) => {
    if (!confirm(`Are you sure you want to delete ${key}?`)) return;

    try {
      const response = await fetch('/api/secrets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${key} deleted` });
        await loadSecrets();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const configured = secrets.filter(s => s.hasValue).length;
  const total = secrets.length;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Key className="w-7 h-7 text-red-600" />
            Secrets
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {configured}/{total} configured
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Secret
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 text-sm rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Add New Secret Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Add New Secret</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              placeholder="KEY_NAME"
              className="px-3 py-2 border rounded text-sm font-mono flex-1"
            />
            <input
              type="password"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value"
              className="px-3 py-2 border rounded text-sm font-mono flex-1"
            />
            <button
              onClick={() => saveSecret(newKey, newValue)}
              disabled={!newKey || !newValue || saving}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50 hover:bg-blue-700"
            >
              {saving ? '...' : 'Save'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewKey(''); setNewValue(''); }}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Secrets Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left bg-gray-50">
              <th className="py-3 px-4 font-medium">Key</th>
              <th className="py-3 px-4 font-medium">Value</th>
              <th className="py-3 px-4 font-medium w-32"></th>
            </tr>
          </thead>
          <tbody>
            {secrets.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-500">
                  No secrets configured yet. Add your first secret above.
                </td>
              </tr>
            ) : (
              secrets.map((secret) => {
                const isVisible = visibleSecrets.has(secret.key);
                const displayValue = secret.hasValue
                  ? (isVisible && secret.fullValue ? secret.fullValue : secret.valuePreview)
                  : '-';

                return (
                  <tr key={secret.key} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{secret.key}</code>
                    </td>
                    <td className="py-3 px-4">
                      {editingKey === secret.key ? (
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Enter value"
                            className="px-2 py-1 border rounded text-xs font-mono w-48"
                            autoFocus
                          />
                          <button
                            onClick={() => saveSecret(secret.key, editValue)}
                            disabled={!editValue || saving}
                            className="px-2 py-1 bg-gray-900 text-white rounded text-xs disabled:opacity-50"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => { setEditingKey(null); setEditValue(''); }}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {secret.hasValue && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleSecretVisibility(secret.key)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title={isVisible ? 'Hide' : 'Show'}
                              >
                                {isVisible ? (
                                  <EyeOff className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(secret.fullValue || '', secret.key)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy"
                              >
                                {copiedKey === secret.key ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-500" />
                                )}
                              </button>
                            </div>
                          )}
                          <code className={`text-xs ${secret.hasValue ? 'text-gray-700' : 'text-gray-400'} ${isVisible ? 'break-all' : ''}`}>
                            {displayValue}
                          </code>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {editingKey !== secret.key && (
                          <>
                            <button
                              onClick={() => setEditingKey(secret.key)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {secret.hasValue ? 'Edit' : 'Set'}
                            </button>
                            {secret.hasValue && (
                              <button
                                onClick={() => deleteSecret(secret.key)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Secrets are saved to .env.local and will be used by the application.
      </p>
    </div>
  );
}
