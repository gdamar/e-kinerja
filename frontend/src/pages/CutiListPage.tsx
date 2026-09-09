import { useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useCutiList } from '@/hooks/useCutiList';
import { useAuth } from '@/context/AuthContext';
import { RoleGate } from '@/components/shared/RoleGate';
import { CutiCard } from '@/components/features/cuti';
import { ROUTES, ROLE_CODES, STATUS_APPROVAL } from '@/lib/constants';

export default function CutiListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: pendingCuti, isLoading: isLoadingPending } = useCutiList(STATUS_APPROVAL.MENUNGGU);
  const { data: allCuti, isLoading: isLoadingAll } = useCutiList();

  const isPetugas = profile?.role?.nama_role === ROLE_CODES.PETUGAS;
  const isOperator = profile?.role?.nama_role === ROLE_CODES.OPERATOR;
  const isKepalasesi = profile?.role?.nama_role === ROLE_CODES.KEPALA_SESI;
  const isStaff = isOperator || isKepalasesi;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Cuti"
        actions={
          isPetugas && (
            <Button onClick={() => navigate(ROUTES.CUTI_AJUAN)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajukan
            </Button>
          )
        }
      />

      <Tabs defaultValue={isStaff ? 'pending' : 'all'}>
        <TabsList>
          {isStaff && (
            <TabsTrigger value="pending" className="relative">
              Menunggu
              {pendingCuti && pendingCuti.length > 0 && (
                <Badge
                  variant="error"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {pendingCuti.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>

        {isStaff && (
          <TabsContent value="pending" className="mt-4">
            {isLoadingPending ? (
              <div className="space-y-3">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
              </div>
            ) : !pendingCuti?.length ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={Calendar}
                    title="Tidak ada pengajuan"
                    description="Semua pengajuan cuti sudah diproses"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingCuti.map((cuti) => (
                  <CutiCard key={cuti.id} cuti={cuti} showPetugas onClick={() => navigate(ROUTES.CUTI_DETAIL.replace(':id', cuti.id))} />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="all" className="mt-4">
          {isLoadingAll ? (
            <div className="space-y-3">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ) : !allCuti?.length ? (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={Calendar}
                  title="Belum ada pengajuan"
                  description="Ajukan cuti pertama Anda"
                  action={{
                    label: 'Ajukan Cuti',
                    onClick: () => navigate(ROUTES.CUTI_AJUAN),
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allCuti.map((cuti) => (
                <CutiCard
                  key={cuti.id}
                  cuti={cuti}
                  showPetugas={isStaff}
                  onClick={() => navigate(ROUTES.CUTI_DETAIL.replace(':id', cuti.id))}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Link for Operator/Kepala Sesi */}
      <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(ROUTES.CUTI_APPROVAL)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-status-warning/10">
                <Calendar className="h-5 w-5 text-status-warning" />
              </div>
              <div>
                <p className="font-medium">Persetujuan Cuti</p>
                <p className="text-sm text-muted-foreground">
                  {pendingCuti?.length || 0} menunggun persetujuan
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Proses
            </Button>
          </CardContent>
        </Card>
      </RoleGate>
    </div>
  );
}
