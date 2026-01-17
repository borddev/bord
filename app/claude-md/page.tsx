'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ClaudeMdFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'core' | 'app';
}

export default function ClaudeMdPage() {
  const [files, setFiles] = useState<ClaudeMdFile[]>([]);
  const [selected, setSelected] = useState<ClaudeMdFile | null>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const res = await fetch('/api/claude-md');
      const data = await res.json();
      setFiles(data.files || []);
      if (data.files?.length > 0) {
        selectFile(data.files[0]);
      }
    } catch {
      setFiles([]);
    }
  }

  function selectFile(file: ClaudeMdFile) {
    setSelected(file);
    setContent(file.content);
    setSaved(false);
  }

  async function saveFile() {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch('/api/claude-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selected.path, content })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save:', e);
    }
    setSaving(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/home"
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Home
          </Link>
          <h1 style={{ fontSize: 16, fontWeight: 500 }}>CLAUDE.md</h1>
        </div>
        <button
          onClick={saveFile}
          disabled={saving || !selected}
          style={{
            background: saved ? '#22c55e' : '#fff',
            color: saved ? '#fff' : '#000',
            border: 'none',
            padding: '8px 20px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: saving ? 'wait' : 'pointer',
            opacity: !selected ? 0.5 : 1
          }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 240,
          borderRight: '1px solid #222',
          padding: 16,
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#666', fontSize: 10, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase' }}>
              Core
            </div>
            {files.filter(f => f.type === 'core').map(file => (
              <button
                key={file.id}
                onClick={() => selectFile(file)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: selected?.id === file.id ? '#222' : 'transparent',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 6,
                  color: selected?.id === file.id ? '#fff' : '#888',
                  cursor: 'pointer',
                  fontSize: 13,
                  marginBottom: 4
                }}
              >
                {file.name}
              </button>
            ))}
          </div>

          {files.filter(f => f.type === 'app').length > 0 && (
            <div>
              <div style={{ color: '#666', fontSize: 10, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase' }}>
                Apps
              </div>
              {files.filter(f => f.type === 'app').map(file => (
                <button
                  key={file.id}
                  onClick={() => selectFile(file)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: selected?.id === file.id ? '#222' : 'transparent',
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: 6,
                    color: selected?.id === file.id ? '#fff' : '#888',
                    cursor: 'pointer',
                    fontSize: 13,
                    marginBottom: 4
                  }}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selected ? (
            <>
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid #222',
                fontSize: 12,
                color: '#666'
              }}>
                {selected.path}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  flex: 1,
                  background: '#0a0a0a',
                  color: '#e0e0e0',
                  border: 'none',
                  padding: 20,
                  fontSize: 13,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none'
                }}
                spellCheck={false}
              />
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444'
            }}>
              Select a file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
