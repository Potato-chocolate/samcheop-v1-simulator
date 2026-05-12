#!/usr/bin/env node
/**
 * 빌드 타임 Geocoding 스크립트
 *
 * Provider:
 *   1) forge (기본): FORGE_API_URL/KEY 또는 BUILT_IN_FORGE_API_URL/KEY 환경변수 필요
 *   2) nominatim: OpenStreetMap 무료, 키 불필요, 1 req/sec 권장
 *
 * 실행:
 *   node scripts/geocode_stores.mjs                       # FORGE
 *   node scripts/geocode_stores.mjs --provider nominatim  # Nominatim
 *
 * 재실행 안전: lat/lng가 이미 있는 매장은 건너뜀
 * Nominatim 사용 약관: https://operations.osmfoundation.org/policies/nominatim/
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const providerIdx = args.indexOf("--provider");
const PROVIDER =
  providerIdx >= 0 && args[providerIdx + 1] ? args[providerIdx + 1] : "forge";

if (!["forge", "nominatim"].includes(PROVIDER)) {
  console.error(`오류: 지원하지 않는 provider "${PROVIDER}". forge | nominatim 중 선택.`);
  process.exit(1);
}

const FORGE_API_URL = process.env.FORGE_API_URL || process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.FORGE_API_KEY || process.env.BUILT_IN_FORGE_API_KEY;

if (PROVIDER === "forge" && (!FORGE_API_URL || !FORGE_API_KEY)) {
  console.error("오류: FORGE provider에 환경변수 필요");
  console.error("  FORGE_API_URL / FORGE_API_KEY");
  console.error("또는 BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY");
  console.error("");
  console.error("키가 없으면 무료 Nominatim 사용:");
  console.error("  node scripts/geocode_stores.mjs --provider nominatim");
  process.exit(1);
}

const STORES_PATH = join(__dirname, "../client/src/data/stores.ts");
const RATE_LIMIT_MS = PROVIDER === "nominatim" ? 1100 : 200;
const NOMINATIM_UA =
  "samcheop-v1-simulator/1.0 (https://github.com/Potato-chocolate/samcheop-v1-simulator)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeForge(address) {
  const baseUrl = FORGE_API_URL.replace(/\/+$/, "");
  const url = new URL(`${baseUrl}/v1/maps/proxy/maps/api/geocode/json`);
  url.searchParams.append("key", FORGE_API_KEY);
  url.searchParams.append("address", address);
  url.searchParams.append("language", "ko");
  url.searchParams.append("region", "kr");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.[0]) {
    return null;
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

/**
 * 한국 상세 주소를 Nominatim 친화 형태로 단계적으로 축약.
 * 단계 0: 원본
 * 단계 1: 첫 콤마 이후 + 괄호 안 제거 (도로명 + 번지)
 * 단계 2: "번길"·"길" 뒤의 번호도 제거 (도로명만)
 * 단계 3: 시/구까지 (예: "경기도 부천시 원미구")
 */
function buildNominatimVariants(address) {
  const v0 = address.trim();
  const v1 = v0
    .replace(/\([^)]*\)/g, "")
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
  const v2 = v1
    .replace(/(번길|로|길)\s*[\d\-]+.*$/, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const m = v0.match(/^([가-힣]+(?:특별시|광역시|특별자치시|특별자치도|도))\s+([가-힣]+시)?\s*([가-힣]+(?:구|군))?/);
  const v3 = m ? [m[1], m[2], m[3]].filter(Boolean).join(" ") : v1;
  const variants = [];
  for (const v of [v0, v1, v2, v3]) {
    if (v && !variants.includes(v)) variants.push(v);
  }
  return variants;
}

async function nominatimFetch(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.append("q", query);
  url.searchParams.append("format", "json");
  url.searchParams.append("limit", "1");
  url.searchParams.append("countrycodes", "kr");
  url.searchParams.append("accept-language", "ko");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": NOMINATIM_UA },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function geocodeNominatim(address) {
  const variants = buildNominatimVariants(address);
  for (let i = 0; i < variants.length; i++) {
    const q = variants[i];
    if (i > 0) await sleep(RATE_LIMIT_MS);
    try {
      const result = await nominatimFetch(q);
      if (result) {
        if (i > 0) process.stdout.write(`(simplified→ "${q}") `);
        return result;
      }
    } catch (err) {
      // 다음 변형 시도
    }
  }
  return null;
}

async function geocodeAddress(address) {
  return PROVIDER === "nominatim"
    ? geocodeNominatim(address)
    : geocodeForge(address);
}

function parseStores(content) {
  const storeRegex = /\{\s*name:\s*"([^"]+)"[^}]*address:\s*"([^"]+)"[^}]*lat:\s*(null|-?\d+\.\d+)[^}]*lng:\s*(null|-?\d+\.\d+)[^}]*\}/g;
  const stores = [];
  let match;
  while ((match = storeRegex.exec(content)) !== null) {
    stores.push({
      name: match[1],
      address: match[2],
      lat: match[3] === "null" ? null : parseFloat(match[3]),
      lng: match[4] === "null" ? null : parseFloat(match[4]),
      fullMatch: match[0],
      index: match.index,
    });
  }
  return stores;
}

async function main() {
  console.log("삼첩분식 매장 Geocoding 스크립트");
  console.log("Provider:", PROVIDER, "| Rate limit:", RATE_LIMIT_MS, "ms");
  console.log("=".repeat(50));

  const content = readFileSync(STORES_PATH, "utf-8");
  const stores = parseStores(content);
  console.log(`총 매장 수: ${stores.length}`);

  let updated = content;
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const store of stores) {
    if (store.lat !== null && store.lng !== null) {
      console.log(`  [SKIP] ${store.name} (이미 좌표 있음)`);
      skipCount++;
      continue;
    }

    console.log(`  [GEOCODE] ${store.name}: ${store.address}`);
    try {
      await sleep(RATE_LIMIT_MS);
      const result = await geocodeAddress(store.address);
      if (result) {
        const newEntry = store.fullMatch
          .replace(/lat:\s*null/, `lat: ${result.lat}`)
          .replace(/lng:\s*null/, `lng: ${result.lng}`);
        updated = updated.replace(store.fullMatch, newEntry);
        console.log(`    -> lat: ${result.lat}, lng: ${result.lng}`);
        successCount++;
      } else {
        console.warn(`    -> 결과 없음 (null 유지)`);
        failCount++;
      }
    } catch (err) {
      console.error(`    -> 오류: ${err.message}`);
      failCount++;
    }
  }

  writeFileSync(STORES_PATH, updated, "utf-8");
  console.log("");
  console.log("=".repeat(50));
  console.log(`완료: 성공 ${successCount}, 건너뜀 ${skipCount}, 실패 ${failCount}`);
  console.log(`stores.ts 업데이트됨: ${STORES_PATH}`);
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});