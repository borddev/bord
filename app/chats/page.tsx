'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Chat {
  id: string;
  name: string;
  date: string;
  preview: string;
  messageCount: number;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    setLoading(true);
    try {
      const res = await fetch('/api/chats');
      const data = await res.json();
      setChats(data.chats || []);
    } catch {
      setChats([]);
    }
    setLoading(false);
  }

  async function selectChat(chat: Chat) {
    setSelected(chat);
    try {
      const res = await fetch(`/api/chats/${chat.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        gap: 16
      }}>
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
        <h1 style={{ fontSize: 16, fontWeight: 500 }}>Chats</h1>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Chat List */}
        <div style={{
          width: 300,
          borderRight: '1px solid #222',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ padding: 20, color: '#666, fontSize: 13 }}>
              Loading...
            </div>
          ) : chats.length === 0 ? (
            <div style={{ padding: 20, color: '#666', fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>No chats found.</p>
              <p style={{ color: '#555', fontSize: 12 }}>
                Claude Code chats are stored in ~/.claude/projects/
              </p>
            </div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => selectChat(chat)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: selected?.id === chat.id ? '#151515' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #191919',
                  padding: '14px 16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4
                }}>
                  <span style={{
                    color: selected?.id === chat.id ? '#fff' : '#ccc',
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {chat.name}
                  </span>
                  <span style={{ color: '#555', fontSize: 11 }}>
                    {formatDate(chat.date)}
                  </span>
                </div>
                <div style={{
                  color: '#666',
                  fontSize: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {chat.preview}
                </div>
                <div style={{ color: '#444', fontSize: 10, marginTop: 4 }}>
                  {chat.messageCount} messages
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20
        }}>
          {selected ? (
            <div style={{ maxWidth: 800 }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    background: msg.role === 'user' ? '#0a1628' : '#111',
                    borderRadius: 12,
                    border: `1px solid ${msg.role === 'user' ? '#1e3a5f' : '#222'}`
                  }}
                >
                  <div style={{
                    fontSize: 10,
                    color: msg.role === 'user' ? '#5b9bd5' : '#888',
                    marginBottom: 8,
                    fontWeight: 500,
                    textTransform: 'uppercase'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Claude'}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#ddd',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content.slice(0, 2000)}
                    {msg.content.length > 2000 && (
                      <span style={{ color: '#666' }}>... (truncated)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#444'
            }}>
              Select a chat to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
