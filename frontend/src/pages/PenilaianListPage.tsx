import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Filter, X, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePenilaianList } from '@/hooks/usePenilaianList';
import { usePetugasList } from '@/hooks/usePetugasList';
import { RoleGate } from '@/components/shared/RoleGate';
import { ROUTES, ROLE_CODES, BULAN_OPTIONS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getMonthName } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PenilaianListPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    bulan: null as number | null,
    tahun: null as number | null,
    idPetugas: null as string | null,
    minSkor: null as number | null,
    maxSkor: null as number | null,
  });

  const { data: penilaianList, isLoading } = usePenilaianList(filters);
  const { data: petugasList } = usePetugasList();

  const hasActiveFilters =
    filters.bulan !== null ||
    filters.tahun !== null ||
    filters.idPetugas !== null ||
    filters.minSkor !== null ||
    filters.maxSkor !== null;

  const clearFilters = () => {
    setFilters({
      bulan: null,
      tahun: null,
      idPetugas: null,
      minSkor: null,
      maxSkor: null,
    });
  };

  // Calculate stats
  const stats = {
    total: penilaianList?.length || 0,
    rataRata:
      penilaianList && penilaianList.length > 0
        ? penilaianList.reduce((sum, p) => sum + p.total_nilai, 0) /
          penilaianList.length
        : 0,
    petugasDinilai: new Set(penilaianList?.map((p) => p.id_petugas)).size || 0,
    bulanIni: new Date().getMonth() + 1,
    tahunIni: new Date().getFullYear(),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Penilaian Kinerja"
        description="Riwayat penilaian dan evaluasi kinerja petugas"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <Badge
                  variant="default"
                  className="ml-2 h-5 w-5 p-0 justify-center"
                >
                  {[
                    filters.bulan,
                    filters.tahun,
                    filters.idPetugas,
                    filters.minSkor,
                    filters.maxSkor,
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <RoleGate roles={[ROLE_CODES.OPERATOR]}>
              <Button onClick={() => navigate(ROUTES.PENILAIAN_NEW)}>
                <Plus className="h-4 w-4 mr-2" />
                Baru
              </Button>
            </RoleGate>
          </div>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filter Penilaian</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Filter by Bulan */}
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select
                  value={filters.bulan?.toString() || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      bulan: v === 'all' ? null : parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {BULAN_OPTIONS.map((bulan) => (
                      <SelectItem
                        key={bulan.value}
                        value={bulan.value}
                      >
                        {bulan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Tahun */}
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select
                  value={filters.tahun?.toString() || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      tahun: v === 'all' ? null : parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {[2024, 2025, 2026].map((tahun) => (
                      <SelectItem key={tahun} value={tahun.toString()}>
                        {tahun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Petugas */}
              <div className="space-y-2">
                <Label>Petugas</Label>
                <Select
                  value={filters.idPetugas || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      idPetugas: v === 'all' ? null : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {petugasList?.map((petugas) => (
                      <SelectItem key={petugas.id} value={petugas.id}>
                        {petugas.nama_phl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Min Skor */}
              <div className="space-y-2">
                <Label>Min Skor</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={filters.minSkor ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      minSkor: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                />
              </div>

              {/* Filter by Max Skor */}
              <div className="space-y-2">
                <Label>Max Skor</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="100"
                  value={filters.maxSkor ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      maxSkor: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    }))
                  }
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Filter aktif:
                </span>
                {filters.bulan && (
                  <Badge variant="default">
                    {getMonthName(filters.bulan)}
                  </Badge>
                )}
                {filters.tahun && (
                  <Badge variant="default">{filters.tahun}</Badge>
                )}
                {filters.idPetugas && (
                  <Badge variant="default">
                    {
                      petugasList?.find((p) => p.id === filters.idPetugas)
                        ?.nama_phl
                    }
                  </Badge>
                )}
                {(filters.minSkor !== null || filters.maxSkor !== null) && (
                  <Badge variant="default">
                    Skor: {filters.minSkor ?? 0} - {filters.maxSkor ?? 100}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {penilaianList && penilaianList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Penilaian" value={stats.total} />
          <StatCard
            label="Rata-rata Nilai"
            value={stats.rataRata.toFixed(1)}
          />
          <StatCard label="Petugas Dinilai" value={stats.petugasDinilai} />
          <StatCard
            label="Bulan Ini"
            value={`${getMonthName(stats.bulanIni)} ${stats.tahunIni}`}
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : !penilaianList?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={FileText}
              title="Belum ada penilaian"
              description={
                hasActiveFilters
                  ? 'Tidak ada penilaian yang sesuai dengan filter'
                  : 'Penilaian kinerja akan muncul di sini setelah dinilai oleh operator'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                ) : (
                  <RoleGate roles={[ROLE_CODES.OPERATOR]}>
                    <Button onClick={() => navigate(ROUTES.PENILAIAN_NEW)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Penilaian
                    </Button>
                  </RoleGate>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Petugas</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-center">Disiplin</TableHead>
                  <TableHead className="text-center">Tanggung Jawab</TableHead>
                  <TableHead className="text-center">Kepatuhan</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penilaianList.map((penilaian) => {
                  const getScoreColor = (score: number) => {
                    if (score >= 80) return 'text-status-success';
                    if (score >= 60) return 'text-status-warning';
                    return 'text-status-error';
                  };

                  return (
                    <TableRow key={penilaian.id}>
                      <TableCell className="font-medium">
                        {penilaian.petugas?.nama_phl || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {penilaian.petugas?.nik || '-'}
                      </TableCell>
                      <TableCell>
                        {getMonthName(penilaian.periode_bulan)} {penilaian.periode_tahun}
                      </TableCell>
                      <TableCell className={`text-center font-medium ${getScoreColor(penilaian.skor_displin_kehadiran)}`}>
                        {penilaian.skor_displin_kehadiran.toFixed(0)}
                      </TableCell>
                      <TableCell className={`text-center font-medium ${getScoreColor(penilaian.skor_tanggung_jawab)}`}>
                        {penilaian.skor_tanggung_jawab.toFixed(0)}
                      </TableCell>
                      <TableCell className={`text-center font-medium ${getScoreColor(penilaian.skor_kepatuhan)}`}>
                        {penilaian.skor_kepatuhan.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            penilaian.total_nilai >= 80
                              ? 'success'
                              : penilaian.total_nilai >= 60
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {penilaian.total_nilai.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {penilaian.catatan || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <RoleGate roles={[ROLE_CODES.OPERATOR]}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`${ROUTES.PENILAIAN}/${penilaian.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </RoleGate>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
