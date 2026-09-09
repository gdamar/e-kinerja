import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, statusToVariant } from '@/lib/utils';
import type { Cuti } from '@/types';

interface CutiCardProps {
  cuti: Cuti;
  showPetugas?: boolean;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApproving?: boolean;
  onClick?: () => void;
}

export function CutiCard({ cuti, showPetugas = false, showStatus = false, onApprove, onReject, isApproving, onClick }: CutiCardProps) {
  const duration = calculateDuration(cuti.tgl_mulai, cuti.tgl_selesai);

  return (
    <Card
      className={cn('transition-colors', onClick && 'cursor-pointer hover:bg-muted/50')}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{cuti.jenis_cuti}</Badge>
              <Badge variant={statusToVariant(cuti.status_approval)}>
                {cuti.status_approval}
              </Badge>
            </div>
            {showPetugas && cuti.petugas && (
              <p className="text-sm font-medium mt-2">{cuti.petugas.nama_phl}</p>
            )}
            {showStatus && cuti.petugas && (
              <p className="text-xs text-muted-foreground mt-1">
                {cuti.petugas.nama_phl}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>
            {formatDate(cuti.tgl_mulai)} - {formatDate(cuti.tgl_selesai)}
          </span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {duration} hari
          </span>
        </div>

        {cuti.alasan && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-2">{cuti.alasan}</p>
          </div>
        )}

        {onApprove && onReject && cuti.status_approval === 'Menunggu' && (
          <div className="flex gap-2 pt-2 border-t">
            <button
              onClick={() => onApprove(cuti.id)}
              disabled={isApproving}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                'bg-status-success-bg text-status-success hover:bg-status-success/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isApproving ? 'Memproses...' : 'Setujui'}
            </button>
            <button
              onClick={() => onReject(cuti.id)}
              disabled={isApproving}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                'bg-status-error-bg text-status-error hover:bg-status-error/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Tolak
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
