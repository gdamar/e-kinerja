import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { PenilaianBanding, StatusBanding } from '@/types';

export function usePenilaianBandingList(status?: StatusBanding) {
  return useQuery({
    queryKey: ['penilaian-banding', 'list', status],
    queryFn: async (): Promise<PenilaianBanding[]> => {
      let query = supabase
        .from('penilaian_banding')
        .select(`
          *,
          penilaian:penilaian!id_penilaian(
            id,
            id_petugas,
            periode_bulan,
            periode_tahun,
            skor_displin_kehadiran,
            skor_tanggung_jawab,
            skor_kepatuhan,
            total_nilai,
            catatan,
            petugas:master_petugas!id_petugas(id, nama_phl, nik)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching banding list:', error);
        throw error;
      }
      return data || [];
    },
  });
}

export function usePenilaianBandingByPenilaian(idPenilaian: string) {
  return useQuery({
    queryKey: ['penilaian-banding', 'by-penilaian', idPenilaian],
    queryFn: async (): Promise<PenilaianBanding[]> => {
      if (!idPenilaian) return [];
      const { data, error } = await supabase
        .from('penilaian_banding')
        .select('*')
        .eq('id_penilaian', idPenilaian)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching banding history:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!idPenilaian,
  });
}

export function useCreatePenilaianBanding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      idPenilaian,
      catatanPetugas,
      lampiran,
    }: {
      idPenilaian: string;
      catatanPetugas: string;
      lampiran?: File | null;
    }) => {
      let lampiranUrl: string | null = null;

      // 1. Upload lampiran jika ada
      if (lampiran) {
        const cleanName = (lampiran.name || 'lampiran.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${idPenilaian}/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.LAMPIRAN_BANDING)
          .upload(fileName, lampiran);

        if (uploadError) {
          throw new Error(`Upload lampiran gagal: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.LAMPIRAN_BANDING)
          .getPublicUrl(fileName);

        lampiranUrl = urlData.publicUrl;
      }

      // 2. Insert row ke penilaian_banding
      const { data: result, error: insertError } = await supabase
        .from('penilaian_banding')
        .insert({
          id_penilaian: idPenilaian,
          catatan_petugas: catatanPetugas,
          lampiran_url: lampiranUrl,
          status: 'Menunggu',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Gagal mengajukan banding: ${insertError.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian-banding'] });
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    },
  });
}

export function useApprovePenilaianBanding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      idBanding,
      idPenilaian,
      skorDisiplin,
      skorTanggungJawab,
      skorKepatuhan,
      catatanOperator,
    }: {
      idBanding: string;
      idPenilaian: string;
      skorDisiplin: number;
      skorTanggungJawab: number;
      skorKepatuhan: number;
      catatanOperator: string;
    }) => {
      // 1. Update nilai di tabel penilaian
      const { error: updatePenilaianError } = await supabase
        .from('penilaian')
        .update({
          skor_displin_kehadiran: skorDisiplin,
          skor_tanggung_jawab: skorTanggungJawab,
          skor_kepatuhan: skorKepatuhan,
        })
        .eq('id', idPenilaian);

      if (updatePenilaianError) {
        throw new Error(`Gagal memperbarui nilai penilaian: ${updatePenilaianError.message}`);
      }

      // 2. Update status banding menjadi Disetujui
      const { data: result, error: updateBandingError } = await supabase
        .from('penilaian_banding')
        .update({
          status: 'Disetujui',
          catatan_operator: catatanOperator,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', idBanding)
        .select()
        .single();

      if (updateBandingError) {
        throw new Error(`Gagal memperbarui status banding: ${updateBandingError.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian-banding'] });
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    },
  });
}

export function useRejectPenilaianBanding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      idBanding,
      catatanOperator,
    }: {
      idBanding: string;
      catatanOperator: string;
    }) => {
      const { data: result, error } = await supabase
        .from('penilaian_banding')
        .update({
          status: 'Ditolak',
          catatan_operator: catatanOperator,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', idBanding)
        .select()
        .single();

      if (error) {
        throw new Error(`Gagal menolak banding: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian-banding'] });
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    },
  });
}
