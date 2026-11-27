import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Autocomplete, type AutocompleteOption } from '@/components/ui/autocomplete';
import L from 'leaflet';

// Fix Leaflet marker icons in bundle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface TaskLocationPickerProps {
  value: string;
  latitude?: number | null;
  longitude?: number | null;
  onChange: (location: { alamat: string; latitude: number; longitude: number }) => void;
  error?: string;
  disabled?: boolean;
}

// Helper component to pan/zoom map programmatically
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 1 });
  }, [center, map]);
  return null;
}

// Helper component to handle click on map
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function TaskLocationPicker({
  value,
  latitude,
  longitude,
  onChange,
  error,
  disabled = false,
}: TaskLocationPickerProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Default coordinate (Jakarta center if not set)
  const currentLat = latitude ?? -6.2;
  const currentLng = longitude ?? 106.8;
  const hasCoords = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null;

  const markerPosition: LatLngExpression = useMemo(
    () => [currentLat, currentLng],
    [currentLat, currentLng]
  );

  // Keep query input in sync when value changes externally (e.g. form reset)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Search address using Nominatim OpenStreetMap with debounced effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&countrycodes=id&limit=6&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              'Accept-Language': 'id',
            },
          }
        );
        if (res.ok) {
          const data: NominatimSearchResult[] = await res.json();
          setSuggestions(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Nominatim search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectSuggestion = (item: NominatimSearchResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setQuery(item.display_name);
    onChange({
      alamat: item.display_name,
      latitude: lat,
      longitude: lon,
    });
  };

  const suggestionOptions: AutocompleteOption<NominatimSearchResult>[] = useMemo(
    () =>
      suggestions.map((item) => ({
        value: String(item.place_id),
        label: item.display_name,
        data: item,
      })),
    [suggestions]
  );

  // Reverse geocode when clicking on map
  const handleMapClick = async (lat: number, lng: number) => {
    if (disabled) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res.ok) {
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setQuery(address);
        onChange({
          alamat: address,
          latitude: lat,
          longitude: lng,
        });
        return;
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }

    // Fallback if geocoding fails
    const fallbackText = query || `Titik Lokasi (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    onChange({
      alamat: fallbackText,
      latitude: lat,
      longitude: lng,
    });
  };

  // Use device current GPS
  const handleGetMyGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleMapClick(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Alamat & Lokasi Penugasan (Geotag)
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary"
          onClick={handleGetMyGPS}
          disabled={disabled}
        >
          <Navigation className="h-3 w-3 mr-1" />
          Gunakan Lokasi Saat Ini
        </Button>
      </div>

      {/* Search Input with Autocomplete Dropdown */}
      <Autocomplete<NominatimSearchResult>
        id="alamat"
        value={query}
        onValueChange={setQuery}
        options={suggestionOptions}
        shouldFilter={false}
        isLoading={isSearching}
        placeholder="Ketik alamat atau cari tempat (misal: Jl. Sudirman)..."
        error={error}
        disabled={disabled}
        itemClassName="flex items-start gap-2 px-3 py-2 text-xs"
        onSelect={(option) => {
          if (option.data) {
            handleSelectSuggestion(option.data);
          }
        }}
        renderOption={(option) => (
          <>
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{option.label}</span>
          </>
        )}
      />

      {/* Coordinate & Map Helper */}
      <div className="rounded-lg overflow-hidden border bg-muted/20 relative z-10">
        <div className="h-[220px] w-full relative">
          <MapContainer
            center={markerPosition}
            zoom={hasCoords ? 16 : 13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hasCoords && (
              <>
                <Marker
                  position={markerPosition}
                  draggable={!disabled}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      handleMapClick(position.lat, position.lng);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <p className="font-semibold text-primary">Titik Lokasi Tugas</p>
                      <p className="mt-0.5">{query || 'Lokasi terpilih'}</p>
                      <p className="text-muted-foreground mt-1 font-mono">
                        {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <MapController center={markerPosition} />
              </>
            )}
            <MapClickHandler onLocationSelect={handleMapClick} />
          </MapContainer>
        </div>

        {/* Selected Coordinates Footer */}
        <div className="p-2.5 bg-muted/40 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            {hasCoords ? (
              <span className="font-mono truncate">
                Koordinat: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
              </span>
            ) : (
              <span>Klik pada peta atau cari alamat untuk menentukan titik tugas</span>
            )}
          </div>
          <span className="text-[11px] shrink-0 text-muted-foreground italic">
            *Bisa diklik/geser langsung di peta
          </span>
        </div>
      </div>
    </div>
  );
}
