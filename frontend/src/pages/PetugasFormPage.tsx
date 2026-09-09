import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { useMasterPetugasById } from '@/hooks/useMasterPetugas';
import { useCreatePetugas, useUpdatePetugas } from '@/hooks/useMasterPetugasMutation';
import { ROUTES, ROLE_CODES } from '@/lib/constants';

// Map role name to role ID
const ROLE_NAME_TO_ID: Record<string, number> = {
  [ROLE_CODES.PETUGAS]: 1,
  [ROLE_CODES.OPERATOR]: 2,
  [ROLE_CODES.KEPALA_SESI]: 3,
};
import { supabase } from '@/lib/supabase';

const schema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  nama_phl: z.string().min(1, 'Nama wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P'], {
    required_error: 'Pilih jenis kelamin',
  }),
  alamat: z.string().optional(),
  no_telp: z.string().optional(),
  email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  role_id: z.string().min(1, 'Pilih role'),
  status_aktif: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function PetugasFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { toast } = useToast();
  const { data: existingPetugas, isLoading: isLoadingPetugas } = useMasterPetugasById(id || '');
  const createPetugas = useCreatePetugas();
  const updatePetugas = useUpdatePetugas();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nikError, setNikError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status_aktif: true,
    },
  });

  const selectedRole = watch('role_id');

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && existingPetugas) {
      reset({
        nik: existingPetugas.nik || '',
        nama_phl: existingPetugas.nama_phl || '',
        jenis_kelamin: existingPetugas.jenis_kelamin || ('L' as const),
        alamat: existingPetugas.alamat || '',
        no_telp: existingPetugas.no_telp || '',
        email: existingPetugas.email || '',
        role_id: String(existingPetugas.role_id || ''),
        status_aktif: existingPetugas.status_aktif ?? true,
      });
    }
  }, [isEditMode, existingPetugas, reset]);

  const validateUnique = async (field: 'nik' | 'email', value: string) => {
    if (!value) return true;

    let query = supabase
      .from('master_petugas')
      .select('id')
      .eq(field, value);

    // Exclude current record in edit mode
    if (isEditMode && id) {
      query = query.neq('id', id);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      return false;
    }
    return true;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setNikError(null);
    setEmailError(null);

    try {
      // Validate unique fields
      const isNikUnique = await validateUnique('nik', data.nik);
      const isEmailUnique = await validateUnique('email', data.email);

      if (!isNikUnique) {
        setNikError('NIK sudah digunakan oleh petugas lain');
        setIsSubmitting(false);
        return;
      }

      if (!isEmailUnique) {
        setEmailError('Email sudah digunakan oleh petugas lain');
        setIsSubmitting(false);
        return;
      }

      if (isEditMode && id) {
        await updatePetugas.mutateAsync({ id, data: { ...data, role_id: ROLE_NAME_TO_ID[data.role_id] } });
        toast({
          title: 'Berhasil',
          description: 'Data petugas berhasil diubah',
        });
      } else {
        await createPetugas.mutateAsync({ ...data, role_id: ROLE_NAME_TO_ID[data.role_id] });
        toast({
          title: 'Berhasil',
          description: 'Petugas baru berhasil ditambahkan',
        });
      }

      navigate(ROUTES.PETUGAS);
    } catch (err: any) {
      console.error('Error saving petugas:', err);
      toast({
        title: 'Gagal',
        description: err.message || 'Gagal menyimpan data petugas',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(ROUTES.PETUGAS)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <h1 className="text-xl font-semibold">
        {isEditMode ? 'Edit Petugas' : 'Tambah Petugas Baru'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Dasar</CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Mengubah data petugas yang sudah ada'
                : 'Lengkapi informasi dasar petugas'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIK */}
              <div className="space-y-2">
                <Label htmlFor="nik">
                  NIK <span className="text-status-error">*</span>
                </Label>
                <Input
                  id="nik"
                  placeholder="Masukkan NIK"
                  {...register('nik')}
                  className={errors.nik || nikError ? 'border-status-error' : ''}
                />
                {errors.nik && (
                  <p className="text-sm text-status-error">
                    {errors.nik.message}
                  </p>
                )}
                {nikError && (
                  <p className="text-sm text-status-error">{nikError}</p>
                )}
              </div>

              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="nama_phl">
                  Nama Lengkap <span className="text-status-error">*</span>
                </Label>
                <Input
                  id="nama_phl"
                  placeholder="Masukkan nama lengkap"
                  {...register('nama_phl')}
                  className={errors.nama_phl ? 'border-status-error' : ''}
                />
                {errors.nama_phl && (
                  <p className="text-sm text-status-error">
                    {errors.nama_phl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
              <Label>
                Jenis Kelamin <span className="text-status-error">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="L"
                    {...register('jenis_kelamin')}
                    className="w-4 h-4"
                  />
                  <span>Laki-laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="P"
                    {...register('jenis_kelamin')}
                    className="w-4 h-4"
                  />
                  <span>Perempuan</span>
                </label>
              </div>
              {errors.jenis_kelamin && (
                <p className="text-sm text-status-error">
                  {errors.jenis_kelamin.message}
                </p>
              )}
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                placeholder="Masukkan alamat lengkap"
                rows={3}
                {...register('alamat')}
              />
            </div>

            {/* No. Telp */}
            <div className="space-y-2">
              <Label htmlFor="no_telp">No. Telp</Label>
              <Input
                id="no_telp"
                placeholder="08xxxxxxxxxx"
                {...register('no_telp')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Mengubah informasi akun petugas'
                : 'Lengkapi informasi akun untuk login'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-status-error">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                {...register('email')}
                className={errors.email || emailError ? 'border-status-error' : ''}
              />
              {errors.email && (
                <p className="text-sm text-status-error">
                  {errors.email.message}
                </p>
              )}
              {emailError && (
                <p className="text-sm text-status-error">{emailError}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>
                Role <span className="text-status-error">*</span>
              </Label>
              <Select
                value={selectedRole || ''}
                onValueChange={(v) => setValue('role_id', v)}
              >
                <SelectTrigger
                  className={errors.role_id ? 'border-status-error' : ''}
                >
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLE_CODES.PETUGAS}>Petugas (PHL)</SelectItem>
                  <SelectItem value={ROLE_CODES.OPERATOR}>Operator</SelectItem>
                  <SelectItem value={ROLE_CODES.KEPALA_SESI}>Kepala Sesi</SelectItem>
                </SelectContent>
              </Select>
              {errors.role_id && (
                <p className="text-sm text-status-error">
                  {errors.role_id.message}
                </p>
              )}
            </div>

            {/* Status Aktif */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('status_aktif')}
                  className="w-4 h-4"
                />
                <span>Petugas aktif</span>
              </Label>
              <p className="text-xs text-muted-foreground pl-6">
                Nonaktifkan petugas untuk menonaktifkan akses login
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.PETUGAS)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            disabled={isSubmitting || isLoadingPetugas}
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Simpan Perubahan' : 'Tambah Petugas'}
          </Button>
        </div>
      </form>
    </div>
  );
}
