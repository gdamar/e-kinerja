import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateShort, statusToVariant } from '@/lib/utils';
import type { TugasHeader } from '@/types';
import { STATUS_TUGAS } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface TugasCardProps {
  tugas: TugasHeader;
  showPetugas?: boolean;
}

export function TugasCard({ tugas, showPetugas = false }: TugasCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(ROUTES.TUGAS_DETAIL.replace(':id', tugas.id))}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{tugas.judul_tugas}</h4>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{tugas.alamat}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{formatDateShort(tugas.tanggal_tugas)}</span>
              {showPetugas && tugas.petugas && (
                <>
                  <span>•</span>
                  <span>{tugas.petugas.nama_phl}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant={statusToVariant(tugas.status_tugas)}>
            {tugas.status_tugas}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
