'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ClipboardList, BarChart3, Users, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/reports', label: 'Reports', icon: ClipboardList },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/collab', label: 'Collab', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 h-16 w-auto -translate-x-1/2 rounded-full border bg-card/95 backdrop-blur-sm">
      <TooltipProvider delayDuration={0}>
        <nav className="flex h-full items-center gap-2 p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'group relative flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-full text-center transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                     <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="sm:hidden">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>
    </div>
  );
}
