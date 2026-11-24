import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LaporanMapProps {
  coordinates: Array<{
    id: string;
    judul: string;
    latitude: number;
    longitude: number;
    status: string;
  }>;
  height?: string;
  center?: [number, number];
}

export function LaporanMap({ coordinates, height = '300px', center }: LaporanMapProps) {
  // Calculate center from coordinates or use provided center
  const mapCenter: LatLngExpression = useMemo(() => {
    if (center) return center;
    if (coordinates.length === 0) return [-6.225, 106.845]; // Jakarta default

    const avgLat = coordinates.reduce((sum, c) => sum + c.latitude, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, c) => sum + c.longitude, 0) / coordinates.length;
    return [avgLat, avgLng];
  }, [coordinates, center]);

  return (
    <div className="rounded-lg overflow-hidden border" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.map((coord) => (
          <Marker
            key={coord.id}
            position={[coord.latitude, coord.longitude]}
          >
            <Popup>
              <div className="p-1">
                <p className="font-medium text-sm">{coord.judul}</p>
                <p className="text-xs text-gray-500">{coord.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function LaporanMapPlaceholder({ height = '200px' }: { height?: string }) {
  return (
    <div
      className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">Peta lokasi tugas</p>
      </div>
    </div>
  );
}
