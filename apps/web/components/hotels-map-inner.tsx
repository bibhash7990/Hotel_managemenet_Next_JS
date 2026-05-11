'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MarkerT = { id: string; lat: number; lng: number; label: string; href: string };

function FitBounds({ markers }: { markers: MarkerT[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      const m = markers[0]!;
      map.setView([m.lat, m.lng], 11);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12 });
  }, [map, markers]);
  return null;
}

export function HotelsMapInner({ markers }: { markers: MarkerT[] }) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  if (markers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground dark:border-slate-800">
        No map pins — add coordinates to hotels to see them on the map.
      </p>
    );
  }

  const center: [number, number] = [markers[0]!.lat, markers[0]!.lng];

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-border shadow-soft dark:border-slate-800">
      <MapContainer center={center} zoom={10} scrollWheelZoom className="h-full w-full" style={{ minHeight: 320 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers} />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <a href={m.href} className="font-medium text-primary underline-offset-2 hover:underline">
                {m.label}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
