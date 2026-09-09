import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Penilaian } from '@/types';

interface PenilaianFilters {
  bulan?: number | null;
  tahun?: number | null;
  idPetugas?: string | null;
  minSkor?: number | null;
  maxSkor?: number | null;
}

export function usePenilaianList(filters?: PenilaianFilters) {
  const { profile } = useAuth();

  // Use nama_role for consistency (matches database)
  const roleName = profile?.role?.nama_role?.toLowerCase();

  return useQuery({
    queryKey: ['penilaian', 'list', filters, roleName],
    queryFn: async (): Promise<Penilaian[]> => {
      let query = supabase
        .from('penilaian')
        .select(`
          *,
          petugas:master_petugas!id_petugas(id, nama_phl, nik)
        `)
        .order('periode_tahun', { ascending: false })
        .order('periode_bulan', { ascending: false });

      // Role-based filtering - petugas only sees own data
      if (roleName === 'petugas') {
        query = query.eq('id_petugas', profile!.id);
      }

      // Apply filters
      if (filters?.bulan) {
        query = query.eq('periode_bulan', filters.bulan);
      }
      if (filters?.tahun) {
        query = query.eq('periode_tahun', filters.tahun);
      }
      if (filters?.idPetugas) {
        query = query.eq('id_petugas', filters.idPetugas);
      }
      // Note: total_nilai is a generated column, filtering might not work in all cases
      if (filters?.minSkor !== null && filters?.minSkor !== undefined) {
        query = query.gte('total_nilai', filters.minSkor);
      }
      if (filters?.maxSkor !== null && filters?.maxSkor !== undefined) {
        query = query.lte('total_nilai', filters.maxSkor);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching penilaian:', error);
        throw error;
      }

      return data || [];
    },
    retry: 1,
  });
}
