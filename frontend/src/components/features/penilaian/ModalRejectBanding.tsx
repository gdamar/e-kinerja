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
import { useRejectPenilaianBanding } from '@/hooks/usePenilaianBanding';
import { useToast } from '@/hooks/useToast';
import type { PenilaianBanding } from '@/types';
import { FileText, Eye, AlertTriangle } from 'lucide-react';

const schema = z.object({
  catatan_operator: z.string().min(5, 'Catatan penolakan minimal 5 karakter'),
});

type FormData = z.infer<typeof schema>;

interface ModalRejectBandingProps {
  banding: PenilaianBanding | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (url: string) => void;
}

export function ModalRejectBanding({
  banding,
  isOpen,
  onClose,
  onOpenPreview,
}: ModalRejectBandingProps) {
  const { toast } = useToast();
  const rejectMutation = useRejectPenilaianBanding();

  const penilaian = banding?.penilaian;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      catatan_operator: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!banding) return;

    try {
      await rejectMutation.mutateAsync({
        idBanding: banding.id,
        catatanOperator: data.catatan_operator,
      });

      toast({
        title: 'Banding Ditolak',
        description: 'Pengajuan banding telah ditolak dan catatan telah disimpan.',
      });
      reset();
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Gagal Menolak',
        description: (err as Error)?.message || 'Terjadi kesalahan sistem',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Tolak Pengajuan Banding
          </DialogTitle>
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

          {/* Nilai Saat Ini (Tetap/Tidak Berubah) */}
          <div className="p-3 border rounded-lg bg-muted/10 text-xs space-y-1">
            <p className="text-muted-foreground">
              *Jika ditolak, skor awal petugas tetap berlaku tanpa perubahan nilai.
            </p>
            <p className="font-medium">
              Total Skor Saat Ini:{' '}
              <span className="font-bold">{penilaian?.total_nilai}</span>
            </p>
          </div>

          {/* Catatan Penolakan Wajib */}
          <div className="space-y-2">
            <Label htmlFor="catatan_operator">
              Alasan Penolakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="catatan_operator"
              placeholder="Jelaskan alasan penolakan pengajuan banding ini..."
              rows={4}
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
              variant="destructive"
              isLoading={isSubmitting || rejectMutation.isPending}
            >
              Tolak Pengajuan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
