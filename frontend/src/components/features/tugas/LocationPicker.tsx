import { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, AlertCircle, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Icons for distinct differentiation
// Blue marker icon for Petugas (Current GPS)
const petugasMarkerIcon = L.divIcon({
  className: 'custom-petugas-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Red / Amber marker icon for Target Penugasan
const targetMarkerIcon = L.divIcon({
  className: 'custom-target-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path fill="#DC2626" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper component to auto-fit bounds when both positions exist
function MapBoundsUpdater({
  petugasPos,
  targetPos,
}: {
  petugasPos?: [number, number];
  targetPos?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (petugasPos && targetPos) {
      const bounds = L.latLngBounds([petugasPos, targetPos]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } else if (petugasPos) {
      map.setView(petugasPos, map.getZoom());
    } else if (targetPos) {
      map.setView(targetPos, map.getZoom());
    }
  }, [map, petugasPos, targetPos]);

  return null;
}

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  onLocationChange?: (lat: number, lng: number, accuracy: number) => void;
  readOnly?: boolean;
  showMap?: boolean;
  targetLocation?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  targetRadiusMeter?: number;
}

interface GeocodingResult {
  display_name: string;
  address?: {
    road?: string;
    neighborhood?: string;
    suburb?: string;
    city?: string;
    regency?: string;
    province?: string;
    country?: string;
  };
}

export function LocationPicker({
  latitude,
  longitude,
  accuracy,
  onLocationChange,
  readOnly = false,
  showMap = true,
  targetLocation,
  targetRadiusMeter,
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);

  const hasLocation = latitude !== undefined && longitude !== undefined;

    // Reverse geocode target location if provided
  useEffect(() => {
    if (!targetLocation?.latitude || !targetLocation?.longitude) {
      setTargetAddress(null);
      return;
    }
    const fetchTarget = async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLocation.latitude}&lon=${targetLocation.longitude}`
        );
        if (!resp.ok) throw new Error('Geocoding failed');
        const data: GeocodingResult = await resp.json();
        setTargetAddress(data.display_name);
      } catch (e) {
        console.error('Target reverse geocoding error:', e);
        setTargetAddress(null);
      }
    };
    const t = setTimeout(fetchTarget, 500);
    return () => clearTimeout(t);
  }, [targetLocation?.latitude, targetLocation?.longitude]);
  useEffect(() => {
    if (!hasLocation) {
      setAddress(null);
      return;
    }

    const fetchAddress = async () => {
      setGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        if (!response.ok) throw new Error('Geocoding failed');
        const data: GeocodingResult = await response.json();
        setAddress(data.display_name);
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setAddress(null);
      } finally {
        setGeocoding(false);
      }
    };

    // Debounce geocoding
    const timeout = setTimeout(fetchAddress, 500);
    return () => clearTimeout(timeout);
  }, [latitude, longitude, hasLocation]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak tersedia di browser ini');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        onLocationChange?.(lat, lng, acc);
        setLoading(false);
      },
      (err) => {
        setError(getErrorMessage(err.code));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Izin lokasi ditolak';
      case 2:
        return 'Lokasi tidak tersedia';
      case 3:
        return 'Waktu tunggu habis';
      default:
        return 'Gagal mendapatkan lokasi';
    }
  };

  useEffect(() => {
    // Auto-fetch location on mount if not set and not readOnly
    if (!readOnly && latitude === undefined && longitude === undefined) {
      getCurrentLocation();
    }
  }, []);

  const mapPosition: LatLngExpression = useMemo(
    () => [latitude ?? -6.2, longitude ?? 106.8],
    [latitude, longitude]
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Lokasi (GPS)</label>

      {/* GPS Info Card */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-md border bg-muted/50',
          error && 'border-status-error'
        )}
      >
        <MapPin className={cn('h-5 w-5 shrink-0', loading ? 'animate-pulse text-primary' : 'text-muted-foreground')} />

        <div className="flex-1 min-w-0">
          {hasLocation ? (
            <div className="text-sm">
              <p className="font-mono text-foreground">
                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </p>
              {accuracy !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Akurasi: ±{accuracy.toFixed(0)}m
                </p>
              )}
              {geocoding && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mendapatkan alamat...
                </p>
              )}
              {address && (
                <p className="sm:max-w-[400px]:w-[400px] text-xs text-muted-foreground mt-1 truncate" title={address}>
                  {address}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {error ? (
                <div className="flex items-center gap-1 text-status-error">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {loading ? 'Mendapatkan lokasi...' : 'Lokasi belum tersedia'}
                </span>
              )}
            </div>
          )}
        </div>

        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Map View */}
      {showMap && hasLocation && (
        <div className="rounded-lg overflow-hidden border h-[200px]">
          <MapContainer
            center={mapPosition}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            whenCreated={map => {
              map.getContainer().addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
            }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Fit bounds for both positions */}
            <MapBoundsUpdater
              petugasPos={hasLocation ? [latitude as number, longitude as number] : undefined}
              targetPos={targetLocation?.latitude != null && targetLocation?.longitude != null ? [targetLocation.latitude as number, targetLocation.longitude as number] : undefined}
            />
            {/* Petugas marker */}
            <Marker position={mapPosition} icon={petugasMarkerIcon}>
              <Popup>
                <div className="text-sm p-1 max-w-[250px]">
                  {address ? (
                    <p className="whitespace-normal">{address}</p>
                  ) : (
                    <p className="text-gray-500">
                      {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            {/* Target marker and radius */}
            {targetLocation?.latitude != null && targetLocation?.longitude != null && (
              <>
                <Marker
                  position={[targetLocation.latitude, targetLocation.longitude]}
                  icon={targetMarkerIcon}
                >
                  <Popup>
                    <div className="text-sm p-1 max-w-[250px]">
  {targetAddress ? (
    <p className="whitespace-normal">{targetAddress}</p>
  ) : (
    <p className="text-gray-500">Lokasi Penugasan</p>
  )}
</div>
                  </Popup>
                </Marker>
                {targetRadiusMeter && (
                  <Circle
                    center={[targetLocation.latitude, targetLocation.longitude]}
                    radius={targetRadiusMeter}
                    pathOptions={{ color: '#DC2626', fillOpacity: 0.1 }}
                  />
                )}
              </>
            )}
          </MapContainer>
        </div>
      )}

      {/* Placeholder when no map but has location */}
      {showMap && !hasLocation && !error && !loading && (
        <div className="rounded-lg border bg-muted/50 h-[100px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Map className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Dapatkan lokasi untuk melihat peta</p>
          </div>
        </div>
      )}

      {!readOnly && !hasLocation && !error && (
        <p className="text-xs text-muted-foreground">
          Tekan tombol refresh untuk mendapatkan lokasi GPS Anda
        </p>
      )}
    </div>
  );
}
