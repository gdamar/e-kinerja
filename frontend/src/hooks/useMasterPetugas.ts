import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MasterPetugas } from '@/types';

interface PetugasFilters {
  role?: string | null;
  statusAktif?: boolean | null;
}

export function useMasterPetugas(filters?: PetugasFilters) {
  return useQuery({
    queryKey: ['master_petugas', 'list', filters],
    queryFn: async (): Promise<MasterPetugas[]> => {
      let query = supabase
        .from('master_petugas')
        .select('*, role:roles(*)')
        .order('nama_phl');

      // Apply filters
      if (filters?.role) {
        query = query.eq('role_id', filters.role);
      }
      if (filters?.statusAktif !== null && filters?.statusAktif !== undefined) {
        query = query.eq('status_aktif', filters.statusAktif);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

export function useMasterPetugasById(id: string) {
  return useQuery({
    queryKey: ['master_petugas', 'detail', id],
    queryFn: async (): Promise<MasterPetugas | null> => {
      const { data, error } = await supabase
        .from('master_petugas')
        .select('*, role:roles(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
