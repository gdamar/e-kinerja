import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MasterPetugas } from '@/types';

export function usePetugasList() {
  return useQuery({
    queryKey: ['petugas', 'list'],
    queryFn: async (): Promise<MasterPetugas[]> => {
      // First get the role_id for 'petugas'
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nama_role', 'petugas')
        .single();

      if (roleError || !roleData) {
        throw roleError || new Error('Role petugas not found');
      }

      // Then get all users with that role_id
      const { data, error } = await supabase
        .from('master_petugas')
        .select('*, role:roles(*)')
        .eq('role_id', roleData.id)
        .eq('status_aktif', true)
        .order('nama_phl');

      if (error) throw error;
      return data || [];
    },
  });
}
