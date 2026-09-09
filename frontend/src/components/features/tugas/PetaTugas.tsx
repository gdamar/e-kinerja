import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix default marker icon issue with webpack/vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PetaTugasProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: string;
}

export function PetaTugas({ latitude, longitude, title, height = '200px' }: PetaTugasProps) {
  const [isMounted, setIsMounted] = useState(false);
  const position: LatLngExpression = [latitude, longitude];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent SSR hydration mismatch
  if (!isMounted) {
    return (
      <div
        className="rounded-lg overflow-hidden border bg-muted animate-pulse"
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border" style={{ height }}>
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center p-1">
              {title && <p className="font-medium">{title}</p>}
              <p className="text-xs text-gray-500">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// Placeholder when no coordinates available
export function PetaTugasPlaceholder({ height = '200px' }: { height?: string }) {
  return (
    <div
      className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">Lokasi belum tersedia</p>
      </div>
    </div>
  );
}
