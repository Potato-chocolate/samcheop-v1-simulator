/**
 * 한국 시도 GeoJSON 원본에서 서울특별시 + 경인(경기도+인천광역시) 권역 GeoJSON을 추출/단순화 생성.
 *
 * 입력: .omc/state/skorea-sido.json (southkorea-maps 원본, 17개 Sido)
 * 출력: client/src/data/regions.geojson (서울 + 경인 MultiPolygon 2개 feature)
 *
 * 단순화: Ramer-Douglas-Peucker (RDP) — 권역 판정용이므로 tolerance ~0.003도(~330m)로 적극 축소.
 *
 * 실행: node scripts/build_regions_geojson.mjs
 *
 * 라이선스: southkorea-maps (https://github.com/southkorea/southkorea-maps) — 출처 표기.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "C:/dev/samhaeopv1/.omc/state/skorea-sido.json";
const DST = "C:/dev/samhaeopv1/client/src/data/regions.geojson";
const TOLERANCE = 0.003; // degrees, ~330m at this latitude

/** Perpendicular distance from point p to line segment a-b */
function perpDistance(p, a, b) {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/** Ramer-Douglas-Peucker simplification on a ring (array of [lng,lat]) */
function rdp(points, epsilon) {
  if (points.length < 3) return points.slice();
  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }
  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, maxIdx + 1), epsilon);
    const right = rdp(points.slice(maxIdx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
}

function simplifyPolygon(coords, epsilon) {
  // coords = [outerRing, hole1, hole2, ...]; each ring = [[lng,lat], ...]
  return coords.map(ring => {
    const simplified = rdp(ring, epsilon);
    // Ensure ring closed
    if (
      simplified.length > 0 &&
      (simplified[0][0] !== simplified[simplified.length - 1][0] ||
        simplified[0][1] !== simplified[simplified.length - 1][1])
    ) {
      simplified.push(simplified[0]);
    }
    return simplified;
  });
}

function simplifyGeometry(geometry, epsilon) {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: simplifyPolygon(geometry.coordinates, epsilon) };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map(poly => simplifyPolygon(poly, epsilon)),
    };
  }
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function countVertices(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.reduce((acc, ring) => acc + ring.length, 0);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.reduce(
      (acc, poly) => acc + poly.reduce((a, r) => a + r.length, 0),
      0,
    );
  }
  return 0;
}

function asMultiPolygon(geometry) {
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  if (geometry.type === "Polygon") return [geometry.coordinates];
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

const raw = JSON.parse(readFileSync(SRC, "utf8"));
const byCode = Object.fromEntries(raw.features.map(f => [f.properties.code, f]));

const seoul = byCode["11"];
const incheon = byCode["23"];
const gyeonggi = byCode["31"];

if (!seoul || !incheon || !gyeonggi) {
  throw new Error("필수 Sido feature(서울/인천/경기) 누락");
}

const seoulSimplified = simplifyGeometry(seoul.geometry, TOLERANCE);
const incheonSimplified = simplifyGeometry(incheon.geometry, TOLERANCE);
const gyeonggiSimplified = simplifyGeometry(gyeonggi.geometry, TOLERANCE);

const output = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "seoul",
        name: "서울특별시",
        source: "southkorea-maps/kostat 2018",
        simplified: `RDP epsilon=${TOLERANCE}`,
      },
      geometry: seoulSimplified,
    },
    {
      type: "Feature",
      properties: {
        id: "gyeonggi",
        name: "경기도",
        source: "southkorea-maps/kostat 2018",
        simplified: `RDP epsilon=${TOLERANCE}`,
      },
      geometry: gyeonggiSimplified,
    },
    {
      type: "Feature",
      properties: {
        id: "incheon",
        name: "인천광역시",
        source: "southkorea-maps/kostat 2018",
        simplified: `RDP epsilon=${TOLERANCE}`,
      },
      geometry: incheonSimplified,
    },
  ],
};

const compactJson = JSON.stringify(output);
writeFileSync(DST, compactJson);

// Vite/vitest 친화 import용 .ts 모듈도 동시 출력 (단일 소스 of truth는 이 스크립트)
const DST_TS = "C:/dev/samhaeopv1/client/src/data/regions.ts";
const tsModule = `/* eslint-disable */
// 자동 생성 파일 — 직접 수정 금지. \`node scripts/build_regions_geojson.mjs\`로 재생성.
// 출처: https://github.com/southkorea/southkorea-maps (kostat 2018)
// 단순화: RDP epsilon=${TOLERANCE}

export type Region = "seoul" | "gyeonggi" | "incheon" | "outside";

export type RegionFeature = {
  type: "Feature";
  properties: {
    id: "seoul" | "gyeonggi" | "incheon";
    name: string;
    source: string;
    simplified: string;
  };
  geometry:
    | { type: "Polygon"; coordinates: number[][][] }
    | { type: "MultiPolygon"; coordinates: number[][][][] };
};

export type RegionsFeatureCollection = {
  type: "FeatureCollection";
  features: RegionFeature[];
};

export const REGIONS: RegionsFeatureCollection = ${compactJson};
`;
writeFileSync(DST_TS, tsModule);

const origSeoulV = countVertices(seoul.geometry);
const origIncheonV = countVertices(incheon.geometry);
const origGyeonggiV = countVertices(gyeonggi.geometry);
const newSeoulV = countVertices(seoulSimplified);
const newGyeonggiV = countVertices(gyeonggiSimplified);
const newIncheonV = countVertices(incheonSimplified);

console.log(
  `서울:   ${origSeoulV} → ${newSeoulV} vertices (${((1 - newSeoulV / origSeoulV) * 100).toFixed(1)}% 감소)`,
);
console.log(
  `경기도: ${origGyeonggiV} → ${newGyeonggiV} vertices (${((1 - newGyeonggiV / origGyeonggiV) * 100).toFixed(1)}% 감소)`,
);
console.log(
  `인천:   ${origIncheonV} → ${newIncheonV} vertices (${((1 - newIncheonV / origIncheonV) * 100).toFixed(1)}% 감소)`,
);
console.log(`산출 .geojson 크기: ${(compactJson.length / 1024).toFixed(1)} KB`);
console.log(`산출 .ts 크기: ${(tsModule.length / 1024).toFixed(1)} KB`);
console.log(`저장 경로: ${DST}`);
console.log(`저장 경로: ${DST_TS}`);
