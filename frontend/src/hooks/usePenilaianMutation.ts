import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PenilaianFormData } from '@/types';

export function useCreatePenilaian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      operatorId,
    }: {
      data: PenilaianFormData;
      operatorId: string;
    }) => {
      // Note: total_nilai is a GENERATED column in DB
      // Don't include it - let DB calculate automatically
      const { data: result, error } = await supabase
        .from('penilaian')
        .insert({
          id_petugas: data.id_petugas,
          id_operator: operatorId,
          periode_bulan: data.periode_bulan,
          periode_tahun: data.periode_tahun,
          skor_displin_kehadiran: data.skor_displin_kehadiran,
          skor_tanggung_jawab: data.skor_tanggung_jawab,
          skor_kepatuhan: data.skor_kepatuhan,
          catatan: data.catatan || '',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating penilaian:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    },
  });
}

export function useUpdatePenilaian() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PenilaianFormData>;
    }) => {
      // Note: total_nilai is a GENERATED column in DB
      // Don't update it - DB will recalculate automatically
      const { data: result, error } = await supabase
        .from('penilaian')
        .update({
          skor_displin_kehadiran: data.skor_displin_kehadiran,
          skor_tanggung_jawab: data.skor_tanggung_jawab,
          skor_kepatuhan: data.skor_kepatuhan,
          catatan: data.catatan,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating penilaian:', error);
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penilaian'] });
    },
  });
}
