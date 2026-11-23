import { LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Informasi akun Anda"
      />

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Avatar size="xl">
              <AvatarFallback className="text-xl">
                {getInitials(profile?.nama_phl || 'U')}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>{profile?.nama_phl || 'User'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{profile?.role?.nama_role || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">NIK</p>
              <p className="font-medium">{profile?.nik || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">No. Telepon</p>
              <p className="font-medium">{profile?.no_telp || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Alamat</p>
              <p className="font-medium">{profile?.alamat || '-'}</p>
            </div>
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
