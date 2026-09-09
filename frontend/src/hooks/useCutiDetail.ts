import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Cuti } from '@/types';

export function useCutiDetail(cutiId: string) {
  return useQuery({
    queryKey: ['cuti', 'detail', cutiId],
    queryFn: async (): Promise<Cuti> => {
      const { data, error } = await supabase
        .from('cuti')
        .select(`
          *,
          petugas:master_petugas!cuti_id_petugas_fkey(*)
        `)
        .eq('id', cutiId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!cutiId,
  });
}
