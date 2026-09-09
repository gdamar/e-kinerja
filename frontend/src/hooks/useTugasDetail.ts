import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TugasHeader, TugasLog, MasterPetugas } from '@/types';

interface TugasWithLogs extends TugasHeader {
  logs: TugasLog[];
  allPetugas: MasterPetugas[];
}

export function useTugasDetail(tugasId: string) {
  return useQuery({
    queryKey: ['tugas', 'detail', tugasId],
    queryFn: async (): Promise<TugasWithLogs> => {
      // Fetch header with primary petugas
      const { data: header, error: headerError } = await supabase
        .from('tugas_header')
        .select(`
          *,
          petugas:master_petugas(*)
        `)
        .eq('id', tugasId)
        .single();

      if (headerError) throw headerError;

      // Fetch all petugas from junction table
      const { data: junctionData } = await supabase
        .from('tugas_petugas')
        .select(`
          id_petugas,
          petugas:master_petugas(*)
        `)
        .eq('id_tugas', tugasId);

      // Combine primary petugas + junction petugas
      const allPetugas: MasterPetugas[] = [];
      if (header.petugas) {
        allPetugas.push(header.petugas as unknown as MasterPetugas);
      }
      if (junctionData) {
        for (const j of junctionData) {
          if (j.petugas && !allPetugas.some(p => p.id === (j.petugas as unknown as MasterPetugas).id)) {
            allPetugas.push(j.petugas as unknown as MasterPetugas);
          }
        }
      }

      // Fetch logs
      const { data: logs, error: logsError } = await supabase
        .from('tugas_log')
        .select('*')
        .eq('id_tugas', tugasId)
        .order('created_at', { ascending: true });

      if (logsError) throw logsError;

      // Parse url_foto from JSONB
      const parsedLogs = (logs || []).map((log) => ({
        ...log,
        url_foto: Array.isArray(log.url_foto)
          ? log.url_foto
          : typeof log.url_foto === 'string'
          ? JSON.parse(log.url_foto)
          : [],
      }));

      return { ...header, logs: parsedLogs, allPetugas };
    },
    enabled: !!tugasId,
  });
}
