import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePenilaianList } from '@/hooks/usePenilaianList';
import { useCreatePenilaianBanding, usePenilaianBandingByPenilaian } from '@/hooks/usePenilaianBanding';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/lib/constants';
import { getMonthName } from '@/lib/utils';

const schema = z.object({
  catatan_petugas: z
    .string()
    .min(10, 'Jelaskan alasan pengajuan banding minimal 10 karakter'),
});

type FormData = z.infer<typeof schema>;

export default function PenilaianAjuBandingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lampiran, setLampiran] = useState<File | null>(null);

  // Ambil detail penilaian dari list query
  const { data: penilaianList, isLoading: isLoadingPenilaian } = usePenilaianList();
  const penilaian = penilaianList?.find((p) => p.id === id);

  // Ambil riwayat banding untuk validasi status 'Menunggu'
  const { data: bandingList, isLoading: isLoadingBanding } = usePenilaianBandingByPenilaian(id || '');

  const createBanding = useCreatePenilaianBanding();

  const hasPendingBanding = bandingList?.some((b) => b.status === 'Menunggu');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Terlalu Besar',
          description: 'Ukuran file lampiran maksimal 10MB',
          variant: 'destructive',
        });
        return;
      }
      setLampiran(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    if (hasPendingBanding) {
      toast({
        title: 'Pengajuan Dibatalkan',
        description: 'Anda masih memiliki pengajuan banding yang berstatus Menunggu.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createBanding.mutateAsync({
        idPenilaian: id,
        catatanPetugas: data.catatan_petugas,
        lampiran,
      });

      toast({
        title: 'Banding Berhasil Diajukan',
        description: 'Pengajuan banding Anda telah dikirim dan menunggu peninjauan operator.',
      });
      navigate(ROUTES.PENILAIAN);
    } catch (err: unknown) {
      toast({
        title: 'Gagal Mengajukan Banding',
        description: (err as Error)?.message || 'Terjadi kesalahan sistem',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingPenilaian || isLoadingBanding) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!penilaian) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PENILAIAN)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Data penilaian tidak ditemukan.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.PENILAIAN)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <PageHeader
          title="Ajukan Banding Nilai"
          description={`Pengajuan peninjauan kembali evaluasi kinerja periode ${getMonthName(penilaian.periode_bulan)} ${penilaian.periode_tahun}`}
        />
      </div>

      {/* Ringkasan Skor Saat Ini */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Informasi Skor Saat Ini</CardTitle>
            <Badge
              variant={
                penilaian.total_nilai >= 80
                  ? 'success'
                  : penilaian.total_nilai >= 60
                  ? 'warning'
                  : 'error'
              }
              className="text-sm px-2.5 py-0.5"
            >
              Total: {penilaian.total_nilai.toFixed(1)}
            </Badge>
          </div>
          <CardDescription>
            Berikut adalah rincian skor kinerja yang telah diterbitkan oleh Operator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">Disiplin (40%)</p>
              <p className="text-lg font-bold mt-1 text-primary">
                {penilaian.skor_displin_kehadiran}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">Tanggung Jawab (35%)</p>
              <p className="text-lg font-bold mt-1 text-primary">
                {penilaian.skor_tanggung_jawab}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="text-xs text-muted-foreground font-medium">Kepatuhan (25%)</p>
              <p className="text-lg font-bold mt-1 text-primary">
                {penilaian.skor_kepatuhan}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning jika masih ada pending banding */}
      {hasPendingBanding ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Banding Sedang Diproses</p>
              <p className="mt-1 leading-relaxed opacity-90">
                Anda sudah memiliki permohonan banding yang berstatus <strong>Menunggu</strong> untuk penilaian periode ini. Anda baru dapat mengajukan banding baru setelah pengajuan sebelumnya selesai ditinjau oleh Operator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form Pengajuan */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formulir Pengajuan</CardTitle>
            <CardDescription>
              Jelaskan alasan pengajuan banding secara jelas dan lampirkan bukti pendukung jika ada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Catatan Petugas */}
              <div className="space-y-2">
                <Label htmlFor="catatan_petugas">
                  Catatan / Alasan Pengajuan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="catatan_petugas"
                  placeholder="Tuliskan alasan lengkap, misalnya klarifikasi log penugasan, presensi kehadiran, atau faktor lapangan..."
                  rows={5}
                  error={errors.catatan_petugas?.message}
                  {...register('catatan_petugas')}
                />
              </div>

              {/* Lampiran Bukti */}
              <div className="space-y-2">
                <Label>Lampiran Bukti Pendukung (Opsional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/10 transition-colors">
                  {lampiran ? (
                    <div className="flex items-center justify-between p-2 bg-muted/40 rounded border">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-xs truncate">{lampiran.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({(lampiran.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => setLampiran(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-1.5">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-xs font-medium text-foreground">
                        Klik untuk upload foto bukti atau dokumen PDF
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Mendukung format JPG, PNG, PDF (Maks. 10MB)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting || createBanding.isPending}
              >
                Kirim Pengajuan Banding
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
