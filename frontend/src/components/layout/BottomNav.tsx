import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const navItems = [
  { icon: Home, label: 'Beranda', path: ROUTES.DASHBOARD },
  { icon: ClipboardList, label: 'Tugas', path: ROUTES.TUGAS },
  { icon: Calendar, label: 'Cuti', path: ROUTES.CUTI },
  { icon: User, label: 'Profil', path: ROUTES.PROFILE },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t z-50 safe-area-bottom">
      <div className="grid grid-cols-4 h-full">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'font-medium')}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
