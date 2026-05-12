import { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Store } from "@/data/stores";

export type NearbyMapProps = {
  stores: Store[];
  excludedStores?: Store[];
  selectedSite: { lat: number; lng: number } | null;
  highlightedStoreNames?: string[];
  onClick: (lat: number, lng: number) => void;
};

const SEOUL_CENTER: [number, number] = [37.5666, 126.9784];

const hasNoCoords = (stores: Store[]) =>
  stores.every(s => s.lat === null || s.lng === null);

export default function NearbyMap({
  stores,
  excludedStores = [],
  selectedSite,
  highlightedStoreNames = [],
  onClick,
}: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markersRef = useRef<LeafletNS.Marker[]>([]);
  const siteMarkerRef = useRef<LeafletNS.Marker | null>(null);
  const LRef = useRef<typeof LeafletNS | null>(null);
  const onClickRef = useRef(onClick);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // 지도 초기화 (Leaflet은 client 전용 — vitest node 환경 회피 위해 dynamic import)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const mod = await import("leaflet");
      const L = (mod.default ?? mod) as typeof LeafletNS;
      if (cancelled || !containerRef.current || mapRef.current) return;

      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: SEOUL_CENTER,
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>",
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
        onClickRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      setLeafletReady(true);

      cleanup = () => {
        map.remove();
        mapRef.current = null;
        LRef.current = null;
        markersRef.current = [];
        siteMarkerRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // 매장 핀 업데이트
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !leafletReady) return;

    const makeLetterIcon = (letter: string) =>
      L.divIcon({
        className: "",
        html: `<div class="nearby-pin nearby-pin--ranked"><span>${letter}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    const makeStoreIcon = () =>
      L.divIcon({
        className: "",
        html: `<div class="nearby-pin nearby-pin--store"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
    const makeExcludedIcon = () =>
      L.divIcon({
        className: "",
        html: `<div class="nearby-pin nearby-pin--excluded"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    highlightedStoreNames.forEach((name, idx) => {
      const store = stores.find(s => s.name === name);
      if (!store || store.lat === null || store.lng === null) return;
      const letter = String.fromCharCode(65 + idx);
      const marker = L.marker([store.lat, store.lng], {
        icon: makeLetterIcon(letter),
        zIndexOffset: 1000,
      }).addTo(map);
      marker.bindTooltip(`매장 ${letter}`, { direction: "top", offset: [0, -28] });
      markersRef.current.push(marker);
    });

    const highlightedSet = new Set(highlightedStoreNames);
    stores.forEach(store => {
      if (store.lat === null || store.lng === null) return;
      if (highlightedSet.has(store.name)) return;
      const marker = L.marker([store.lat, store.lng], {
        icon: makeStoreIcon(),
        zIndexOffset: 500,
      }).addTo(map);
      markersRef.current.push(marker);
    });

    excludedStores.forEach(store => {
      if (store.lat === null || store.lng === null) return;
      const marker = L.marker([store.lat, store.lng], {
        icon: makeExcludedIcon(),
        zIndexOffset: 100,
      }).addTo(map);
      markersRef.current.push(marker);
    });
  }, [stores, excludedStores, highlightedStoreNames, leafletReady]);

  // 사용자 클릭 핀 업데이트
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !leafletReady) return;

    if (siteMarkerRef.current) {
      siteMarkerRef.current.remove();
      siteMarkerRef.current = null;
    }

    if (selectedSite) {
      const siteIcon = L.divIcon({
        className: "",
        html: `<div class="nearby-pin nearby-pin--site"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([selectedSite.lat, selectedSite.lng], {
        icon: siteIcon,
        zIndexOffset: 2000,
      }).addTo(map);
      marker.bindTooltip("예정 점포 위치", {
        direction: "top",
        offset: [0, -12],
        permanent: false,
      });
      siteMarkerRef.current = marker;
    }
  }, [selectedSite, leafletReady]);

  const allNull = hasNoCoords([...stores, ...excludedStores]);

  return (
    <div className="nearby-map-wrapper">
      {allNull && (
        <div className="coord-pending-banner">
          매장 좌표가 아직 산출되지 않았습니다.{" "}
          <code>node scripts/geocode_stores.mjs</code> 를 실행한 뒤 매장 핀이 표시됩니다.
        </div>
      )}
      <div ref={containerRef} className="leaflet-map-container" />
    </div>
  );
}
