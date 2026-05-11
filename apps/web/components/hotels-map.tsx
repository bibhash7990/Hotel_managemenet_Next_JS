'use client';

import dynamic from 'next/dynamic';

const Inner = dynamic(() => import('./hotels-map-inner').then((m) => m.HotelsMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-border bg-muted/20 text-sm text-muted-foreground dark:border-slate-800">
      Loading map…
    </div>
  ),
});

export type HotelMapMarker = { id: string; lat: number; lng: number; label: string; href: string };

export function HotelsMap({ markers }: { markers: HotelMapMarker[] }) {
  return <Inner markers={markers} />;
}
