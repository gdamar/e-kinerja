import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMasterPetugasById } from '@/hooks/useMasterPetugas';
import { useTugasList } from '@/hooks/useTugasList';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function PetugasDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: petugas, isLoading: isLoadingPetugas } = useMasterPetugasById(id || '');
  const { data: tugasList } = useTugasList();

  // Filter tugas by this petugas
  const petugasTugas = tugasList?.filter(
    (tugas) => tugas.id_petugas === id
  ) || [];

  if (isLoadingPetugas) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PETUGAS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (!petugas) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.PETUGAS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Petugas tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.PETUGAS)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{petugas.nama_phl}</h1>
          <p className="text-muted-foreground">NIK: {petugas.nik}</p>
        </div>
        <Button onClick={() => navigate(`${ROUTES.PETUGAS}/${id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Petugas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <InfoRow
                label="NIK"
                value={petugas.nik || '-'}
              />
              <InfoRow
                label="Nama Lengkap"
                value={petugas.nama_phl}
              />
              <InfoRow
                label="Jenis Kelamin"
                value={petugas.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              />
              <InfoRow
                label="Role"
                value={
                  <Badge
                    variant={
                      petugas.role?.nama_role?.toLowerCase() === 'petugas'
                        ? 'info'
                        : petugas.role?.nama_role?.toLowerCase() === 'operator'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {petugas.role?.nama_role || '-'}
                  </Badge>
                }
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="No. Telp"
                value={petugas.no_telp || '-'}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={petugas.email}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Alamat"
                value={petugas.alamat || '-'}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Status"
                value={
                  <Badge variant={petugas.status_aktif ? 'success' : 'error'}>
                    {petugas.status_aktif ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tugas History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          {petugasTugas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada tugas yang dikerjakan
            </p>
          ) : (
            <div className="space-y-3">
              {petugasTugas.map((tugas) => (
                <div
                  key={tugas.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{tugas.judul_tugas}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tugas.tanggal_tugas)} -{' '}
                      <Badge
                        variant={
                          tugas.status_tugas === 'Selesai'
                            ? 'success'
                            : tugas.status_tugas === 'Proses'
                              ? 'warning'
                              : 'default'
                        }
                        className="ml-1"
                      >
                        {tugas.status_tugas}
                      </Badge>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`${ROUTES.TUGAS}/${tugas.id}`)}
                  >
                    Lihat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="text-muted-foreground mt-0.5">{icon}</div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
