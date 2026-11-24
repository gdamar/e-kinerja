import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SkorInput } from '@/components/features/penilaian/SkorInput';
import { useApprovePenilaianBanding } from '@/hooks/usePenilaianBanding';
import { useToast } from '@/hooks/useToast';
import type { PenilaianBanding } from '@/types';
import { FileText, Eye } from 'lucide-react';

const schema = z.object({
  skor_displin_kehadiran: z
    .number()
    .min(0, 'Minimal 0')
    .max(100, 'Maksimal 100'),
  skor_tanggung_jawab: z
    .number()
    .min(0, 'Minimal 0')
    .max(100, 'Maksimal 100'),
  skor_kepatuhan: z
    .number()
    .min(0, 'Minimal 0')
    .max(100, 'Maksimal 100'),
  catatan_operator: z.string().min(1, 'Catatan operator wajib diisi saat menyetujui'),
});

type FormData = z.infer<typeof schema>;

interface ModalApproveBandingProps {
  banding: PenilaianBanding | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (url: string) => void;
}

export function ModalApproveBanding({
  banding,
  isOpen,
  onClose,
  onOpenPreview,
}: ModalApproveBandingProps) {
  const { toast } = useToast();
  const approveMutation = useApprovePenilaianBanding();

  const penilaian = banding?.penilaian;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      skor_displin_kehadiran: Number(penilaian?.skor_displin_kehadiran ?? 80),
      skor_tanggung_jawab: Number(penilaian?.skor_tanggung_jawab ?? 80),
      skor_kepatuhan: Number(penilaian?.skor_kepatuhan ?? 80),
      catatan_operator: '',
    },
  });

  const skorDisiplin = watch('skor_displin_kehadiran');
  const skorTanggungJawab = watch('skor_tanggung_jawab');
  const skorKepatuhan = watch('skor_kepatuhan');

  // Preview estimated total
  const estimatedTotal = (
    skorDisiplin * 0.4 +
    skorTanggungJawab * 0.35 +
    skorKepatuhan * 0.25
  ).toFixed(1);

  const onSubmit = async (data: FormData) => {
    if (!banding) return;

    try {
      await approveMutation.mutateAsync({
        idBanding: banding.id,
        idPenilaian: banding.id_penilaian,
        skorDisiplin: data.skor_displin_kehadiran,
        skorTanggungJawab: data.skor_tanggung_jawab,
        skorKepatuhan: data.skor_kepatuhan,
        catatanOperator: data.catatan_operator,
      });

      toast({
        title: 'Banding Disetujui',
        description: `Nilai kinerja petugas berhasil diperbarui.`,
      });
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Gagal Menyetujui',
        description: (err as Error)?.message || 'Terjadi kesalahan sistem',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Setujui Pengajuan Banding</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info Petugas & Catatan Pengajuan */}
          <div className="bg-muted/30 p-3 rounded-lg border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Petugas:</span>
              <span>{penilaian?.petugas?.nama_phl} ({penilaian?.petugas?.nik})</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Catatan Petugas:</span>
              <p className="mt-0.5 text-muted-foreground whitespace-pre-wrap">
                {banding?.catatan_petugas}
              </p>
            </div>
            {banding?.lampiran_url && (
              <div className="pt-1 flex items-center justify-between border-t border-border/50">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Lampiran Bukti
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => onOpenPreview(banding.lampiran_url!)}
                >
                  <Eye className="h-3 w-3" />
                  Lihat Lampiran
                </Button>
              </div>
            )}
          </div>

          {/* Nilai Awal (Disabled) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Skor Awal Sebelum Banding
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 border rounded-md bg-muted/20 text-center">
                <p className="text-[11px] text-muted-foreground">Disiplin (40%)</p>
                <p className="font-bold text-sm">{penilaian?.skor_displin_kehadiran}</p>
              </div>
              <div className="p-2 border rounded-md bg-muted/20 text-center">
                <p className="text-[11px] text-muted-foreground">Tanggung Jawab (35%)</p>
                <p className="font-bold text-sm">{penilaian?.skor_tanggung_jawab}</p>
              </div>
              <div className="p-2 border rounded-md bg-muted/20 text-center">
                <p className="text-[11px] text-muted-foreground">Kepatuhan (25%)</p>
                <p className="font-bold text-sm">{penilaian?.skor_kepatuhan}</p>
              </div>
            </div>
          </div>

          {/* Form Input Perubahan Nilai */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-xs font-semibold text-primary uppercase tracking-wider">
              Masukkan Skor Penyesuaian Baru
            </Label>

            <SkorInput
              label="Disiplin Kehadiran (Bobot 40%)"
              value={skorDisiplin}
              onChange={(val) => setValue('skor_displin_kehadiran', val)}
              error={errors.skor_displin_kehadiran?.message}
            />

            <SkorInput
              label="Tanggung Jawab (Bobot 35%)"
              value={skorTanggungJawab}
              onChange={(val) => setValue('skor_tanggung_jawab', val)}
              error={errors.skor_tanggung_jawab?.message}
            />

            <SkorInput
              label="Kepatuhan SOP (Bobot 25%)"
              value={skorKepatuhan}
              onChange={(val) => setValue('skor_kepatuhan', val)}
              error={errors.skor_kepatuhan?.message}
            />

            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
              <span className="text-xs font-medium text-primary">Estimasi Total Nilai Baru:</span>
              <span className="text-base font-bold text-primary">{estimatedTotal}</span>
            </div>
          </div>

          {/* Catatan Operator */}
          <div className="space-y-2">
            <Label htmlFor="catatan_operator">
              Catatan Operator <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="catatan_operator"
              placeholder="Berikan alasan dan pertimbangan penyesuaian nilai..."
              error={errors.catatan_operator?.message}
              {...register('catatan_operator')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              isLoading={isSubmitting || approveMutation.isPending}
            >
              Simpan & Setujui
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
