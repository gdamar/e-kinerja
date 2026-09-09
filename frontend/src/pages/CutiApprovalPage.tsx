import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useCutiList } from '@/hooks/useCutiList';
import { useApproveCuti } from '@/hooks/useCutiMutation';
import { CutiCard } from '@/components/features/cuti';
import { ROUTES, STATUS_APPROVAL } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

export default function CutiApprovalPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: pendingCuti, isLoading } = useCutiList(STATUS_APPROVAL.MENUNGGU);
  const { mutate: approveCuti, isPending: isApproving } = useApproveCuti();

  const handleApprove = (cutiId: string) => {
    if (!profile?.id) return;
    approveCuti({
      cutiId,
      operatorId: profile.id,
      status: 'Disetujui',
    });
  };

  const handleReject = (cutiId: string) => {
    if (!profile?.id) return;
    approveCuti({
      cutiId,
      operatorId: profile.id,
      status: 'Tidak Disetujui',
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.CUTI)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <PageHeader
        title="Persetujuan Cuti"
        description={`${pendingCuti?.length || 0} cuti menunggu persetujuan`}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : !pendingCuti?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Calendar}
              title="Tidak ada cuti"
              description="Semua pengajuan cuti sudah diproses"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingCuti.map((cuti) => (
            <CutiCard
              key={cuti.id}
              cuti={cuti}
              showPetugas
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={isApproving}
            />
          ))}
        </div>
      )}
    </div>
  );
}
