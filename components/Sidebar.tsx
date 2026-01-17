'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/home', icon: '/icons/home.webp' },
  { name: 'X Reply Guy', href: '/x-reply-guy', icon: '/icons/x-reply.webp' },
  { name: 'Chats', href: '/chats', icon: '/icons/chats.webp' },
  { name: 'Files', href: '/files', icon: '/icons/files.webp' },
  { name: 'Secrets', href: '/secrets', icon: '/icons/secrets.webp' },
  { name: 'CLAUDE.md', href: '/claude-md', icon: '/icons/claude-md.webp' },
];

function NavIcon({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={20}
      height={20}
      className={cn('w-5 h-5 rounded', className)}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`fixed left-0 top-0 h-full bg-gsc-surface border-r border-gsc-border flex flex-col transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gsc-border justify-between">
        {!isCollapsed && (
          <Link href="/home" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="BORD" width={28} height={28} />
            <span className="font-heading font-bold text-lg tracking-tight">BORD</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/home" className="mx-auto">
            <Image src="/logo.svg" alt="BORD" width={24} height={24} />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-gsc-blue'
                  : 'text-gsc-text-secondary hover:bg-gray-50 hover:text-gsc-text-primary',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : ''}
            >
              <NavIcon src={item.icon} alt={item.name} className={!isCollapsed ? 'mr-3' : ''} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-gsc-border p-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors text-gsc-text-secondary"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gsc-border text-xs text-gsc-text-secondary">
          <p>BORD Dashboard</p>
          <p className="mt-1">Build Once, Run Daily</p>
        </div>
      )}
    </div>
  );
}
