import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ClipboardList, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useTugasList } from '@/hooks/useTugasList';
import { useDeleteTugas } from '@/hooks/useTugasMutation';
import { RoleGate } from '@/components/shared/RoleGate';
import { ROUTES, STATUS_TUGAS, ROLE_CODES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import type { StatusTugas } from '@/types';
/* 
 *BUG: Card list tugas overlap sama bottom navbar
 *BUG: Hasil search belum ke filter
 * */
export default function TugasListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const deleteTugas = useDeleteTugas();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusTugas | ''>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tugasToDelete, setTugasToDelete] = useState<{ id: string; judul: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: tugas, isLoading } = useTugasList({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  // Group by date
  const groupedTugas = tugas?.reduce((acc, t) => {
    const date = t.tanggal_tugas;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, typeof tugas>);

  const isOperator = profile?.role?.role_code === ROLE_CODES.OPERATOR || profile?.role?.role_code === ROLE_CODES.KEPALA_SESI;

  return (
    <div className="p-4 md:p-6 space-y-6 h-[calc(100dvh-4rem)] lg:h-dvh overflow-y-auto">
      <PageHeader
        title="Daftar Tugas"
        actions={
          <RoleGate roles={[ROLE_CODES.KEPALA_SESI]}>
            <Button onClick={() => navigate(ROUTES.TUGAS_NEW)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </RoleGate>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Cari tugas..."
                icon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusTugas | '')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                <SelectItem value={STATUS_TUGAS.MENUNGGU}>Menunggu</SelectItem>
                <SelectItem value={STATUS_TUGAS.PROSES}>Proses</SelectItem>
                <SelectItem value={STATUS_TUGAS.SELESAI}>Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !tugas?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Filter}
              title="Tidak ada tugas"
              description={search || statusFilter ? 'Coba ubah filter pencarian' : 'Belum ada tugas yang ditambahkan'}
              action={
                isOperator
                  ? {
                      label: 'Tambah Tugas',
                      onClick: () => navigate(ROUTES.TUGAS_NEW),
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTugas || {}).map(([date, tasks]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {formatDate(date)}
              </h3>
              <div className="space-y-3">
                {tasks.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(ROUTES.TUGAS_DETAIL.replace(':id', t.id))}
                        >
                          <h4 className="font-medium text-foreground truncate">{t.judul_tugas}</h4>
                          <p className="text-sm text-muted-foreground truncate">{t.alamat}</p>
                          {isOperator && t.petugas && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Petugas: {t.petugas.nama_phl}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              t.status_tugas === STATUS_TUGAS.SELESAI
                                ? 'success'
                                : t.status_tugas === STATUS_TUGAS.MENUNGGU
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {t.status_tugas}
                          </Badge>
                          <RoleGate roles={[ROLE_CODES.KEPALA_SESI]}>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(ROUTES.TUGAS_EDIT.replace(':id', t.id));
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-status-error hover:text-status-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTugasToDelete({ id: t.id, judul: t.judul_tugas });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </RoleGate>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tugas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tugas "{tugasToDelete?.judul}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteTugas.isPending}
              onClick={() => {
                if (tugasToDelete) {
                  deleteTugas.mutate(tugasToDelete.id, {
                    onSuccess: () => {
                      toast({
                        title: 'Berhasil',
                        description: 'Tugas berhasil dihapus',
                      });
                      setDeleteDialogOpen(false);
                      setTugasToDelete(null);
                    },
                    onError: () => {
                      toast({
                        title: 'Gagal',
                        description: 'Gagal menghapus tugas',
                        variant: 'destructive',
                      });
                    },
                  });
                }
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
