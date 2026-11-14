import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { TugasHeader, StatusTugas } from '@/types';

interface UseTugasListOptions {
  status?: StatusTugas;
  tanggal?: string;
  search?: string;
}

export function useTugasList(options: UseTugasListOptions = {}) {
  const { profile } = useAuth();
  const roleName = profile?.role?.nama_role?.toLowerCase();

  return useQuery({
    queryKey: ['tugas', 'list', options, roleName],
    queryFn: async () => {
      // For petugas role, check junction table for assignments
      if (roleName === 'petugas' && profile) {
        // First, get task IDs from junction table
        const { data: junctionData } = await supabase
          .from('tugas_petugas')
          .select('id_tugas')
          .eq('id_petugas', profile.id);

        const junctionTaskIds = junctionData?.map(j => j.id_tugas) || [];

        // Query tugas_header with both direct assignment and junction table
        let query = supabase
          .from('tugas_header')
          .select(`
            *,
            petugas:master_petugas(*)
          `)
          .order('tanggal_tugas', { ascending: false })
          .order('created_at', { ascending: false });

        query = junctionTaskIds.length
          ? query.or(`id_petugas.eq.${profile.id},id.in.(${junctionTaskIds.join(',')})`)
          : query.eq('id_petugas', profile.id);

        if (options.status) {
          query = query.eq('status_tugas', options.status);
        }

        if (options.tanggal) {
          query = query.eq('tanggal_tugas', options.tanggal);
        }

        if (options.search) {
          query = query.ilike('judul_tugas', `%${options.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as TugasHeader[];
      }

      // For operator/kepala_sesi, show all tasks
      let query = supabase
        .from('tugas_header')
        .select(`
          *,
          petugas:master_petugas(*)
        `)
        .order('tanggal_tugas', { ascending: false })
        .order('created_at', { ascending: false });

      // Filter by status
      if (options.status) {
        query = query.eq('status_tugas', options.status);
      }

      // Filter by date
      if (options.tanggal) {
        query = query.eq('tanggal_tugas', options.tanggal);
      }

      // Search by title
      if (options.search) {
        query = query.ilike('judul_tugas', `%${options.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TugasHeader[];
    },
  });
}
