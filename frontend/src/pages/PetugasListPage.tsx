import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Filter, X, Eye, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMasterPetugas } from '@/hooks/useMasterPetugas';
import { ROUTES, ROLE_CODES } from '@/lib/constants';

export default function PetugasListPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: null as string | null,
    statusAktif: null as boolean | null,
  });

  const { data: petugasList, isLoading } = useMasterPetugas(filters);

  const hasActiveFilters = filters.role !== null || filters.statusAktif !== null;

  const clearFilters = () => {
    setFilters({
      role: null,
      statusAktif: null,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Manage Petugas"
        description="Kelola data master petugas PHL"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => navigate(ROUTES.PETUGAS_NEW)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Petugas
            </Button>
          </div>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filter Petugas</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Filter by Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      role: v === 'all' ? null : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value={ROLE_CODES.PETUGAS}>Petugas (PHL)</SelectItem>
                    <SelectItem value={ROLE_CODES.OPERATOR}>Operator</SelectItem>
                    <SelectItem value={ROLE_CODES.KEPALA_SESI}>Kepala Sesi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={
                    filters.statusAktif === null
                      ? 'all'
                      : filters.statusAktif
                        ? 'active'
                        : 'inactive'
                  }
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      statusAktif:
                        v === 'all' ? null : v === 'active',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {petugasList && petugasList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Petugas" value={petugasList.length} />
          <StatCard
            label="Aktif"
            value={petugasList.filter((p) => p.status_aktif).length}
          />
          <StatCard
            label="Nonaktif"
            value={petugasList.filter((p) => !p.status_aktif).length}
          />
          <StatCard
            label="Petugas (PHL)"
            value={
              petugasList.filter(
                (p) => p.role?.nama_role?.toLowerCase() === 'petugas'
              ).length
            }
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : !petugasList?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Users}
              title="Belum ada petugas"
              description={
                hasActiveFilters
                  ? 'Tidak ada petugas yang sesuai dengan filter'
                  : 'Tambahkan petugas baru untuk mulai mengelola data'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                ) : (
                  <Button onClick={() => navigate(ROUTES.PETUGAS_NEW)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Petugas
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">NIK</div>
            <div className="col-span-3">Nama</div>
            <div className="col-span-1">JK</div>
            <div className="col-span-2">No. Telp</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Aksi</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {petugasList.map((petugas) => (
              <Card key={petugas.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        NIK:{' '}
                      </span>
                      {petugas.nik || '-'}
                    </div>
                    <div className="col-span-3 font-medium">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Nama:{' '}
                      </span>
                      {petugas.nama_phl}
                      <br />
                      <span className="text-xs text-muted-foreground md:hidden">
                        Email:{' '}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {petugas.email}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-muted-foreground md:hidden">
                        JK:{' '}
                      </span>
                      {petugas.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        No. Telp:{' '}
                      </span>
                      {petugas.no_telp || '-'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Role:{' '}
                      </span>
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
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Status:{' '}
                      </span>
                      <Badge variant={petugas.status_aktif ? 'success' : 'error'}>
                        {petugas.status_aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.PETUGAS}/${petugas.id}/detail`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.PETUGAS}/${petugas.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
