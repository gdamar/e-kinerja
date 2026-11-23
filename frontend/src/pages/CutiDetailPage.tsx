import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCutiDetail } from '@/hooks/useCutiDetail';
import { ROUTES } from '@/lib/constants';
import { formatDate, formatDateTime, statusToVariant } from '@/lib/utils';

export default function CutiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cuti, isLoading, error } = useCutiDetail(id!);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (error || !cuti) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.CUTI)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card className="mt-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Gagal memuat detail pengajuan cuti</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const duration = calculateDuration(cuti.tgl_mulai, cuti.tgl_selesai);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(ROUTES.CUTI)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      {/* Header */}
      <PageHeader
        title="Detail Pengajuan Cuti"
        description={`Diajukan pada ${formatDateTime(cuti.created_at)}`}
        actions={
          <Badge variant={statusToVariant(cuti.status_approval)} className="text-sm px-3 py-1">
            {cuti.status_approval}
          </Badge>
        }
      />

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informasi Cuti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Jenis Cuti</p>
              <p className="font-medium">{cuti.jenis_cuti}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durasi</p>
              <p className="font-medium">{duration} hari</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
              <p className="font-medium">{formatDate(cuti.tgl_mulai)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Selesai</p>
              <p className="font-medium">{formatDate(cuti.tgl_selesai)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Alasan</p>
            <p className="font-medium">{cuti.alasan || '-'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Petugas Info */}
      {cuti.petugas && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pemohon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{cuti.petugas.nama_phl}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIK</p>
                <p className="font-medium">{cuti.petugas.nik}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{cuti.petugas.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. Telepon</p>
                <p className="font-medium">{cuti.petugas.no_telp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachment */}
      {cuti.lampiran_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lampiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => window.open(cuti.lampiran_url!, '_blank')}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Lampiran
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-status-warning mt-2" />
              <div>
                <p className="font-medium text-sm">Pengajuan Diajukan</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(cuti.created_at)}</p>
              </div>
            </div>
            {cuti.updated_at !== cuti.created_at && (
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(cuti.status_approval)}`} />
                <div>
                  <p className="font-medium text-sm">
                    Status: {cuti.status_approval}
                    {cuti.status_approval === 'Disetujui' && ' ✓'}
                    {cuti.status_approval === 'Tidak Disetujui' && ' ✗'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(cuti.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Disetujui':
      return 'bg-status-success';
    case 'Ditangguhkan':
      return 'bg-status-warning';
    case 'Tidak Disetujui':
      return 'bg-status-error';
    default:
      return 'bg-muted';
  }
}
