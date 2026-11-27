import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Calendar, FileText, BarChart3, User, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, ROLE_CODES } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SubNavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

interface BottomNavItem {
  icon: typeof Home;
  label: string;
  path: string;
  align?: 'start' | 'center' | 'end';
  subItems?: SubNavItem[];
}

const navItems: BottomNavItem[] = [
  { icon: Calendar, label: 'Cuti', path: ROUTES.CUTI },
  {
    icon: ClipboardList,
    label: 'Tugas',
    path: ROUTES.TUGAS,
    align: 'center',
    subItems: [
      { icon: ClipboardList, label: 'Daftar Tugas', path: ROUTES.TUGAS },
      { icon: BarChart3, label: 'Laporan', path: ROUTES.LAPORAN },
    ],
  },
  { icon: Home, label: 'Beranda', path: ROUTES.DASHBOARD },
  { icon: FileText, label: 'Penilaian', path: ROUTES.PENILAIAN },
  {
    icon: User,
    label: 'Akun',
    path: ROUTES.PROFILE,
    align: 'end',
    subItems: [
      { icon: User, label: 'Profil', path: ROUTES.PROFILE },
      { icon: UserCog, label: 'Manajemen Akun', path: ROUTES.AKUN },
    ],
  },
];

export function BottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const roleName = profile?.role?.nama_role?.toLowerCase() ?? '';
  const canAccessStaffMenu = (
    [ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI] as string[]
  ).includes(roleName);

  const handleNavigateSubItem = (path: string) => {
    setOpenMenu(null);
    navigate(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t z-50 safe-area-bottom ">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.subItems && canAccessStaffMenu) {
            const isOpen = openMenu === item.path;
            const isActive = item.subItems.some((sub) =>
              location.pathname.startsWith(sub.path)
            );

            return (
              <Popover
                key={item.path}
                open={isOpen}
                onOpenChange={(open) => setOpenMenu(open ? item.path : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 transition-colors',
                      isActive || isOpen ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        (isActive || isOpen) && 'text-primary'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        (isActive || isOpen) && 'font-medium'
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align={item.align ?? 'center'}
                  sideOffset={10}
                  className="w-44 p-1.5"
                >
                  <div className="flex flex-col gap-1">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname.startsWith(sub.path);
                      return (
                        <button
                          key={sub.path}
                          type="button"
                          onClick={() => handleNavigateSubItem(sub.path)}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left',
                            isSubActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-foreground hover:bg-primary-hover/10'
                          )}
                        >
                          <SubIcon className="h-4 w-4 shrink-0" />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

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
