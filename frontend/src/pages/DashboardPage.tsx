import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useTugasList } from '@/hooks/useTugasList';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ROUTES } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';
import { TugasCard } from '@/components/features/tugas';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();

  const today = useMemo(() => {
    const now = new Date(Date.now());
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const { data: rawTodaysTugas, isLoading: isLoadingTugas } = useTugasList({
    tanggal: today,
  });

  const todaysTugas = useMemo(() => {
    if (!rawTodaysTugas) return [];
    return rawTodaysTugas.filter((tugas) => {
      if (!tugas.tanggal_tugas) return false;
      const taskDate = tugas.tanggal_tugas.split('T')[0].trim();
      return taskDate === today;
    });
  }, [rawTodaysTugas, today]);

  const isPetugas = profile?.role?.nama_role === 'petugas';
  const isKepalasesi = profile?.role?.nama_role === 'kepala_sesi';
  const isOperator = profile?.role?.nama_role === 'operator';

  const statsConfig = [
    {
      title: 'Tugas Aktif',
      value: stats?.tugasAktif ?? '-',
      icon: ClipboardList,
      color: 'text-primary',
    },
    {
      title: 'Selesai Hari Ini',
      value: stats?.selesaiHariIni ?? '-',
      icon: CheckCircle2,
      color: 'text-status-success',
    },
    {
      title: 'Total Tugas',
      value: stats?.totalTugas ?? '-',
      icon: Calendar,
      color: 'text-status-info',
    },
    {
      title: 'Menunggu',
      value: stats?.menunggu ?? '-',
      icon: Clock,
      color: 'text-status-warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`Selamat Datang, ${profile?.nama_phl?.split(' ')[0] || 'User'}`}
        description={formatDateShort(new Date())}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? <Skeleton className="h-8 w-12" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        {isPetugas ? (
          <>
            <Button
              onClick={() => navigate(ROUTES.TUGAS)}
              className="flex-1"
              variant="outline"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Lihat Tugas
            </Button>
            <Button
              onClick={() => navigate(ROUTES.CUTI_AJUAN)}
              className="flex-1"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ajukan Cuti
            </Button>
          </>
        ) : isKepalasesi ? (
          <>
            <Button
              onClick={() => navigate(ROUTES.TUGAS_NEW)}
              className="flex-1"
              variant="outline"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Tugas Baru
            </Button>
            <Button
              onClick={() => navigate(ROUTES.CUTI_APPROVAL)}
              className="flex-1"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Approval Cuti
            </Button>
          </>
        ) : isOperator ? (
          <Button
            onClick={() => navigate(ROUTES.CUTI_APPROVAL)}
            className="flex-1"
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Approval Cuti
          </Button>
        ) : null}
      </div>

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Tugas Hari Ini</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.TUGAS)}
          >
            Lihat Semua
          </Button>
        </div>

        {isLoadingTugas ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ) : !todaysTugas?.length ? (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                icon={ClipboardList}
                title="Belum ada tugas"
                description={
                  !isPetugas
                    ? 'Tambahkan tugas baru untuk petugas'
                    : 'Tidak ada tugas yang ditambahkan untuk Anda hari ini'
                }
                action={
                  !isPetugas
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
          <div className="space-y-3">
            {todaysTugas.slice(0, 5).map((tugas) => (
              <TugasCard key={tugas.id} tugas={tugas} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
