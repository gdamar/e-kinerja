import { FileText, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Penilaian } from '@/types';
import { getMonthName } from '@/lib/utils';

interface PenilaianCardProps {
  penilaian: Penilaian;
  showActions?: boolean;
  onEdit?: (id: string) => void;
}

export function PenilaianCard({
  penilaian,
  showActions = false,
  onEdit,
}: PenilaianCardProps) {
  const totalScore = penilaian.total_nilai;

  const getScoreVariant = (
    score: number
  ): 'success' | 'warning' | 'error' | 'default' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(penilaian.id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {getMonthName(penilaian.periode_bulan)} {penilaian.periode_tahun}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showActions && onEdit && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Badge variant={getScoreVariant(totalScore)}>
              {totalScore.toFixed(1)}
            </Badge>
          </div>
        </div>
        {penilaian.petugas && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {penilaian.petugas.nama_phl}
            </p>
            {penilaian.petugas.nik && (
              <p className="text-xs text-muted-foreground">
                NIK: {penilaian.petugas.nik}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score bars */}
        <div className="space-y-2">
          <ScoreItem
            label="Disiplin & Kehadiran"
            value={penilaian.skor_displin_kehadiran}
          />
          <ScoreItem
            label="Tanggung Jawab"
            value={penilaian.skor_tanggung_jawab}
          />
          <ScoreItem
            label="Kepatuhan"
            value={penilaian.skor_kepatuhan}
          />
        </div>

        {/* Total */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Total Nilai</span>
            <span
              className={cn(
                'text-lg font-bold',
                totalScore >= 80 && 'text-status-success',
                totalScore >= 60 &&
                  totalScore < 80 &&
                  'text-status-warning',
                totalScore < 60 && 'text-status-error'
              )}
            >
              {totalScore.toFixed(1)}
            </span>
          </div>
          <Progress value={totalScore} variant={getScoreVariant(totalScore)} />
        </div>

        {/* Catatan */}
        {penilaian.catatan && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground line-clamp-2">
                {penilaian.catatan}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(0)}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
