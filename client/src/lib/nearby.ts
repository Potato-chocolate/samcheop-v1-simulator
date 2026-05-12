/**
 * 가맹사업법 제9조 및 시행령 제9조 제3항 기반 인근매장 매출공개 산출 엔진.
 * 순수 함수 집합 — 외부 API 호출 없음, 상태 없음.
 */

// worker-data(T1)가 stores.ts를 완성하면 이 import가 실제 데이터를 가리킴.
// T1 완료 전에는 테스트 파일에서 직접 모킹된 배열을 주입.
import { STORES, type Store } from "@/data/stores";
import { REGIONS, type Region, type RegionFeature } from "@/data/regions";

export type { Store, Region };

// ---------------------------------------------------------------------------
// 1. Haversine 거리 (km)
// ---------------------------------------------------------------------------
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

// ---------------------------------------------------------------------------
// 2. 권역 판정 — 행정경계 GeoJSON point-in-polygon
//    `client/src/data/regions.ts` (자동 생성, 출처: southkorea-maps kostat 2018)
// ---------------------------------------------------------------------------

/** Ring(closed polygon outer or hole)에 대한 ray-casting 포함 여부 검사. */
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-20) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Polygon(outerRing + holes)에 점 포함 여부. */
function pointInPolygon(lng: number, lat: number, rings: number[][][]): boolean {
  if (rings.length === 0) return false;
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false; // hole 내부
  }
  return true;
}

/** Feature(Polygon | MultiPolygon)에 점 포함 여부. */
function pointInFeature(
  lng: number,
  lat: number,
  feature: RegionFeature
): boolean {
  const g = feature.geometry;
  if (g.type === "Polygon") {
    return pointInPolygon(lng, lat, g.coordinates);
  }
  // MultiPolygon
  for (const poly of g.coordinates) {
    if (pointInPolygon(lng, lat, poly)) return true;
  }
  return false;
}

/**
 * 좌표 기반 권역 판정 — 실 행정경계 polygon 사용.
 * 서울 → 경기도 → 인천 순으로 검사. 서울이 인천보다 큰 도시이므로 우선순위 큰 면적부터.
 */
export function detectRegion(lat: number, lng: number): Region {
  for (const feature of REGIONS.features) {
    if (pointInFeature(lng, lat, feature)) {
      return feature.properties.id;
    }
  }
  return "outside";
}

// ---------------------------------------------------------------------------
// 3. 환산매출 (원 단위)
// ---------------------------------------------------------------------------
export function annualizedSales(
  sales2025: number,
  operatingDays2025: number
): number {
  if (operatingDays2025 <= 0) return 0;
  return (sales2025 / operatingDays2025) * 365;
}

// ---------------------------------------------------------------------------
// 4. 단위 변환 유틸
// ---------------------------------------------------------------------------

/** 원 → 천원 (반올림) */
export function wonToKwon(won: number): number {
  return Math.round(won / 1000);
}

/** 천원 → 표시용 문자열 ("136,132") */
export function fmtKwon(kwon: number): string {
  return Math.round(kwon).toLocaleString("ko-KR");
}

// ---------------------------------------------------------------------------
// 5. 메인 타입 정의
// ---------------------------------------------------------------------------
export type DisclosureCandidate = {
  store: Store;
  distanceKm: number;
  annualizedSales: number; // 원 단위
  rank: number | null; // null = Top 5 밖
  excluded: boolean;
  excludeReason?:
    | "different-region"
    | "contract-under-1-year"
    | "operating-under-180-days"
    | "no-coordinates";
};

export type DisclosureResult = {
  siteLat: number;
  siteLng: number;
  region: Region;
  candidates: DisclosureCandidate[]; // 권역+1년+ 통과, 거리 오름차순
  rank1to5: DisclosureCandidate[]; // 환산매출 내림차순
  excludedRanks: [1, 5] | [];
  avg2to4: number; // 천원 단위
  maxEstimate: number; // 천원 단위
  minEstimate: number; // 천원 단위
  shortageFlag: boolean;
  shortageCount?: number;
};

// ---------------------------------------------------------------------------
// 6. 계약 경과일 계산
// ---------------------------------------------------------------------------
function daysSince(contractDate: string, asOf: Date): number {
  const contract = new Date(contractDate);
  return (asOf.getTime() - contract.getTime()) / (1000 * 60 * 60 * 24);
}

// ---------------------------------------------------------------------------
// 7. 메인 진입점
// ---------------------------------------------------------------------------
export function calculateNearbyDisclosure(
  siteLat: number,
  siteLng: number,
  asOf: Date = new Date(),
  storeList: Store[] = STORES
): DisclosureResult {
  const siteRegion = detectRegion(siteLat, siteLng);

  // 모든 매장을 순회하며 필터 + 거리 계산
  const allCandidates: DisclosureCandidate[] = storeList.map(store => {
    // 좌표 없음
    if (store.lat === null || store.lng === null) {
      return {
        store,
        distanceKm: Infinity,
        annualizedSales: 0,
        rank: null,
        excluded: true,
        excludeReason: "no-coordinates" as const,
      };
    }

    // 권역 판정 — Store.region 필드 기반 (좌표 재판정 불필요)
    const storeRegion = detectRegionFromStore(store);

    if (siteRegion === "outside" || storeRegion !== siteRegion) {
      return {
        store,
        distanceKm: haversineKm(
          { lat: siteLat, lng: siteLng },
          { lat: store.lat, lng: store.lng }
        ),
        annualizedSales: annualizedSales(store.sales2025, store.operatingDays2025),
        rank: null,
        excluded: true,
        excludeReason: "different-region" as const,
      };
    }

    // 계약 경과 1년(365일) 미만 제외
    const elapsed = daysSince(store.contractDate, asOf);
    if (elapsed < 365) {
      return {
        store,
        distanceKm: haversineKm(
          { lat: siteLat, lng: siteLng },
          { lat: store.lat, lng: store.lng }
        ),
        annualizedSales: annualizedSales(store.sales2025, store.operatingDays2025),
        rank: null,
        excluded: true,
        excludeReason: "contract-under-1-year" as const,
      };
    }

    // 운영일수 180일 미만 제외
    if (store.operatingDays2025 < 180) {
      return {
        store,
        distanceKm: haversineKm(
          { lat: siteLat, lng: siteLng },
          { lat: store.lat, lng: store.lng }
        ),
        annualizedSales: annualizedSales(store.sales2025, store.operatingDays2025),
        rank: null,
        excluded: true,
        excludeReason: "operating-under-180-days" as const,
      };
    }

    return {
      store,
      distanceKm: haversineKm(
        { lat: siteLat, lng: siteLng },
        { lat: store.lat, lng: store.lng }
      ),
      annualizedSales: annualizedSales(store.sales2025, store.operatingDays2025),
      rank: null,
      excluded: false,
    };
  });

  // 필터 통과 매장 → 거리 오름차순 → Top 5
  const passed = allCandidates
    .filter(c => !c.excluded)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const top5 = passed.slice(0, 5);

  // 나머지(Top5 밖)는 candidates에만 포함
  const top5Stores = new Set(top5.map(c => c.store));
  const excluded = allCandidates.filter(
    c => c.excluded || !top5Stores.has(c.store)
  );

  // rank1to5: 환산매출 내림차순 + rank 번호 할당
  const rank1to5 = [...top5]
    .sort((a, b) => b.annualizedSales - a.annualizedSales)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  const shortageFlag = rank1to5.length < 5;

  let avg2to4Kwon: number;

  if (shortageFlag) {
    // N < 5: 단순 평균
    const total = rank1to5.reduce((sum, c) => sum + c.annualizedSales, 0);
    avg2to4Kwon = wonToKwon(rank1to5.length > 0 ? total / rank1to5.length : 0);
  } else {
    // 정상: 2~4위 평균 (rank1to5는 이미 내림차순 정렬)
    const r2 = rank1to5[1].annualizedSales;
    const r3 = rank1to5[2].annualizedSales;
    const r4 = rank1to5[3].annualizedSales;
    avg2to4Kwon = wonToKwon((r2 + r3 + r4) / 3);
  }

  const maxEstimate = Math.round(avg2to4Kwon * 1.259);
  const minEstimate = Math.round(avg2to4Kwon * 0.741);

  // candidates: 필터 통과 매장(거리 오름차순) + 제외 매장
  const candidates: DisclosureCandidate[] = [
    ...passed.map(c => {
      const ranked = rank1to5.find(r => r.store === c.store);
      return ranked ?? c;
    }),
    ...excluded,
  ];

  return {
    siteLat,
    siteLng,
    region: siteRegion,
    candidates,
    rank1to5,
    excludedRanks: shortageFlag ? [] : [1, 5],
    avg2to4: avg2to4Kwon,
    maxEstimate,
    minEstimate,
    shortageFlag,
    shortageCount: shortageFlag ? rank1to5.length : undefined,
  };
}

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/** Store.region("서울"|"경기"|"인천") → Region(seoul/gyeonggi/incheon) */
function detectRegionFromStore(store: Store): Region {
  if (store.region === "서울") return "seoul";
  if (store.region === "경기") return "gyeonggi";
  if (store.region === "인천") return "incheon";
  return "outside";
}
