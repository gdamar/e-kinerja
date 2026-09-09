import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { TahapanProgress } from '@/components/features/tugas/TahapanProgress';
import { PetaTugas, PetaTugasPlaceholder } from '@/components/features/tugas/PetaTugas';
import { useTugasDetail } from '@/hooks/useTugasDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TugasLogForm } from '@/components/features/tugas/TugasLogForm';
import { ROUTES, ROLE_CODES } from '@/lib/constants';
import { formatDate, formatDateTime, statusToVariant } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { TahapanTugas } from '@/types';

export default function TugasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { profile } = useAuth();

  const { data: tugas, isLoading, error } = useTugasDetail(id!);

  // Only petugas can submit Laporan Tahapan
  const isPetugas = profile?.role?.nama_role === ROLE_CODES.PETUGAS;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (error || !tugas) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.TUGAS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card className="mt-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Gagal memuat detail tugas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine next stage and if can report
  const completedStages = tugas.logs?.map((l) => l.tahapan) || [];
  const nextStage: TahapanTugas | null =
    !completedStages.includes('Before')
      ? 'Before'
      : !completedStages.includes('Ongoing')
      ? 'Ongoing'
      : !completedStages.includes('Finished')
      ? 'Finished'
      : null;

  const canReport = nextStage && tugas.status_tugas !== 'Selesai';

  // Get location from first log if available
  const firstLog = tugas.logs?.[0];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(ROUTES.TUGAS)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      {/* Map Preview */}
      {firstLog ? (
        <PetaTugas
          latitude={firstLog.latitude}
          longitude={firstLog.longitude}
          title={tugas.judul_tugas}
          height="200px"
        />
      ) : (
        <PetaTugasPlaceholder height="200px" />
      )}

      {/* Task Info */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h1 className="text-xl font-semibold">{tugas.judul_tugas}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{tugas.alamat}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tanggal: </span>
              <span className="font-medium">{formatDate(tugas.tanggal_tugas)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Petugas: </span>
              <span className="font-medium">
                {tugas.allPetugas?.map(p => p.nama_phl).join(', ') || '-'}
              </span>
            </div>
            <Badge variant={statusToVariant(tugas.status_tugas)}>{tugas.status_tugas}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progres Tahapan</CardTitle>
        </CardHeader>
        <CardContent>
          <TahapanProgress completedTahapan={completedStages} />
        </CardContent>
      </Card>

      {/* Report Button - Only for Petugas */}
      {canReport && isPetugas && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Camera className="h-4 w-4 mr-2" />
              Laporkan {nextStage}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Laporan Tahapan {nextStage}</DialogTitle>
            </DialogHeader>
            <TugasLogForm tugasId={tugas.id} tahap={nextStage!} onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Log Entries */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Riwayat Laporan</h2>

        {!tugas.logs?.length ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada laporan</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tugas.logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{log.tahapan}</CardTitle>
                    <Badge variant="success">{log.tahapan}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {log.deskripsi && (
                    <div className="flex gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm">{log.deskripsi}</p>
                    </div>
                  )}

                  {/* Photos */}
                  {log.url_foto && (log.url_foto as unknown as string[]).length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(log.url_foto as unknown as string[]).map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded-md shrink-0"
                        />
                      ))}
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                    </span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
