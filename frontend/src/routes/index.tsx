import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES, ROLE_CODES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RoleGate } from '@/components/shared/RoleGate';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TugasListPage = lazy(() => import('@/pages/TugasListPage'));
const TugasDetailPage = lazy(() => import('@/pages/TugasDetailPage'));
const TugasEditPage = lazy(() => import('@/pages/TugasEditPage'));
const TugasNewPage = lazy(() => import('@/pages/TugasNewPage'));
const LaporanPage = lazy(() => import('@/pages/LaporanPage'));
const CutiListPage = lazy(() => import('@/pages/CutiListPage'));
const CutiDetailPage = lazy(() => import('@/pages/CutiDetailPage'));
const CutiAjuanPage = lazy(() => import('@/pages/CutiAjuanPage'));
const CutiApprovalPage = lazy(() => import('@/pages/CutiApprovalPage'));
const PenilaianListPage = lazy(() => import('@/pages/PenilaianListPage'));
const PenilaianFormPage = lazy(() => import('@/pages/PenilaianFormPage'));
const PenilaianBandingPage = lazy(() => import('@/pages/PenilaianBandingPage'));
const PenilaianAjuBandingPage = lazy(() => import('@/pages/PenilaianAjuBandingPage'));
const PetugasListPage = lazy(() => import('@/pages/PetugasListPage'));
const PetugasFormPage = lazy(() => import('@/pages/PetugasFormPage'));
const PetugasDetailPage = lazy(() => import('@/pages/PetugasDetailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AkunListPage = lazy(() => import('@/pages/AkunListPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function createRouter() {
  return createBrowserRouter([
    {
      path: ROUTES.LOGIN,
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      ),
    },
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <Navigate to={ROUTES.DASHBOARD} replace />,
        },
        {
          path: ROUTES.DASHBOARD,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.TUGAS,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <TugasListPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.TUGAS_DETAIL,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <TugasDetailPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.TUGAS_EDIT,
          element: (
            <RoleGate roles={[ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <TugasEditPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.TUGAS_NEW,
          element: (
            <RoleGate roles={[ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <TugasNewPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.LAPORAN,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <LaporanPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.CUTI,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <CutiListPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.CUTI_DETAIL,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <CutiDetailPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.CUTI_AJUAN,
          element: (
            <RoleGate roles={[ROLE_CODES.PETUGAS]}>
              <Suspense fallback={<LoadingFallback />}>
                <CutiAjuanPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.CUTI_APPROVAL,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <CutiApprovalPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PENILAIAN,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PenilaianListPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.PENILAIAN_NEW,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PenilaianFormPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.PENILAIAN_EDIT,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PenilaianFormPage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.PENILAIAN_BANDING,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR]}>
              <Suspense fallback={<LoadingFallback />}>
                <PenilaianBandingPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PENILAIAN_AJU_BANDING,
          element: (
            <RoleGate roles={[ROLE_CODES.PETUGAS]}>
              <Suspense fallback={<LoadingFallback />}>
                <PenilaianAjuBandingPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PETUGAS,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <PetugasListPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PETUGAS_NEW,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <PetugasFormPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PETUGAS_EDIT,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <PetugasFormPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PETUGAS_DETAIL,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <PetugasDetailPage />
              </Suspense>
            </RoleGate>
          ),
        },
        {
          path: ROUTES.PROFILE,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          ),
        },
        {
          path: ROUTES.AKUN,
          element: (
            <RoleGate roles={[ROLE_CODES.OPERATOR, ROLE_CODES.KEPALA_SESI]}>
              <Suspense fallback={<LoadingFallback />}>
                <AkunListPage />
              </Suspense>
            </RoleGate>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.DASHBOARD} replace />,
    },
  ]);
}
