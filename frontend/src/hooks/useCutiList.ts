import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Cuti } from '@/types';

export function useCutiList(status?: string) {
  const { profile } = useAuth();
  const roleName = profile?.role?.nama_role?.toLowerCase();

  return useQuery({
    queryKey: ['cuti', 'list', status, roleName],
    queryFn: async (): Promise<Cuti[]> => {
      let query = supabase
        .from('cuti')
        .select(`
          *,
          petugas:master_petugas!cuti_id_petugas_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Petugas only sees own requests
      if (roleName === 'petugas' && profile) {
        query = query.eq('id_petugas', profile.id);
      }

      // Filter by status
      if (status) {
        query = query.eq('status_approval', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}
