import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Toaster } from '@/hooks/useToast';

export function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // User is logged in but profile not found - show error
  if (user && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="h-12 w-12 mx-auto text-status-warning mb-4" />
            <h2 className="text-lg font-semibold mb-2">Profil Tidak Ditemukan</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Akun Anda tidak ditemukan di sistem.<br />
              Hubungi administrator untuk bantuan.
            </p>
            <Button onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - don't render anything (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-background">
      {/* Desktop: Sidebar + Main */}
      <div className="hidden md:flex h-full w-full">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-6 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile: Main + BottomNav */}
      <div className="md:hidden flex flex-col h-full w-full">
        <main className="flex-1 h-[calc(100dvh-4rem)] overflow-y-auto p-4 space-y-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>

      {/* Global Toast Notifications */}
      <Toaster />
    </div>
  );
}
