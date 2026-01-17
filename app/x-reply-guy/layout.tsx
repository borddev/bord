'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function XReplyGuyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/x-reply-guy', label: 'X Reply Guy' },
    { href: '/chats', label: 'Chats' },
    { href: '/files', label: 'Files' },
    { href: '/secrets', label: 'Secrets' },
    { href: '/claude-md', label: 'CLAUDE.md' },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      {/* Dark Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-[#0a0a0a] border-r border-[#222] flex flex-col z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#222]">
          <Link href="/home" className="flex items-center gap-2">
            <img src="/logo.svg" alt="BORD" width={28} height={28} />
            <span className="font-bold text-lg text-white">BORD</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/home' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1d9bf0] text-white'
                    : 'text-[#888] hover:bg-[#111] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] text-xs text-[#555]">
          <p>BORD Dashboard</p>
          <p className="mt-1">Build Once, Run Daily</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        {children}
      </main>
    </div>
  );
}
