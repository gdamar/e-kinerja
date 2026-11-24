import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePenilaianBandingByPenilaian } from '@/hooks/usePenilaianBanding';
import { formatDateTime, getMonthName } from '@/lib/utils';
import type { Penilaian } from '@/types';
import { FileText, Eye, History, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface PenilaianDetailModalProps {
  penilaian: Penilaian | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (url: string) => void;
}

export function PenilaianDetailModal({
  penilaian,
  isOpen,
  onClose,
  onOpenPreview,
}: PenilaianDetailModalProps) {
  const { data: bandingHistory, isLoading } = usePenilaianBandingByPenilaian(
    penilaian?.id || ''
  );

  if (!penilaian) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Detail & Riwayat Penilaian
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ringkasan Skor & Info */}
          <div className="p-4 rounded-lg border bg-muted/20 space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-base">
                  {penilaian.petugas?.nama_phl || 'Petugas'}
                </p>
                <p className="text-xs text-muted-foreground">
                  NIK: {penilaian.petugas?.nik || '-'} • Periode:{' '}
                  {getMonthName(penilaian.periode_bulan)} {penilaian.periode_tahun}
                </p>
              </div>
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

            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-xs">
              <div className="p-2 rounded bg-background border">
                <p className="text-muted-foreground text-[11px]">Disiplin (40%)</p>
                <p className="font-bold text-sm mt-0.5">
                  {penilaian.skor_displin_kehadiran}
                </p>
              </div>
              <div className="p-2 rounded bg-background border">
                <p className="text-muted-foreground text-[11px]">Tanggung Jawab (35%)</p>
                <p className="font-bold text-sm mt-0.5">
                  {penilaian.skor_tanggung_jawab}
                </p>
              </div>
              <div className="p-2 rounded bg-background border">
                <p className="text-muted-foreground text-[11px]">Kepatuhan (25%)</p>
                <p className="font-bold text-sm mt-0.5">
                  {penilaian.skor_kepatuhan}
                </p>
              </div>
            </div>

            {penilaian.catatan && (
              <div className="text-xs pt-1">
                <span className="text-muted-foreground font-medium">Catatan Evaluasi:</span>
                <p className="mt-0.5 text-foreground italic">"{penilaian.catatan}"</p>
              </div>
            )}
          </div>

          {/* Riwayat Banding */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              Riwayat Pengajuan Banding
            </h4>

            {isLoading ? (
              <p className="text-xs text-muted-foreground py-3 text-center">
                Memuat riwayat...
              </p>
            ) : !bandingHistory || bandingHistory.length === 0 ? (
              <div className="p-4 rounded-lg border text-center text-xs text-muted-foreground bg-muted/10">
                Belum ada pengajuan banding untuk penilaian ini.
              </div>
            ) : (
              <div className="space-y-3">
                {bandingHistory.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-lg border bg-card text-xs space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {b.status === 'Disetujui' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : b.status === 'Ditolak' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-semibold">{b.status}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {formatDateTime(b.created_at)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Catatan Petugas:</p>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {b.catatan_petugas}
                      </p>
                    </div>

                    {b.catatan_operator && (
                      <div className="p-2 rounded bg-muted/30 border border-border/60 space-y-1">
                        <p className="text-[11px] font-semibold text-foreground">
                          Catatan Operator:
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {b.catatan_operator}
                        </p>
                      </div>
                    )}

                    {b.lampiran_url && (
                      <div className="pt-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-primary gap-1"
                          onClick={() => onOpenPreview(b.lampiran_url!)}
                        >
                          <Eye className="h-3 w-3" />
                          Lihat Lampiran
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
