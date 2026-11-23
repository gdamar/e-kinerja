import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { SkorInput } from '@/components/features/penilaian';
import { ROUTES, BULAN_OPTIONS } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { usePenilaianList } from '@/hooks/usePenilaianList';
import { usePetugasList } from '@/hooks/usePetugasList';
import { useCreatePenilaian, useUpdatePenilaian } from '@/hooks/usePenilaianMutation';
import { RoleGate } from '@/components/shared/RoleGate';
import { ROLE_CODES } from '@/lib/constants';

const schema = z.object({
  id_petugas: z.string().min(1, 'Pilih petugas'),
  periode_bulan: z.string().min(1, 'Pilih bulan'),
  periode_tahun: z.string().min(1, 'Pilih tahun'),
  skor_displin_kehadiran: z.number().min(0).max(100),
  skor_tanggung_jawab: z.number().min(0).max(100),
  skor_kepatuhan: z.number().min(0).max(100),
  catatan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PenilaianFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { profile } = useAuth();
  const { toast } = useToast();
  const { data: petugasList, isLoading: isLoadingPetugas } = usePetugasList();
  const { data: allPenilaian } = usePenilaianList();
  const createPenilaian = useCreatePenilaian();
  const updatePenilaian = useUpdatePenilaian();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      skor_displin_kehadiran: 0,
      skor_tanggung_jawab: 0,
      skor_kepatuhan: 0,
    },
  });

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && id && allPenilaian) {
      const existing = allPenilaian.find((p) => p.id === id);
      if (existing) {
        reset({
          id_petugas: existing.id_petugas,
          periode_bulan: existing.periode_bulan.toString(),
          periode_tahun: existing.periode_tahun.toString(),
          skor_displin_kehadiran: existing.skor_displin_kehadiran,
          skor_tanggung_jawab:
            existing.skor_tanggung_jawab,
          skor_kepatuhan:
            existing.skor_kepatuhan,
          catatan: existing.catatan || '',
        });
      }
    }
  }, [isEditMode, id, allPenilaian, reset]);

  const selectedPetugas = watch('id_petugas');
  const selectedBulan = watch('periode_bulan');
  const selectedTahun = watch('periode_tahun');

  // Check for duplicate
  useEffect(() => {
    if (selectedPetugas && selectedBulan && selectedTahun && !isEditMode) {
      const duplicate = allPenilaian?.find(
        (p) =>
          p.id_petugas === selectedPetugas &&
          p.periode_bulan === parseInt(selectedBulan, 10) &&
          p.periode_tahun === parseInt(selectedTahun, 10)
      );

      if (duplicate) {
        const petugas = petugasList?.find((p) => p.id === selectedPetugas);
        setDuplicateWarning(
          `Penilaian untuk ${petugas?.nama_phl} pada periode ${getMonthName(
            parseInt(selectedBulan, 10)
          )} ${selectedTahun} sudah ada. Gunakan mode edit untuk mengubah.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [selectedPetugas, selectedBulan, selectedTahun, allPenilaian, isEditMode, petugasList]);

  const skor1 = watch('skor_displin_kehadiran') || 0;
  const skor2 = watch('skor_tanggung_jawab') || 0;
  const skor3 = watch('skor_kepatuhan') || 0;
  const total = (skor1 + skor2 + skor3) / 3;

  const onSubmit = async (data: FormData) => {
    if (!profile?.id) {
      toast({
        title: 'Gagal',
        description: 'Tidak dapat mengambil informasi user',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_petugas: data.id_petugas,
        periode_bulan: parseInt(data.periode_bulan, 10),
        periode_tahun: parseInt(data.periode_tahun, 10),
        skor_displin_kehadiran: data.skor_displin_kehadiran,
        skor_tanggung_jawab:
          data.skor_tanggung_jawab,
        skor_kepatuhan:
          data.skor_kepatuhan,
        catatan: data.catatan || '',
      };

      if (isEditMode && id) {
        // Update existing
        await updatePenilaian.mutateAsync({ id, data: payload });
        toast({
          title: 'Berhasil',
          description: 'Penilaian berhasil diubah',
        });
      } else {
        // Create new
        await createPenilaian.mutateAsync({
          data: payload as any,
          operatorId: profile.id,
        });
        toast({
          title: 'Berhasil',
          description: 'Penilaian berhasil dibuat',
        });
      }

      navigate(ROUTES.PENILAIAN);
    } catch (err: any) {
      console.error('Error saving penilaian:', err);
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal menyimpan penilaian',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.PENILAIAN)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <h1 className="text-xl font-semibold">
        {isEditMode ? 'Edit Penilaian' : 'Tambah Penilaian Baru'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Petugas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Penilaian</CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Mengubah data penilaian yang sudah ada'
                : 'Pilih petugas dan periode penilaian'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Petugas</Label>
              <Select
                value={selectedPetugas || ''}
                onValueChange={(value) => setValue('id_petugas', value)}
                disabled={isEditMode}
              >
                <SelectTrigger
                  className={errors.id_petugas ? 'border-status-error' : ''}
                >
                  <SelectValue placeholder="Pilih petugas" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPetugas ? (
                    <SelectItem value="loading" disabled>
                      Memuat...
                    </SelectItem>
                  ) : (
                    petugasList?.map((petugas) => (
                      <SelectItem key={petugas.id} value={petugas.id}>
                        {petugas.nama_phl}
                        {petugas.nik && ` - NIK: ${petugas.nik}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.id_petugas && (
                <p className="text-sm text-status-error">
                  {errors.id_petugas.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select
                  value={selectedBulan || ''}
                  onValueChange={(value) => setValue('periode_bulan', value)}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {BULAN_OPTIONS.map((bulan) => (
                      <SelectItem
                        key={bulan.value}
                        value={bulan.value}
                      >
                        {bulan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select
                  value={selectedTahun || ''}
                  onValueChange={(value) => setValue('periode_tahun', value)}
                  disabled={isEditMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((tahun) => (
                      <SelectItem key={tahun} value={tahun.toString()}>
                        {tahun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="flex items-start gap-2 p-3 bg-status-warning/10 border border-status-warning/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-status-warning shrink-0" />
                <p className="text-sm text-status-warning">{duplicateWarning}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nilai Kinerja</CardTitle>
            <CardDescription>
              Masukkan skor 0-100 untuk setiap kriteria. Total nilai adalah
              rata-rata dari 3 skor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SkorInput
              label="Disiplin & Kehadiran"
              value={skor1}
              onChange={(v) => setValue('skor_displin_kehadiran', v)}
              min={0}
              max={100}
            />

            <SkorInput
              label="Tanggung Jawab & Penyelesaian Pekerjaan"
              value={skor2}
              onChange={(v) =>
                setValue('skor_tanggung_jawab', v)
              }
              min={0}
              max={100}
            />

            <SkorInput
              label="Kepatuhan terhadap Kewajiban dan Larangan"
              value={skor3}
              onChange={(v) =>
                setValue('skor_kepatuhan', v)
              }
              min={0}
              max={100}
            />

            {/* Total */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Total Nilai</Label>
                <span
                  className={`text-2xl font-bold ${
                    total >= 80
                      ? 'text-status-success'
                      : total >= 60
                        ? 'text-status-warning'
                        : 'text-status-error'
                  }`}
                >
                  {total.toFixed(1)}
                </span>
              </div>
              <Progress value={total} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">
                ({(skor1 + skor2 + skor3).toFixed(0)} / 3)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Catatan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catatan (Opsional)</CardTitle>
            <CardDescription>
              Tambahkan catatan atau evaluasi kualitatif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Contoh: Petugas menunjukkan kinerja yang baik dalam..."
              rows={4}
              {...register('catatan')}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <RoleGate roles={[ROLE_CODES.OPERATOR]}>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.PENILAIAN)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={isSubmitting || !!duplicateWarning}
              isLoading={isSubmitting || createPenilaian.isPending || updatePenilaian.isPending}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Penilaian'}
            </Button>
          </div>
        </RoleGate>
      </form>
    </div>
  );
}

function getMonthName(month: number): string {
  return BULAN_OPTIONS.find((b) => b.value === month.toString())?.label || '';
}
