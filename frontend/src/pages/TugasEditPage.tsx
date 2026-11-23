import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUpdateTugas } from '@/hooks/useTugasMutation';
import { useTugasWithPetugas } from '@/hooks/useTugasWithPetugas';
import { usePetugasList } from '@/hooks/usePetugasList';
import { ROUTES } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const schema = z.object({
  judul_tugas: z.string().min(1, 'Judul wajib diisi'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  tanggal_tugas: z.string().min(1, 'Tanggal wajib diisi'),
});

type FormData = z.infer<typeof schema>;

interface PetugasOption {
  id: string;
  nama_phl: string;
  nik?: string;
}

export default function TugasEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateTugas = useUpdateTugas();
  const { data: tugasData, isLoading: isLoadingTugas } = useTugasWithPetugas(id!);
  const { data: petugasList } = usePetugasList();
  const { toast } = useToast();
  const [selectedPetugas, setSelectedPetugas] = useState<PetugasOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  // Reset form when tugas data is loaded
  useEffect(() => {
    if (tugasData) {
      reset({
        judul_tugas: tugasData.judul_tugas,
        alamat: tugasData.alamat,
        tanggal_tugas: tugasData.tanggal_tugas,
      });

      // Set selected petugas from junction table
      const allPetugasIds = tugasData.junctionPetugas;
      const selectedPetugasData = petugasList?.filter(p => allPetugasIds.includes(p.id)) || [];
      setSelectedPetugas(selectedPetugasData);
    }
  }, [tugasData, petugasList, reset]);

  const togglePetugas = (petugas: PetugasOption) => {
    setSelectedPetugas((prev) => {
      const exists = prev.find((p) => p.id === petugas.id);
      if (exists) {
        return prev.filter((p) => p.id !== petugas.id);
      }
      return [...prev, petugas];
    });
  };

  const removePetugas = (petugasId: string) => {
    setSelectedPetugas((prev) => prev.filter((p) => p.id !== petugasId));
  };

  const filteredPetugas = petugasList?.filter((p) =>
    p.nama_phl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormData) => {
    if (selectedPetugas.length === 0) {
      toast({
        title: 'Gagal',
        description: 'Pilih minimal satu petugas',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateTugas.mutateAsync({
        tugasId: id!,
        data: {
          ...data,
          id_petugas: selectedPetugas.map((p) => p.id),
        },
      });
      toast({
        title: 'Berhasil',
        description: 'Tugas berhasil diperbarui',
      });
      navigate(ROUTES.TUGAS);
    } catch (err) {
      console.error('Failed to update tugas:', err);
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui tugas. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingTugas) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!tugasData) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={() => navigate(ROUTES.TUGAS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card className="mt-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Tugas tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.TUGAS)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <h1 className="text-xl font-semibold">Edit Tugas</h1>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Petugas Multi-Select */}
            <div className="space-y-2">
              <Label>Petugas (Pilih satu atau lebih)</Label>

              {/* Selected Petugas as Badges */}
              {selectedPetugas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedPetugas.map((petugas) => (
                    <Badge key={petugas.id} variant="default" className="pl-2 pr-1 py-1">
                      <span className="mr-1">{petugas.nama_phl}</span>
                      <button
                        type="button"
                        onClick={() => removePetugas(petugas.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Multi-select Trigger Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between">
                    <span className="text-muted-foreground">
                      {selectedPetugas.length === 0
                        ? 'Pilih petugas'
                        : `${selectedPetugas.length} petugas dipilih`}
                    </span>
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Pilih Petugas</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Search Input */}
                    <Input
                      placeholder="Cari petugas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Petugas List */}
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {filteredPetugas?.map((petugas) => {
                        const isSelected = selectedPetugas.some((p) => p.id === petugas.id);
                        return (
                          <button
                            key={petugas.id}
                            type="button"
                            onClick={() => togglePetugas(petugas)}
                            className={cn(
                              'w-full flex items-center justify-between p-3 rounded-md text-left transition-colors',
                              'hover:bg-muted',
                              isSelected && 'bg-primary/10'
                            )}
                          >
                            <div>
                              <p className="font-medium">{petugas.nama_phl}</p>
                              {petugas.nik && (
                                <p className="text-sm text-muted-foreground">
                                  NIK: {petugas.nik}
                                </p>
                              )}
                            </div>
                            <div
                              className={cn(
                                'w-5 h-5 rounded border flex items-center justify-center',
                                isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Done Button */}
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Selesai ({selectedPetugas.length} dipilih)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {selectedPetugas.length === 0 && (
                <p className="text-sm text-status-error">Pilih minimal satu petugas</p>
              )}
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul_tugas">Judul Tugas</Label>
              <Input
                id="judul_tugas"
                placeholder="Contoh: Perbaikan Pipa Bocor"
                error={errors.judul_tugas?.message}
                {...register('judul_tugas')}
              />
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat / Lokasi</Label>
              <Input
                id="alamat"
                placeholder="Contoh: jalan Melati No. 5, RT 03"
                error={errors.alamat?.message}
                {...register('alamat')}
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal_tugas">Tanggal Tugas</Label>
              <Input
                id="tanggal_tugas"
                type="date"
                error={errors.tanggal_tugas?.message}
                {...register('tanggal_tugas')}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting || updateTugas.isPending}
              disabled={selectedPetugas.length === 0}
            >
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
