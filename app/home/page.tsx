'use client';

import Link from 'next/link';
import Image from 'next/image';

const apps = [
  { name: 'X Reply Guy', href: '/x-reply-guy', icon: '/icons/x-reply.webp', description: 'X/Twitter automation' },
  { name: 'Chats', href: '/chats', icon: '/icons/chats.webp', description: 'Saved conversations' },
  { name: 'Files', href: '/files', icon: '/icons/files.webp', description: 'File browser' },
  { name: 'Secrets', href: '/secrets', icon: '/icons/secrets.webp', description: 'API keys & secrets' },
  { name: 'CLAUDE.md', href: '/claude-md', icon: '/icons/claude-md.webp', description: 'Instructions editor' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Select an app to get started</p>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {apps.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div className="w-12 h-12 mb-3 relative">
              <Image
                src={app.icon}
                alt={app.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">{app.name}</span>
            <span className="text-xs text-gray-500 text-center mt-1">{app.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
