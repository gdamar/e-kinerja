import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TugasFormData, TugasLogFormData } from '@/types';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { isTaskForToday } from '@/lib/utils';

interface CreateTugasData extends Omit<TugasFormData, 'id_petugas'> {
  id_petugas: string[];
}

interface UpdateTugasData extends Omit<TugasFormData, 'id_petugas'> {
  id_petugas: string[];
}

export function useCreateTugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTugasData) => {
      // 1. Insert tugas_header (use first petugas as primary, rest go to junction)
      const { data: result, error } = await supabase
        .from('tugas_header')
        .insert({
          id_petugas: data.id_petugas[0], // Primary petugas
          judul_tugas: data.judul_tugas,
          alamat: data.alamat,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          tanggal_tugas: data.tanggal_tugas,
          status_tugas: 'Menunggu',
        })
        .select()
        .single();

      if (error) throw new Error(`Simpan tugas_header gagal: ${error.message}`);

      // 2. Store ALL petugas in the junction table (including the primary petugas).
      // This ensures all assigned members have an individual progress record in tugas_petugas.
      const junctionRecords = data.id_petugas.map((petugasId) => ({
        id_tugas: result.id,
        id_petugas: petugasId,
        status_tugas: 'Menunggu' as const,
      }));

      const { error: junctionError } = await supabase
        .from('tugas_petugas')
        .upsert(junctionRecords, { onConflict: 'id_tugas,id_petugas' });

      if (junctionError) throw new Error(`Simpan tugas_petugas gagal: ${junctionError.message}`);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
    },
  });
}

export function useUpdateTugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tugasId, data }: { tugasId: string; data: UpdateTugasData }) => {
      // 1. Update tugas_header
      const { error: updateError } = await supabase
        .from('tugas_header')
        .update({
          id_petugas: data.id_petugas[0], // Primary petugas
          judul_tugas: data.judul_tugas,
          alamat: data.alamat,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          tanggal_tugas: data.tanggal_tugas,
        })
        .eq('id', tugasId);

      if (updateError) throw updateError;

      // 2. Delete existing junction records
      const { error: deleteError } = await supabase
        .from('tugas_petugas')
        .delete()
        .eq('id_tugas', tugasId);

      if (deleteError) throw deleteError;

      // 3. Insert ALL assigned petugas into the junction table
      const junctionRecords = data.id_petugas.map((petugasId) => ({
        id_tugas: tugasId,
        id_petugas: petugasId,
        status_tugas: 'Menunggu' as const,
      }));

      const { error: junctionError } = await supabase
        .from('tugas_petugas')
        .insert(junctionRecords);

      if (junctionError) throw new Error(`Simpan tugas_petugas gagal: ${junctionError.message}`);

      return { id: tugasId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
    },
  });
}

export function useDeleteTugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tugasId: string) => {
      // Delete junction records first (cascade should handle this, but be explicit)
      await supabase
        .from('tugas_petugas')
        .delete()
        .eq('id_tugas', tugasId);

      // Delete tugas_header (cascade should delete logs)
      const { error } = await supabase
        .from('tugas_header')
        .delete()
        .eq('id', tugasId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
    },
  });
}

export function useSubmitTugasLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tugasId,
      petugasId,
      data,
      coordinates,
    }: {
      tugasId: string;
      petugasId?: string;
      data: TugasLogFormData;
      coordinates: { latitude: number; longitude: number };
    }) => {
      // 0. Verify that the task is scheduled for today
      const { data: headerData, error: headerError } = await supabase
        .from('tugas_header')
        .select('tanggal_tugas')
        .eq('id', tugasId)
        .single();

      if (headerError) {
        throw new Error(`Gagal memverifikasi tugas: ${headerError.message}`);
      }

      if (!isTaskForToday(headerData?.tanggal_tugas)) {
        throw new Error('Pembuatan laporan hanya diperbolehkan pada tanggal pelaksanaan tugas hari ini.');
      }

      // 1. Upload photos to Supabase Storage
      const uploadedUrls: string[] = [];

      for (const file of data.url_foto) {
        const cleanName = (file.name || 'foto.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${tugasId}/${Date.now()}-${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.FOTO_TUGAS)
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Upload foto gagal (${file.name}): ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.FOTO_TUGAS)
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // 2. Insert log with id_petugas
      const logPayload: Record<string, unknown> = {
        id_tugas: tugasId,
        tahapan: data.tahapan,
        deskripsi: data.deskripsi,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        url_foto: uploadedUrls,
      };

      if (petugasId) {
        logPayload.id_petugas = petugasId;
      }

      const { data: log, error: logError } = await supabase
        .from('tugas_log')
        .insert(logPayload)
        .select()
        .single();

      if (logError) {
        throw new Error(`Simpan tugas_log gagal: ${logError.message}`);
      }

      // 3. Update individual status on tugas_petugas
      const newStatus = data.tahapan === 'Finished' ? 'Selesai' : 'Proses';
      if (petugasId) {
        await supabase
          .from('tugas_petugas')
          .update({ status_tugas: newStatus })
          .eq('id_tugas', tugasId)
          .eq('id_petugas', petugasId);
      }

      return log;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tugas', 'detail', variables.tugasId] });
      queryClient.invalidateQueries({ queryKey: ['tugas'] });
    },
  });
}
