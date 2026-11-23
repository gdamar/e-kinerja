import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface border-b h-16 px-4">
      <div className="flex items-center justify-between h-full">
        {/* Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              {/* Mobile Sidebar Content */}
              <div className="flex flex-col gap-4 mt-8">
                <div className="px-2 space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
                    <span className="text-primary-foreground font-bold text-lg">EK</span>
                  </div>
                  <p className="font-semibold text-lg">E-Kinerja</p>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{profile?.nama_phl?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profile?.nama_phl}</p>
                      <p className="text-xs text-muted-foreground">{profile?.role?.nama_role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold md:hidden">{title}</h1>
        </div>

        {/* Desktop - Date */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
