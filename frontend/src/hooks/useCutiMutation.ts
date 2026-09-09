import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import type { CutiFormData } from '@/types';

export function useCreateCuti() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      userId,
    }: {
      data: CutiFormData;
      userId: string;
    }) => {
      // Upload attachment if exists
      let lampiranUrl: string | null = null;

      if (data.lampiran) {
        const fileName = `cuti/${userId}/${Date.now()}-${data.lampiran.name}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.LAMPIRAN_CUTI)
          .upload(fileName, data.lampiran);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.LAMPIRAN_CUTI)
          .getPublicUrl(fileName);
        lampiranUrl = urlData.publicUrl;
      }

      // Insert cuti record
      const { data: result, error } = await supabase
        .from('cuti')
        .insert({
          id_petugas: userId,
          jenis_cuti: data.jenis_cuti,
          tgl_mulai: data.tgl_mulai,
          tgl_selesai: data.tgl_selesai,
          alasan: data.alasan,
          lampiran_url: lampiranUrl,
          status_approval: 'Menunggu',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuti'] });
      queryClient.invalidateQueries({ queryKey: ['cuti', 'kuota'] });
    },
  });
}

export function useApproveCuti() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cutiId,
      operatorId,
      status,
    }: {
      cutiId: string;
      operatorId: string;
      status: 'Disetujui' | 'Tidak Disetujui';
    }) => {
      const { error } = await supabase
        .from('cuti')
        .update({
          status_approval: status,
          approved_by: operatorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cutiId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuti'] });
      queryClient.invalidateQueries({ queryKey: ['cuti', 'kuota'] });
    },
  });
}
