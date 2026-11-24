import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, FileText, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ModalApproveBanding,
  ModalRejectBanding,
  ModalLampiranPreview,
} from '@/components/features/penilaian';
import { usePenilaianBandingList } from '@/hooks/usePenilaianBanding';
import { ROUTES } from '@/lib/constants';
import { formatDateTime, getMonthName } from '@/lib/utils';
import type { PenilaianBanding } from '@/types';

export default function PenilaianBandingPage() {
  const navigate = useNavigate();

  // Query pengajuan banding yang berstatus 'Menunggu'
  const { data: bandingList, isLoading } = usePenilaianBandingList('Menunggu');

  // Modal State
  const [selectedBanding, setSelectedBanding] = useState<PenilaianBanding | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleOpenApprove = (item: PenilaianBanding) => {
    setSelectedBanding(item);
    setIsApproveOpen(true);
  };

  const handleOpenReject = (item: PenilaianBanding) => {
    setSelectedBanding(item);
    setIsRejectOpen(true);
  };

  const handleOpenPreview = (url: string) => {
    setPreviewUrl(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.PENILAIAN)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Penilaian
        </Button>
        <PageHeader
          title="Tinjau Pengajuan Banding Nilai"
          description="Daftar pengajuan banding evaluasi kinerja petugas yang memerlukan persetujuan atau penolakan Operator."
        />
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : !bandingList?.length ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={FileText}
              title="Tidak ada pengajuan banding"
              description="Semua pengajuan banding telah ditinjau atau belum ada pengajuan baru dari petugas."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="py-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Menunggu Peninjauan
              </CardTitle>
              <Badge variant="warning">{bandingList.length} Pengajuan</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TooltipProvider delayDuration={200}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Petugas</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead className="text-center">Skor Disiplin</TableHead>
                      <TableHead className="text-center">Skor Tg. Jawab</TableHead>
                      <TableHead className="text-center">Skor Kepatuhan</TableHead>
                      <TableHead className="text-center">Skor Awal</TableHead>
                      <TableHead className="max-w-[220px]">Catatan Pengajuan</TableHead>
                      <TableHead className="text-center">Lampiran</TableHead>
                      <TableHead>Diajukan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bandingList.map((item) => {
                      const p = item.penilaian;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div>
                              <p>{p?.petugas?.nama_phl || '-'}</p>
                              <p className="text-xs text-muted-foreground">{p?.petugas?.nik}</p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs">
                            {p ? `${getMonthName(p.periode_bulan)} ${p.periode_tahun}` : '-'}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs">
                            {p?.skor_displin_kehadiran ?? '-'}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs">
                            {p?.skor_tanggung_jawab ?? '-'}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs">
                            {p?.skor_kepatuhan ?? '-'}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            <Badge variant="outline" className="font-bold">
                              {p?.total_nilai?.toFixed(1) ?? '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={item.catatan_petugas}>
                              {item.catatan_petugas}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.lampiran_url ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleOpenPreview(item.lampiran_url!)}
                                    aria-label="Lihat Lampiran"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Lihat Lampiran Bukti</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">-</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDateTime(item.created_at)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tombol Disetujui (Hijau) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleOpenApprove(item)}
                                    aria-label="Setujui Banding"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Setujui Banding</p>
                                </TooltipContent>
                              </Tooltip>

                              {/* Tombol Ditolak (Merah) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleOpenReject(item)}
                                    aria-label="Tolak Banding"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Tolak Banding</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}

      {/* Modal Dialogs */}
      <ModalApproveBanding
        banding={selectedBanding}
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setSelectedBanding(null);
        }}
        onOpenPreview={handleOpenPreview}
      />

      <ModalRejectBanding
        banding={selectedBanding}
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setSelectedBanding(null);
        }}
        onOpenPreview={handleOpenPreview}
      />

      <ModalLampiranPreview
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        url={previewUrl}
      />
    </div>
  );
}
