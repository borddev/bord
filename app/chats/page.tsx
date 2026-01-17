'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Folder, FileText, Calendar, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';

interface ChatItem {
  name: string;
  type: 'chat' | 'project';
  path: string;
  slug: string;
  modifiedAt?: string;
}

export default function ChatsPage() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chats');
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data = await res.json();
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError('Error loading chats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const res = await fetch(`/api/chats/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchChats();
    } catch (err) {
      alert('Error deleting chat');
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const chats = items.filter(i => i.type === 'chat');
  const projects = items.filter(i => i.type === 'project');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            Saved Chats
          </h1>
          <p className="text-gray-500 mt-1">
            Conversations and projects saved from Claude Code
          </p>
        </div>
        <button
          onClick={fetchChats}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No saved chats</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Save important conversations in the <code className="bg-gray-200 px-2 py-0.5 rounded">CHAT/</code>
            folder as .md files to view them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-500" />
                Projects ({projects.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((item) => (
                  <div key={item.slug} className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition-all relative">
                    <Link href={`/chats/${item.slug}`} className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-lg">
                            <Folder className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 group-hover:text-amber-700">
                              {item.name.replace('project-', '').replace(/-/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-400">Project</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </Link>
                    <button
                      onClick={(e) => deleteChat(item.slug, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Chats */}
          {chats.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Chats ({chats.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {chats.map((item) => (
                  <div key={item.slug} className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all relative">
                    <Link href={`/chats/${item.slug}`} className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                              {item.name.replace('chat-', '').replace('.md', '').replace(/-/g, ' ')}
                            </h3>
                            <p className="text-sm text-gray-400">Chat</p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                    <button
                      onClick={(e) => deleteChat(item.slug, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">How to save a chat</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Create a file <code className="bg-gray-200 px-1.5 py-0.5 rounded">chat-topic.md</code> in the CHAT/ folder</li>
          <li>• For complex projects, create a folder <code className="bg-gray-200 px-1.5 py-0.5 rounded">project-name/</code></li>
          <li>• Use the template in README.md for structure</li>
        </ul>
      </div>
    </div>
  );
}
