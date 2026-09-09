import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MasterPetugas } from '@/types';

interface PetugasPayload {
  nik: string;
  nama_phl: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string;
  no_telp?: string;
  email: string;
  role_id: number;
  status_aktif: boolean;
}

export function useCreatePetugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PetugasPayload) => {
      const { data: result, error } = await supabase
        .from('master_petugas')
        .insert(data)
        .select('*, role:roles(*)')
        .single();

      if (error) throw error;
      return result as MasterPetugas;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master_petugas'] });
    },
  });
}

export function useUpdatePetugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PetugasPayload>;
    }) => {
      const { data: result, error } = await supabase
        .from('master_petugas')
        .update(data)
        .eq('id', id)
        .select('*, role:roles(*)')
        .single();

      if (error) throw error;
      return result as MasterPetugas;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master_petugas'] });
    },
  });
}

export function useDeletePetugas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - set status_aktif to false
      const { error } = await supabase
        .from('master_petugas')
        .update({ status_aktif: false })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master_petugas'] });
    },
  });
}
