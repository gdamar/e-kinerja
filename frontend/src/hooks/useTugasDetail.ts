import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TugasHeader, TugasLog, PetugasWithStatus, StatusTugas } from '@/types';

interface TugasWithLogs extends TugasHeader {
  logs: TugasLog[];
  allPetugas: PetugasWithStatus[];
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

      // Fetch all petugas from junction table including their individual status_tugas
      const { data: junctionData } = await supabase
        .from('tugas_petugas')
        .select(`
          id_petugas,
          status_tugas,
          petugas:master_petugas(*)
        `)
        .eq('id_tugas', tugasId);

      // Combine primary petugas + junction petugas with status
      const allPetugas: PetugasWithStatus[] = [];
      const addedIds = new Set<string>();

      if (junctionData && junctionData.length > 0) {
        for (const j of junctionData) {
          if (j.petugas) {
            const p = j.petugas as unknown as PetugasWithStatus;
            p.status_tugas = (j.status_tugas as StatusTugas) || 'Menunggu';
            allPetugas.push(p);
            addedIds.add(p.id);
          }
        }
      }

      // If header.petugas is not yet in junction table, add as fallback
      if (header.petugas && !addedIds.has((header.petugas as unknown as PetugasWithStatus).id)) {
        const p = header.petugas as unknown as PetugasWithStatus;
        p.status_tugas = header.status_tugas;
        allPetugas.push(p);
      }

      // Fetch logs with petugas details (newest first)
      const { data: logs, error: logsError } = await supabase
        .from('tugas_log')
        .select(`
          *,
          petugas:master_petugas(id, nama_phl, nik)
        `)
        .eq('id_tugas', tugasId)
        .order('created_at', { ascending: false });

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
