import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Filter, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useLaporan, useLaporanCoordinates } from '@/hooks/useLaporan';
import { usePetugasList } from '@/hooks/usePetugasList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LaporanMap, LaporanMapPlaceholder } from '@/components/features/laporan';
import { exportToCSV } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import { ROUTES, STATUS_TUGAS } from '@/lib/constants';

export default function LaporanPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [petugasId, setPetugasId] = useState('');

  const filters = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    petugasId: petugasId || undefined,
  };

  const { data: laporanData, isLoading } = useLaporan(filters);
  const { data: coordinates } = useLaporanCoordinates(filters);
  const { data: petugasList } = usePetugasList();

  const handleExport = () => {
    if (!laporanData?.tugas) return;

    const exportData = laporanData.tugas.map(t => ({
      'Tanggal': formatDate(t.tanggal_tugas),
      'Judul Tugas': t.judul_tugas,
      'Alamat': t.alamat,
      'Petugas': t.petugas?.nama_phl || '-',
      'Status': t.status_tugas,
    }));

    const filename = `laporan_${startDate || 'all'}_${endDate || 'all'}.csv`;
    exportToCSV(exportData, filename);
  };

  const stats = laporanData?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Lihat laporan dan statistik tugas"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!laporanData?.tugas.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="petugas">Petugas</Label>
              <Select value={petugasId} onValueChange={setPetugasId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Petugas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Petugas</SelectItem>
                  {petugasList?.map((petugas) => (
                    <SelectItem key={petugas.id} value={petugas.id}>
                      {petugas.nama_phl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(startDate || endDate || petugasId) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPetugasId('');
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tugas" value={stats?.total || 0} color="text-primary" />
          <StatCard label="Selesai" value={stats?.selesai || 0} color="text-status-success" />
          <StatCard label="Proses" value={stats?.proses || 0} color="text-status-warning" />
          <StatCard label="Menunggu" value={stats?.menunggu || 0} color="text-muted-foreground" />
        </div>
      )}

      {/* Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Peta Lokasi Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] rounded-lg" />
          ) : coordinates && coordinates.length > 0 ? (
            <LaporanMap coordinates={coordinates} height="300px" />
          ) : (
            <LaporanMapPlaceholder height="300px" />
          )}
          {coordinates && coordinates.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {coordinates.length} lokasi tugas ditampilkan
            </p>
          )}
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Daftar Tugas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : !laporanData?.tugas.length ? (
            <p className="text-center text-muted-foreground py-8">
              Tidak ada data tugas
            </p>
          ) : (
            <div className="space-y-3">
              {laporanData?.tugas.map((tugas) => (
                <Link
                  key={tugas.id}
                  to={ROUTES.TUGAS_DETAIL.replace(':id', tugas.id)}
                  className="block group"
                >
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {tugas.judul_tugas}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {tugas.alamat}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(tugas.tanggal_tugas)} • {tugas.petugas?.nama_phl || '-'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            tugas.status_tugas === STATUS_TUGAS.SELESAI
                              ? 'success'
                              : tugas.status_tugas === STATUS_TUGAS.MENUNGGU
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {tugas.status_tugas}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'text-foreground',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
