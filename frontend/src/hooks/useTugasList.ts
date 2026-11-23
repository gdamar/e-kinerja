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
  const isPetugas = profile?.role_id === 1 || roleName === 'petugas';

  return useQuery({
    queryKey: ['tugas', 'list', options, profile?.id, isPetugas],
    enabled: !!profile,
    queryFn: async () => {
      // For petugas role, check junction table for assignments
      if (isPetugas && profile) {
        const { data: junctionData, error: junctionError } = await supabase
          .from('tugas_petugas')
          .select('id_tugas, status_tugas')
          .eq('id_petugas', profile.id);

        if (junctionError) throw junctionError;

        const junctionMap = new Map<string, StatusTugas>();
        junctionData?.forEach((j) => {
          junctionMap.set(j.id_tugas, (j.status_tugas as StatusTugas) || 'Menunggu');
        });

        const junctionTaskIds = junctionData?.map(j => j.id_tugas) || [];
        const select = `
          *,
          petugas:master_petugas(*)
        `;

        let primaryQuery = supabase
          .from('tugas_header')
          .select(select)
          .eq('id_petugas', profile.id);
        let assignedQuery = junctionTaskIds.length
          ? supabase.from('tugas_header').select(select).in('id', junctionTaskIds)
          : null;

        if (options.tanggal) {
          primaryQuery = primaryQuery.eq('tanggal_tugas', options.tanggal);
          if (assignedQuery) assignedQuery = assignedQuery.eq('tanggal_tugas', options.tanggal);
        }
        if (options.search) {
          primaryQuery = primaryQuery.ilike('judul_tugas', `%${options.search}%`);
          if (assignedQuery) assignedQuery = assignedQuery.ilike('judul_tugas', `%${options.search}%`);
        }

        const [primaryResult, assignedResult] = await Promise.all([
          primaryQuery,
          assignedQuery || Promise.resolve({ data: [], error: null }),
        ]);

        if (primaryResult.error) throw primaryResult.error;
        if (assignedResult.error) throw assignedResult.error;

        const tugasById = new Map<string, TugasHeader>();
        for (const tugas of [...(primaryResult.data || []), ...(assignedResult.data || [])]) {
          const item = { ...tugas } as TugasHeader;
          // Set individual_status for this logged in petugas
          const individualStatus = junctionMap.get(item.id) || item.status_tugas;
          item.individual_status = individualStatus;
          item.status_tugas = individualStatus; // prioritize individual status for petugas view

          // Apply status filter based on individual status
          if (options.status && item.status_tugas !== options.status) {
            continue;
          }

          tugasById.set(item.id, item);
        }

        return [...tugasById.values()].sort((a, b) => {
          const dateOrder = b.tanggal_tugas.localeCompare(a.tanggal_tugas);
          return dateOrder || b.created_at.localeCompare(a.created_at);
        });
      }

      // Only staff roles may see all tasks.
      if (!profile || !isPetugas && ![2, 3].includes(profile.role_id)) {
        return [];
      }

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
