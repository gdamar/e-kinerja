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
import { MIN_FOTO_PER_LOG, MAX_RADIUS_TUGAS_METER } from '@/lib/constants';
import { calculateDistanceMeter, isTaskForToday } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const schema = z.object({
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
});

type FormData = z.infer<typeof schema>;

interface TugasLogFormProps {
  tugasId: string;
  petugasId?: string;
  tahap: TahapanTugas;
  tanggalTugas?: string;
  targetLocation?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  onSuccess: () => void;
}

export function TugasLogForm({
  tugasId,
  petugasId,
  tahap,
  tanggalTugas,
  targetLocation,
  onSuccess,
}: TugasLogFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const { toast } = useToast();

  const submitLog = useSubmitTugasLog();

  const handleRefreshGps = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolokasi Tidak Didukung',
        description: 'Browser Anda tidak mendukung fitur geolokasi.',
        variant: 'destructive',
      });
      return;
    }
    setIsRefreshingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setIsRefreshingGps(false);
        toast({
          title: 'Lokasi Diperbarui',
          description: 'Koordinat GPS berhasil diperbarui.',
        });
      },
      (err) => {
        console.warn('Refresh GPS error:', err);
        setIsRefreshingGps(false);
        toast({
          title: 'Gagal Memperbarui GPS',
          description: 'Pastikan izin lokasi pada browser diaktifkan.',
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calculate distance between current GPS and task target location
  const distanceToTarget =
    coordinates &&
    targetLocation?.latitude !== undefined &&
    targetLocation?.latitude !== null &&
    targetLocation?.longitude !== undefined &&
    targetLocation?.longitude !== null
      ? calculateDistanceMeter(
          coordinates.latitude,
          coordinates.longitude,
          Number(targetLocation.latitude),
          Number(targetLocation.longitude)
        )
      : null;

  const isOutOfRadius = distanceToTarget !== null && distanceToTarget > MAX_RADIUS_TUGAS_METER;

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

    if (tanggalTugas && !isTaskForToday(tanggalTugas)) {
      toast({
        title: 'Laporan Tidak Tersedia',
        description: 'Pembuatan laporan hanya diperbolehkan pada tanggal pelaksanaan tugas hari ini.',
        variant: 'destructive',
      });
      return;
    }

    if (files.length < MIN_FOTO_PER_LOG) {
      toast({
        title: 'Foto Dokumentasi Kurang',
        description: `Minimal ${MIN_FOTO_PER_LOG} foto wajib diunggah untuk dokumentasi.`,
        variant: 'destructive',
      });
      return;
    }

    if (!coordinates) {
      toast({
        title: 'Lokasi GPS Belum Tersedia',
        description: 'Pastikan koordinat lokasi GPS terdeteksi sebelum menyimpan laporan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingLocal(true);

    try {
      await submitLog.mutateAsync({
        tugasId,
        petugasId,
        data: {
          tahapan: tahap,
          deskripsi: data.deskripsi,
          url_foto: files,
        },
        coordinates,
      });
      toast({
        title: 'Laporan Berhasil Disimpan',
        description: `Laporan progres tahapan ${tahap} berhasil dilaporkan.`,
      });
      onSuccess();
    } catch (err: unknown) {
      console.error('Error submitting log:', err);
      const errObj = err as Record<string, unknown> | null;
      const errorMsg =
        (err as Error)?.message ||
        (errObj?.error_description as string) ||
        (errObj?.message as string) ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));
      toast({
        title: 'Gagal Menyimpan Laporan',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const isSubmitting = isSubmittingLocal || submitLog.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-x-auto">
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lokasi Petugas (GPS)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshGps}
            disabled={isRefreshingGps || isSubmitting}
            className="h-7 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshingGps ? 'animate-spin' : ''}`} />
            <span>{isRefreshingGps ? 'Mencari GPS...' : 'Refresh GPS'}</span>
          </Button>
        </div>

        {/* Radius Validation Warning / Status */}
        {distanceToTarget !== null && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
              isOutOfRadius
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            {isOutOfRadius ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">
                {isOutOfRadius
                  ? `Peringatan: Berada di Luar Radius Penugasan (${distanceToTarget > 1000 ? (distanceToTarget / 1000).toFixed(1) + ' km' : distanceToTarget + ' m'})`
                  : `Lokasi Sesuai (${distanceToTarget} m dari titik penugasan)`}
              </p>
              <p className="leading-relaxed opacity-90">
                {isOutOfRadius
                  ? `Posisi Anda saat ini berjarak ~${distanceToTarget}m dari lokasi target (Batas wajar: ${MAX_RADIUS_TUGAS_METER}m). Jika baru tiba di lokasi, silakan klik tombol "Refresh GPS" di atas.`
                  : `Koordinat Anda terverifikasi berada di dalam radius toleransi tugas.`}
              </p>
            </div>
          </div>
        )}

        <LocationPicker
          latitude={coordinates?.latitude}
          longitude={coordinates?.longitude}
          accuracy={coordinates?.accuracy}
          onLocationChange={(lat, lng, acc) => setCoordinates({ latitude: lat, longitude: lng, accuracy: acc })}
        />
      </div>

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
