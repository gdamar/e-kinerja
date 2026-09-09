import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  createUser,
  updateUser,
  resetPassword,
} from '@/lib/supabase-admin';
import type { AkunUser } from '@/lib/supabase-admin';

export type { AkunUser };

interface AkunFilters {
  role?: string | null;
  status?: 'active' | 'banned' | null;
}

export function useAkunList(filters?: AkunFilters) {
  return useQuery({
    queryKey: ['akun', 'list', filters],
    queryFn: async (): Promise<AkunUser[]> => {
      const users = await listUsers();

      let filtered = users || [];

      // Apply filters
      if (filters?.role) {
        filtered = filtered.filter(
          (u) => u.profile?.role?.nama_role?.toLowerCase() === filters.role?.toLowerCase()
        );
      }
      if (filters?.status === 'active') {
        filtered = filtered.filter((u) => !u.banned);
      } else if (filters?.status === 'banned') {
        filtered = filtered.filter((u) => u.banned);
      }

      return filtered;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['akun'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['akun'] });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['akun'] });
    },
  });
}
