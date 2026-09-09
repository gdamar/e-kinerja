import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  tugasAktif: number;
  selesaiHariIni: number;
  totalTugas: number;
  menunggu: number;
}

export function useDashboardStats() {
  const { profile } = useAuth();
  const roleName = profile?.role?.nama_role?.toLowerCase();

  return useQuery({
    queryKey: ['dashboard', 'stats', profile?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split('T')[0];
      const userId = profile?.id;

      // Build base query
      let query = supabase.from('tugas_header').select('status_tugas, tanggal_tugas');

      // Filter by user for petugas role
      if (roleName === 'petugas' && userId) {
        query = query.eq('id_petugas', userId);
      }

      const { data: allTugas, error } = await query;

      if (error) throw error;

      const todaysTugas = allTugas?.filter(t => t.tanggal_tugas === today) || [];

      return {
        tugasAktif: todaysTugas.filter(t => t.status_tugas === 'Proses').length,
        selesaiHariIni: todaysTugas.filter(t => t.status_tugas === 'Selesai').length,
        totalTugas: todaysTugas.length,
        menunggu: todaysTugas.filter(t => t.status_tugas === 'Menunggu').length,
      };
    },
  });
}
