import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { KUOTA_CUTI_TAHUNAN } from '@/lib/constants';

interface KuotaInfo {
  used: number;
  remaining: number;
  total: number;
}

export function useKuotaCuti() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['cuti', 'kuota', profile?.id],
    queryFn: async (): Promise<KuotaInfo> => {
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('cuti')
        .select('tgl_mulai, tgl_selesai')
        .eq('id_petugas', profile?.id)
        .eq('status_approval', 'Disetujui')
        .eq('jenis_cuti', 'Tahunan')
        .gte('tgl_mulai', `${currentYear}-01-01`)
        .lte('tgl_mulai', `${currentYear}-12-31`);

      if (error) throw error;

      // Calculate total days used
      let totalDays = 0;
      for (const cuti of data || []) {
        const start = new Date(cuti.tgl_mulai);
        const end = new Date(cuti.tgl_selesai);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += days;
      }

      return {
        used: totalDays,
        remaining: KUOTA_CUTI_TAHUNAN - totalDays,
        total: KUOTA_CUTI_TAHUNAN,
      };
    },
    enabled: !!profile?.id,
  });
}
