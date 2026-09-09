import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Calendar, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCuti } from '@/hooks/useCutiMutation';
import { useKuotaCuti } from '@/hooks/useKuotaCuti';
import { useAuth } from '@/context/AuthContext';
import { KuotaIndicator } from '@/components/features/cuti';
import { ROUTES, JENIS_CUTI } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { calculateDays } from '@/lib/utils';
import type { JenisCuti } from '@/types';

const schema = z.object({
  jenis_cuti: z.string().min(1, 'Pilih jenis cuti'),
  tgl_mulai: z.string().min(1, 'Tanggal mulai wajib diisi'),
  tgl_selesai: z.string().min(1, 'Tanggal selesai wajib diisi'),
  alasan: z.string().min(1, 'Alasan wajib diisi'),
}).refine(
  (data) => {
    if (data.jenis_cuti === JENIS_CUTI.TAHUNAN && data.tgl_mulai && data.tgl_selesai) {
      return new Date(data.tgl_selesai) >= new Date(data.tgl_mulai);
    }
    return true;
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['tgl_selesai'],
  }
);

type FormData = z.infer<typeof schema>;

export default function CutiAjuanPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createCuti = useCreateCuti();
  const { data: kuota, isLoading: isLoadingKuota } = useKuotaCuti();
  const { toast } = useToast();

  const [lampiran, setLampiran] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const jenisCuti = watch('jenis_cuti') as JenisCuti;
  const tglMulai = watch('tgl_mulai');
  const tglSelesai = watch('tgl_selesai');

  // Calculate duration
  const duration = tglMulai && tglSelesai ? calculateDays(tglMulai, tglSelesai) : 0;

  // Check if exceeds quota for cuti tahunan
  const exceedsQuota = jenisCuti === JENIS_CUTI.TAHUNAN && kuota && duration > kuota.remaining;

  const onSubmit = async (data: FormData) => {
    if (!profile?.id) {
      toast({
        title: 'Gagal',
        description: 'Tidak dapat mengambil informasi user',
        variant: 'destructive',
      });
      return;
    }

    if (jenisCuti === JENIS_CUTI.TAHUNAN && exceedsQuota) {
      toast({
        title: 'Gagal',
        description: `Sisa kuota cuti hanya ${kuota?.remaining} hari`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCuti.mutateAsync({
        data: {
          jenis_cuti: data.jenis_cuti as JenisCuti,
          tgl_mulai: data.tgl_mulai,
          tgl_selesai: data.tgl_selesai,
          alasan: data.alasan,
          lampiran: lampiran || undefined,
        },
        userId: profile.id,
      });

      toast({
        title: 'Berhasil',
        description: 'Pengajuan cuti berhasil diajukan',
      });
      navigate(ROUTES.CUTI);
    } catch (err) {
      console.error('Error creating cuti:', err);
      toast({
        title: 'Gagal',
        description: 'Gagal mengajukan cuti. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.CUTI)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <h1 className="text-xl font-semibold">Ajukan Cuti</h1>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Kuota Info */}
            {!isLoadingKuota && kuota && (
              <KuotaIndicator
                used={kuota.used}
                remaining={kuota.remaining}
                total={kuota.total}
              />
            )}

            {/* Jenis Cuti */}
            <div className="space-y-2">
              <Label htmlFor="jenis_cuti">Jenis Cuti</Label>
              <Select
                onValueChange={(value) => setValue('jenis_cuti', value)}
              >
                <SelectTrigger className={errors.jenis_cuti ? 'border-status-error' : ''}>
                  <SelectValue placeholder="Pilih jenis cuti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JENIS_CUTI.TAHUNAN}>Cuti Tahunan</SelectItem>
                  <SelectItem value={JENIS_CUTI.SAKIT}>Cuti Sakit</SelectItem>
                  <SelectItem value={JENIS_CUTI.ALASAN_PENTING}>Alasan Penting</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenis_cuti && (
                <p className="text-sm text-status-error">{errors.jenis_cuti.message}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tgl_mulai">Tanggal Mulai</Label>
                <Input
                  id="tgl_mulai"
                  type="date"
                  {...register('tgl_mulai')}
                />
                {errors.tgl_mulai && (
                  <p className="text-sm text-status-error">{errors.tgl_mulai.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tgl_selesai">Tanggal Selesai</Label>
                <Input
                  id="tgl_selesai"
                  type="date"
                  {...register('tgl_selesai')}
                />
                {errors.tgl_selesai && (
                  <p className="text-sm text-status-error">{errors.tgl_selesai.message}</p>
                )}
              </div>
            </div>

            {/* Duration Info */}
            {duration > 0 && (
              <div className="bg-muted rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="font-medium">{duration} hari</span>
                </div>
                {jenisCuti === JENIS_CUTI.TAHUNAN && kuota && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sisa Kuota:</span>
                    <span className={exceedsQuota ? 'text-status-error font-medium' : 'font-medium'}>
                      {kuota.remaining - duration} hari
                    </span>
                  </div>
                )}
                {exceedsQuota && (
                  <p className="text-sm text-status-error font-medium">
                    Melebihi sisa kuota cuti tahunan
                  </p>
                )}
              </div>
            )}

            {/* Alasan */}
            <div className="space-y-2">
              <Label htmlFor="alasan">Alasan</Label>
              <Textarea
                id="alasan"
                placeholder="Jelaskan alasan cuti Anda..."
                {...register('alasan')}
              />
              {errors.alasan && (
                <p className="text-sm text-status-error">{errors.alasan.message}</p>
              )}
            </div>

            {/* Lampiran */}
            <div className="space-y-2">
              <Label>Lampiran (opsional)</Label>
              <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="lampiran"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setLampiran(e.target.files?.[0] || null)}
                />
                <label htmlFor="lampiran" className="cursor-pointer">
                  {lampiran ? (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lampiran.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Klik untuk upload dokumen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG (maks. 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting || createCuti.isPending}
              disabled={exceedsQuota}
            >
              Ajukan Cuti
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
