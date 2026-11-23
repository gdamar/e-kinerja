import { useState } from 'react';
import { Plus, Users, Filter, X, Key, UserX, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAkunList, useCreateUser, useUpdateUser, useResetPassword, type AkunUser } from '@/hooks/useAkunList';
import { useMasterPetugas } from '@/hooks/useMasterPetugas';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function AkunListPage() {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: null as string | null,
    status: null as 'active' | 'banned' | null,
  });

  const { data: akunList, isLoading } = useAkunList(filters);
  const { data: petugasList } = useMasterPetugas({ statusAktif: true });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const resetPassword = useResetPassword();

  // Dialog states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AkunUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    id_petugas: '',
  });

  const hasActiveFilters = filters.role !== null || filters.status !== null;

  const clearFilters = () => {
    setFilters({
      role: null,
      status: null,
    });
  };

  // Handlers
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await resetPassword.mutateAsync({
        id: selectedUser.id,
        new_password: newPassword,
      });
      toast({
        title: 'Berhasil',
        description: 'Password berhasil direset',
      });
      setResetDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal reset password',
        variant: 'destructive',
      });
    }
  };

  const handleToggleBan = async (user: AkunUser) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        banned: !user.banned,
      });
      toast({
        title: 'Berhasil',
        description: `Akun berhasil ${user.banned ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
    } catch (err: any) {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal update status akun',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.id_petugas) {
      toast({
        title: 'Gagal',
        description: 'Semua field wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createUser.mutateAsync(createForm);
      toast({
        title: 'Berhasil',
        description: 'Akun berhasil dibuat',
      });
      setCreateDialogOpen(false);
      setCreateForm({ email: '', password: '', id_petugas: '' });
    } catch (err: any) {
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal membuat akun',
        variant: 'destructive',
      });
    }
  };

  // Filter out users that already have accounts
  const availablePetugas = petugasList?.filter(
    (p) => !akunList?.some((u) => u.profile?.id === p.id)
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Akun"
        description="Kelola akun autentikasi dan akses user"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Akun
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Akun Baru</DialogTitle>
                  <DialogDescription>
                    Buat akun autentikasi untuk petugas yang belum memiliki akses
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@contoh.com"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, password: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="petugas">Petugas</Label>
                    <Select
                      value={createForm.id_petugas}
                      onValueChange={(v) =>
                        setCreateForm((f) => ({ ...f, id_petugas: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih petugas" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePetugas.map((petugas) => (
                          <SelectItem key={petugas.id} value={petugas.id}>
                            {petugas.nama_phl} - {petugas.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreateUser}
                    isLoading={createUser.isPending}
                  >
                    Buat Akun
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filter Akun</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="petugas">Petugas (PHL)</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="kepala_sesi">Kepala Sesi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      status: v === 'all' ? null : (v as 'active' | 'banned'),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="banned">Dinonaktifkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {akunList && akunList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Akun" value={akunList.length} />
          <StatCard
            label="Aktif"
            value={akunList.filter((u) => !u.banned).length}
          />
          <StatCard
            label="Dinonaktifkan"
            value={akunList.filter((u) => u.banned).length}
          />
          <StatCard
            label="Login Terakhir"
            value={
              akunList.find((u) => u.last_sign_in_at)
                ? formatDate(akunList.find((u) => u.last_sign_in_at)!.last_sign_in_at!)
                : '-'
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
      ) : !akunList?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Users}
              title="Belum ada akun"
              description={
                hasActiveFilters
                  ? 'Tidak ada akun yang sesuai dengan filter'
                  : 'Tambahkan akun baru untuk memberikan akses login'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                ) : (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Akun
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
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Petugas</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Login Terakhir</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Aksi</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {akunList.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Email:{' '}
                      </span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Petugas:{' '}
                      </span>
                      {user.profile?.nama_phl || '-'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Role:{' '}
                      </span>
                      <Badge
                        variant={
                          user.profile?.role?.nama_role?.toLowerCase() === 'petugas'
                            ? 'info'
                            : user.profile?.role?.nama_role?.toLowerCase() === 'operator'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {user.profile?.role?.nama_role || '-'}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Login:{' '}
                      </span>
                      {user.last_sign_in_at
                        ? formatDate(user.last_sign_in_at)
                        : 'Belum pernah'}
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-muted-foreground md:hidden">
                        Status:{' '}
                      </span>
                      <Badge variant={user.banned ? 'error' : 'success'}>
                        {user.banned ? 'Nonaktif' : 'Aktif'}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Dialog
                        open={resetDialogOpen && selectedUser?.id === user.id}
                        onOpenChange={(open) => {
                          setResetDialogOpen(open);
                          if (!open) {
                            setSelectedUser(null);
                            setNewPassword('');
                          } else {
                            setSelectedUser(user);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Key className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Masukkan password baru untuk {user.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new_password">Password Baru</Label>
                              <Input
                                id="new_password"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setResetDialogOpen(false);
                                setSelectedUser(null);
                                setNewPassword('');
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleResetPassword}
                              isLoading={resetPassword.isPending}
                            >
                              Reset Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBan(user)}
                        isLoading={updateUser.isPending}
                      >
                        {user.banned ? (
                          <UserCheck className="h-4 w-4 text-status-success" />
                        ) : (
                          <UserX className="h-4 w-4 text-status-error" />
                        )}
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
