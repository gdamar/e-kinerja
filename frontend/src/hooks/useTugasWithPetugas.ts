import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TugasHeader } from '@/types';

export function useTugasWithPetugas(tugasId: string) {
  return useQuery({
    queryKey: ['tugas', 'with-petugas', tugasId],
    queryFn: async (): Promise<TugasHeader & { junctionPetugas: string[] }> => {
      // Fetch header
      const { data: header, error: headerError } = await supabase
        .from('tugas_header')
        .select('*')
        .eq('id', tugasId)
        .single();

      if (headerError) throw headerError;

      // Fetch junction table petugas
      const { data: junctionData } = await supabase
        .from('tugas_petugas')
        .select('id_petugas')
        .eq('id_tugas', tugasId);

      const junctionPetugasIds = junctionData?.map(j => j.id_petugas) || [];

      // Combine: primary petugas + junction petugas
      const allPetugasIds = [header.id_petugas, ...junctionPetugasIds];

      return { ...header, junctionPetugas: allPetugasIds };
    },
    enabled: !!tugasId,
  });
}
