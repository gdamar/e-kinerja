import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  UserCog,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, ROLE_CODES } from '@/lib/constants';

const navItems: Array<{
  icon: typeof Home;
  label: string;
  path: string;
  roles?: string[];
}> = [
  { icon: Home, label: 'Beranda', path: ROUTES.DASHBOARD },
  { icon: ClipboardList, label: 'Tugas', path: ROUTES.TUGAS },
  { icon: Calendar, label: 'Cuti', path: ROUTES.CUTI },
  { icon: FileText, label: 'Penilaian', path: ROUTES.PENILAIAN },
  { icon: Users, label: 'Petugas', path: ROUTES.PETUGAS, roles: [ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI] },
  { icon: UserCog, label: 'Akun', path: ROUTES.AKUN, roles: [ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI] },
  { icon: BarChart3, label: 'Laporan', path: ROUTES.LAPORAN, roles: [ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!profile?.role) return false;
    // Use nama_role from database (matches constants values: 'petugas', 'operator', 'kepala_sesi')
    const roleName = profile.role.nama_role?.toLowerCase();
    if (!roleName) return false;
    return item.roles.includes(roleName);
  });

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-surface border-r transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">EK</span>
          </div>
          {!isCollapsed && <span className="font-semibold text-foreground">E-Kinerja</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            const linkContent = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed && 'justify-center px-0 w-10 mx-auto'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* User & Collapse */}
        <div className="p-2 border-t space-y-2">
          {/* User */}
          <div className={cn('flex items-center gap-3 px-3 py-2', isCollapsed && 'justify-center')}>
            <Avatar size="sm">
              <AvatarFallback>{profile?.nama_phl?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.nama_phl || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.role?.nama_role || ''}</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className={cn('w-full', isCollapsed && 'px-0')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn('w-full text-status-error hover:text-status-error hover:bg-status-error/10', isCollapsed && 'px-0')}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && <span className="text-sm">Keluar</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
