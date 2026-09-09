import { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, AlertCircle, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  onLocationChange?: (lat: number, lng: number, accuracy: number) => void;
  readOnly?: boolean;
  showMap?: boolean;
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
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const hasLocation = latitude !== undefined && longitude !== undefined;

  // Reverse geocode using Nominatim when location changes
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
                <p className="text-xs text-muted-foreground mt-1 truncate" title={address}>
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
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapPosition}>
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
