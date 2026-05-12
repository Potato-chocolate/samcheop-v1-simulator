import { describe, expect, it } from "vitest";
import type { Store } from "@/data/stores";
import {
  annualizedSales,
  calculateNearbyDisclosure,
  detectRegion,
  fmtKwon,
  haversineKm,
  wonToKwon,
} from "./nearby";

// ---------------------------------------------------------------------------
// 테스트용 매장 팩토리
// ---------------------------------------------------------------------------
function makeStore(overrides: Partial<Store> & { name: string }): Store {
  return {
    region: "서울",
    address: "서울시 테스트",
    contractDate: "2020-01-01",
    operatingDays2025: 300,
    sales2025: 100_000_000,
    lat: 37.5,
    lng: 127.0,
    isHall: false,
    isOperating: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Haversine 거리
// ---------------------------------------------------------------------------
describe("haversineKm", () => {
  it("동일 좌표는 0km", () => {
    expect(haversineKm({ lat: 37.5, lng: 127.0 }, { lat: 37.5, lng: 127.0 })).toBe(0);
  });

  it("서울-부산 거리 약 325km", () => {
    const dist = haversineKm(
      { lat: 37.5665, lng: 126.978 },
      { lat: 35.1796, lng: 129.0756 }
    );
    expect(dist).toBeGreaterThan(300);
    expect(dist).toBeLessThan(350);
  });
});

// ---------------------------------------------------------------------------
// 2. 권역 판정
// ---------------------------------------------------------------------------
describe("detectRegion", () => {
  it("광화문(서울) → seoul", () => {
    expect(detectRegion(37.5759, 126.9769)).toBe("seoul");
  });

  it("김포공항(서울 서쪽 끝) → seoul", () => {
    // 서울 서단 — 부천과 혼동되기 쉬운 경계 지점
    expect(detectRegion(37.5586, 126.7944)).toBe("seoul");
  });

  it("부천시청 → gyeonggi (서울이 아님)", () => {
    // 직전 bounding-box 근사가 서울로 잘못 분류했던 버그 회귀 방지.
    expect(detectRegion(37.5034, 126.766)).toBe("gyeonggi");
  });

  it("인천시청 → incheon", () => {
    expect(detectRegion(37.4561, 126.7052)).toBe("incheon");
  });

  it("일산호수공원(고양) → gyeonggi", () => {
    expect(detectRegion(37.6585, 126.7659)).toBe("gyeonggi");
  });

  it("수원역 → gyeonggi", () => {
    expect(detectRegion(37.2664, 127.0007)).toBe("gyeonggi");
  });

  it("부산역 → outside", () => {
    expect(detectRegion(35.1144, 129.0419)).toBe("outside");
  });
});

// ---------------------------------------------------------------------------
// 3. 환산매출
// ---------------------------------------------------------------------------
describe("annualizedSales", () => {
  it("운영일수 365일이면 매출 그대로", () => {
    expect(annualizedSales(100_000_000, 365)).toBe(100_000_000);
  });

  it("운영일수 0이면 0 반환", () => {
    expect(annualizedSales(100_000_000, 0)).toBe(0);
  });

  it("운영일수 200일이면 × 365/200", () => {
    const result = annualizedSales(200_000_000, 200);
    expect(result).toBeCloseTo(365_000_000, -3);
  });
});

// ---------------------------------------------------------------------------
// 4. 단위 변환
// ---------------------------------------------------------------------------
describe("wonToKwon / fmtKwon", () => {
  it("wonToKwon: 원 → 천원 반올림", () => {
    expect(wonToKwon(108_127_000)).toBe(108_127);
    expect(wonToKwon(136_132_500)).toBe(136_133); // 반올림
  });

  it("fmtKwon: 쉼표 포맷", () => {
    expect(fmtKwon(136_132)).toBe("136,132");
    expect(fmtKwon(80_122)).toBe("80,122");
  });
});

// ---------------------------------------------------------------------------
// 5. 정보공개서 예시값 회귀 테스트 (핵심)
//
// 환산매출(천원): [198721, 143587, 111533, 69261, 57242]
// → avg2to4 = (143587 + 111533 + 69261) / 3 = 108127 천원
// → max = 108127 × 1.259 = 136132 천원
// → min = 108127 × 0.741 = 80122 천원
// ---------------------------------------------------------------------------
describe("정보공개서 예시값 회귀", () => {
  // 환산매출이 정확히 예시값이 되도록 역산:
  // annualizedSales = sales / operatingDays * 365
  // operatingDays = 365 → annualizedSales = sales (원)
  // 예: 환산 198721천원 = 198_721_000원, operatingDays=365, sales=198_721_000
  const asOf = new Date("2026-01-01");
  const siteLat = 37.5665;
  const siteLng = 126.978;

  // 서울권역 5개 매장 (예시 환산매출 순서대로)
  const exampleStores: Store[] = [
    makeStore({
      name: "A점",
      sales2025: 198_721_000,
      operatingDays2025: 365,
      lat: 37.57,
      lng: 126.98,
      contractDate: "2020-01-01",
    }),
    makeStore({
      name: "B점",
      sales2025: 143_587_000,
      operatingDays2025: 365,
      lat: 37.58,
      lng: 126.99,
      contractDate: "2020-01-01",
    }),
    makeStore({
      name: "C점",
      sales2025: 111_533_000,
      operatingDays2025: 365,
      lat: 37.59,
      lng: 127.0,
      contractDate: "2020-01-01",
    }),
    makeStore({
      name: "D점",
      sales2025: 69_261_000,
      operatingDays2025: 365,
      lat: 37.6,
      lng: 127.01,
      contractDate: "2020-01-01",
    }),
    makeStore({
      name: "E점",
      sales2025: 57_242_000,
      operatingDays2025: 365,
      lat: 37.61,
      lng: 127.02,
      contractDate: "2020-01-01",
    }),
  ];

  it("rank1to5 환산매출이 예시값 내림차순과 일치한다 (천원 단위)", () => {
    const result = calculateNearbyDisclosure(siteLat, siteLng, asOf, exampleStores);
    const kwonValues = result.rank1to5.map(c => wonToKwon(c.annualizedSales));
    expect(kwonValues).toEqual([198_721, 143_587, 111_533, 69_261, 57_242]);
  });

  it("avg2to4 = 108127 천원 (±0.5천원 허용)", () => {
    const result = calculateNearbyDisclosure(siteLat, siteLng, asOf, exampleStores);
    expect(result.avg2to4).toBeGreaterThanOrEqual(108_127 - 1);
    expect(result.avg2to4).toBeLessThanOrEqual(108_127 + 1);
  });

  it("maxEstimate = 136132 천원 (±0.5천원 허용)", () => {
    const result = calculateNearbyDisclosure(siteLat, siteLng, asOf, exampleStores);
    expect(result.maxEstimate).toBeGreaterThanOrEqual(136_132 - 1);
    expect(result.maxEstimate).toBeLessThanOrEqual(136_132 + 1);
  });

  it("minEstimate = 80122 천원 (±0.5천원 허용)", () => {
    const result = calculateNearbyDisclosure(siteLat, siteLng, asOf, exampleStores);
    expect(result.minEstimate).toBeGreaterThanOrEqual(80_122 - 1);
    expect(result.minEstimate).toBeLessThanOrEqual(80_122 + 1);
  });

  it("shortageFlag = false (5개 정상)", () => {
    const result = calculateNearbyDisclosure(siteLat, siteLng, asOf, exampleStores);
    expect(result.shortageFlag).toBe(false);
    expect(result.excludedRanks).toEqual([1, 5]);
  });
});

// ---------------------------------------------------------------------------
// 6. 계약 1년 미만 제외
// ---------------------------------------------------------------------------
describe("계약 1년 미만 매장 제외", () => {
  it("최근 계약 매장은 candidates에 excluded=true, rank1to5에 없음", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      // 정상 4개
      makeStore({ name: "A점", lat: 37.57, lng: 126.98, contractDate: "2020-01-01" }),
      makeStore({ name: "B점", lat: 37.58, lng: 126.99, contractDate: "2020-01-01" }),
      makeStore({ name: "C점", lat: 37.59, lng: 127.0, contractDate: "2020-01-01" }),
      makeStore({ name: "D점", lat: 37.60, lng: 127.01, contractDate: "2020-01-01" }),
      // 계약 1년 미만 (2025-12-01 → asOf 2026-01-01 기준 31일)
      makeStore({ name: "신규점", lat: 37.56, lng: 126.97, contractDate: "2025-12-01" }),
    ];
    const result = calculateNearbyDisclosure(37.5665, 126.978, asOf, stores);

    const newStore = result.candidates.find(c => c.store.name === "신규점");
    expect(newStore?.excluded).toBe(true);
    expect(newStore?.excludeReason).toBe("contract-under-1-year");
    expect(result.rank1to5.some(c => c.store.name === "신규점")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. 운영일수 180일 미만 제외
// ---------------------------------------------------------------------------
describe("운영일수 180일 미만 매장 제외", () => {
  it("운영일수 < 180인 매장은 excluded=true, rank1to5에 없음", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      makeStore({ name: "A점", lat: 37.57, lng: 126.98, operatingDays2025: 300 }),
      makeStore({ name: "B점", lat: 37.58, lng: 126.99, operatingDays2025: 300 }),
      makeStore({ name: "C점", lat: 37.59, lng: 127.0, operatingDays2025: 300 }),
      makeStore({ name: "D점", lat: 37.60, lng: 127.01, operatingDays2025: 300 }),
      makeStore({ name: "단기점", lat: 37.56, lng: 126.97, operatingDays2025: 100 }),
    ];
    const result = calculateNearbyDisclosure(37.5665, 126.978, asOf, stores);

    const shortOp = result.candidates.find(c => c.store.name === "단기점");
    expect(shortOp?.excluded).toBe(true);
    expect(shortOp?.excludeReason).toBe("operating-under-180-days");
    expect(result.rank1to5.some(c => c.store.name === "단기점")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. shortageFlag (N < 5)
// ---------------------------------------------------------------------------
describe("shortageFlag", () => {
  it("권역 필터 후 3개이면 shortageFlag=true, 단순 평균 적용", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      makeStore({ name: "A점", sales2025: 120_000_000, operatingDays2025: 365, lat: 37.57, lng: 126.98 }),
      makeStore({ name: "B점", sales2025: 90_000_000, operatingDays2025: 365, lat: 37.58, lng: 126.99 }),
      makeStore({ name: "C점", sales2025: 60_000_000, operatingDays2025: 365, lat: 37.59, lng: 127.0 }),
    ];
    const result = calculateNearbyDisclosure(37.5665, 126.978, asOf, stores);

    expect(result.shortageFlag).toBe(true);
    expect(result.shortageCount).toBe(3);

    // 단순 평균 = (120000 + 90000 + 60000) / 3 = 90000 천원
    expect(result.avg2to4).toBe(90_000);
    expect(result.maxEstimate).toBe(Math.round(90_000 * 1.259));
    expect(result.minEstimate).toBe(Math.round(90_000 * 0.741));
  });

  it("매장 0개이면 shortageFlag=true, avg2to4=0", () => {
    const result = calculateNearbyDisclosure(37.5665, 126.978, new Date("2026-01-01"), []);
    expect(result.shortageFlag).toBe(true);
    expect(result.avg2to4).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. 거리 Top 5 선정
// ---------------------------------------------------------------------------
describe("거리 Top 5 선정", () => {
  it("필터 통과 10개 중 가까운 5개만 rank1to5에 포함", () => {
    const asOf = new Date("2026-01-01");
    // 서울 좌표로 10개 매장 생성, 거리 0.01도씩 증가
    const stores: Store[] = Array.from({ length: 10 }, (_, i) =>
      makeStore({
        name: `${i + 1}호점`,
        lat: 37.56 + i * 0.01,
        lng: 126.97,
        operatingDays2025: 300,
        sales2025: (10 - i) * 10_000_000, // 가까운 매장이 매출 더 높음
      })
    );

    const result = calculateNearbyDisclosure(37.5665, 126.978, asOf, stores);
    expect(result.rank1to5).toHaveLength(5);

    // rank1to5는 환산매출 내림차순 → 매출 높은 매장이 상위
    const ranks = result.rank1to5.map(c => c.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// 10. 권역 필터 — 다른 권역 매장 제외
// ---------------------------------------------------------------------------
describe("권역 필터", () => {
  it("서울 예정지는 경기 매장을 제외한다", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      makeStore({ name: "서울점", region: "서울", lat: 37.57, lng: 126.98 }),
      makeStore({ name: "경기점", region: "경기", lat: 37.27, lng: 127.0 }),
    ];
    // 서울 좌표(광화문)
    const result = calculateNearbyDisclosure(37.5759, 126.9769, asOf, stores);

    const gyeonggiStore = result.candidates.find(c => c.store.name === "경기점");
    expect(gyeonggiStore?.excluded).toBe(true);
    expect(gyeonggiStore?.excludeReason).toBe("different-region");
    expect(result.rank1to5.some(c => c.store.name === "경기점")).toBe(false);
  });

  it("경기 예정지(수원)는 서울/인천 매장을 제외하고 경기 매장만 포함한다", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      makeStore({ name: "서울점", region: "서울", lat: 37.57, lng: 126.98 }),
      makeStore({ name: "경기점", region: "경기", lat: 37.27, lng: 127.0 }),
      makeStore({ name: "인천점", region: "인천", lat: 37.5, lng: 126.7 }),
    ];
    // 수원역 좌표
    const result = calculateNearbyDisclosure(37.2664, 127.0007, asOf, stores);

    const seoulStore = result.candidates.find(c => c.store.name === "서울점");
    expect(seoulStore?.excluded).toBe(true);
    expect(seoulStore?.excludeReason).toBe("different-region");

    const incheonStore = result.candidates.find(c => c.store.name === "인천점");
    expect(incheonStore?.excluded).toBe(true);
    expect(incheonStore?.excludeReason).toBe("different-region");

    expect(result.rank1to5.some(c => c.store.name === "경기점")).toBe(true);
    expect(result.rank1to5.some(c => c.store.name === "인천점")).toBe(false);
  });

  it("인천 예정지는 서울/경기 매장을 제외하고 인천 매장만 포함한다", () => {
    const asOf = new Date("2026-01-01");
    const stores: Store[] = [
      makeStore({ name: "서울점", region: "서울", lat: 37.57, lng: 126.98 }),
      makeStore({ name: "경기점", region: "경기", lat: 37.27, lng: 127.0 }),
      makeStore({ name: "인천점", region: "인천", lat: 37.5, lng: 126.7 }),
    ];
    // 인천시청 좌표
    const result = calculateNearbyDisclosure(37.4561, 126.7052, asOf, stores);

    const seoulStore = result.candidates.find(c => c.store.name === "서울점");
    expect(seoulStore?.excluded).toBe(true);

    const gyeonggiStore = result.candidates.find(c => c.store.name === "경기점");
    expect(gyeonggiStore?.excluded).toBe(true);

    expect(result.rank1to5.some(c => c.store.name === "인천점")).toBe(true);
    expect(result.rank1to5.some(c => c.store.name === "경기점")).toBe(false);
  });
});
