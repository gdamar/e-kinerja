import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RoleGateProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { profile } = useAuth();

  if (!profile) return <>{fallback}</>;
  if (!profile.role) return <>{fallback}</>;

  // Use nama_role from database (matches constants values: 'petugas', 'operator', 'kepala_sesi')
  const roleName = profile.role.nama_role?.toLowerCase();

  if (!roleName) return <>{fallback}</>;
  if (!roles.includes(roleName)) return <>{fallback}</>;

  return <>{children}</>;
}
