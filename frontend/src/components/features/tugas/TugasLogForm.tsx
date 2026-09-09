import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LocationPicker } from './LocationPicker';
import { ImageUploader } from './ImageUploader';
import { useSubmitTugasLog } from '@/hooks/useTugasMutation';
import type { TahapanTugas } from '@/types';
import { MIN_FOTO_PER_LOG } from '@/lib/constants';

const schema = z.object({
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
});

type FormData = z.infer<typeof schema>;

interface TugasLogFormProps {
  tugasId: string;
  tahap: TahapanTugas;
  onSuccess: () => void;
}

export function TugasLogForm({ tugasId, tahap, onSuccess }: TugasLogFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const submitLog = useSubmitTugasLog();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Prevent double submit
    if (isSubmittingLocal || submitLog.isPending) return;

    if (files.length < MIN_FOTO_PER_LOG) {
      alert(`Minimal ${MIN_FOTO_PER_LOG} foto wajib diunggah`);
      return;
    }

    if (!coordinates) {
      alert('Lokasi GPS wajib diisi');
      return;
    }

    setIsSubmittingLocal(true);

    try {
      await submitLog.mutateAsync({
        tugasId,
        data: {
          tahapan: tahap,
          deskripsi: data.deskripsi,
          url_foto: files,
        },
        coordinates,
      });
      onSuccess();
    } catch (err) {
      console.error('Error submitting log:', err);
      alert('Gagal menyimpan laporan');
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const isSubmitting = isSubmittingLocal || submitLog.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tahap Info */}
      <div className="bg-primary/10 rounded-lg p-3">
        <p className="text-sm font-medium text-primary">Tahapan: {tahap}</p>
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi Progress</Label>
        <Textarea
          id="deskripsi"
          placeholder="Jelaskan progress pekerjaan Anda..."
          error={errors.deskripsi?.message}
          {...register('deskripsi')}
        />
      </div>

      {/* Location */}
      <LocationPicker
        latitude={coordinates?.latitude}
        longitude={coordinates?.longitude}
        accuracy={coordinates?.accuracy}
        onLocationChange={(lat, lng, acc) => setCoordinates({ latitude: lat, longitude: lng, accuracy: acc })}
      />

      {/* Photos */}
      <ImageUploader
        files={files}
        onChange={setFiles}
        error={files.length < MIN_FOTO_PER_LOG ? `Minimal ${MIN_FOTO_PER_LOG} foto wajib diunggah` : undefined}
      />

      {/* Submit */}
      <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
        Laporkan {tahap}
      </Button>
    </form>
  );
}
