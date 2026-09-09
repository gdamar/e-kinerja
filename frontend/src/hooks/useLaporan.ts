import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface LaporanFilters {
  startDate?: string;
  endDate?: string;
  petugasId?: string;
}

interface LaporanTugas {
  id: string;
  judul_tugas: string;
  alamat: string;
  tanggal_tugas: string;
  status_tugas: string;
  latitude: number | null;
  longitude: number | null;
  petugas?: {
    nama_phl: string;
  };
}

interface LaporanStats {
  total: number;
  selesai: number;
  proses: number;
  menunggu: number;
}

export function useLaporan(filters: LaporanFilters = {}) {
  return useQuery({
    queryKey: ['laporan', filters],
    queryFn: async (): Promise<{
      tugas: LaporanTugas[];
      stats: LaporanStats;
    }> => {
      let query = supabase
        .from('tugas_header')
        .select(`
          id,
          judul_tugas,
          alamat,
          tanggal_tugas,
          status_tugas,
          petugas:master_petugas(nama_phl)
        `)
        .order('tanggal_tugas', { ascending: false });

      // Date filters
      if (filters.startDate) {
        query = query.gte('tanggal_tugas', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('tanggal_tugas', filters.endDate);
      }
      if (filters.petugasId) {
        query = query.eq('id_petugas', filters.petugasId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats
      const stats: LaporanStats = {
        total: data?.length || 0,
        selesai: data?.filter(t => t.status_tugas === 'Selesai').length || 0,
        proses: data?.filter(t => t.status_tugas === 'Proses').length || 0,
        menunggu: data?.filter(t => t.status_tugas === 'Menunggu').length || 0,
      };

      return {
        tugas: (data || []) as unknown as LaporanTugas[],
        stats,
      };
    },
  });
}

// Get all coordinates for map markers
export function useLaporanCoordinates(filters: LaporanFilters = {}) {
  return useQuery({
    queryKey: ['laporan', 'coordinates', filters],
    queryFn: async (): Promise<Array<{
      id: string;
      judul: string;
      latitude: number;
      longitude: number;
      status: string;
    }>> => {
      // First get tugas with logs to get coordinates
      let query = supabase
        .from('tugas_log')
        .select(`
          id_tugas,
          latitude,
          longitude,
          tugas:tugas_header(
            judul_tugas,
            status_tugas
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (filters.startDate) {
        const { data: tugas } = await supabase
          .from('tugas_header')
          .select('id')
          .gte('tanggal_tugas', filters.startDate);

        if (tugas && tugas.length > 0) {
          const ids = tugas.map(t => t.id);
          query = query.in('id_tugas', ids);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Deduplicate by tugas (use first log location)
      const unique = new Map<string, typeof data[0]>();
      for (const log of data || []) {
        if (!unique.has(log.id_tugas)) {
          unique.set(log.id_tugas, log);
        }
      }

      return Array.from(unique.values()).map(log => ({
        id: log.id_tugas,
        judul: (log.tugas as unknown as { judul_tugas: string }).judul_tugas,
        latitude: log.latitude,
        longitude: log.longitude,
        status: (log.tugas as unknown as { status_tugas: string }).status_tugas,
      }));
    },
  });
}
