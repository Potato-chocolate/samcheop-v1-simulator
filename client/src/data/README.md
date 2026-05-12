# client/src/data — 매장 데이터 & 지리 파일

## 파일 목록

| 파일 | 설명 |
|------|------|
| `stores.ts` | 삼첩분식 수도권 매장 정적 데이터 (70개, 주소 없는 매장 제외). `lat/lng`는 Geocoding 산출. |
| `regions.geojson` | 서울/경인 권역 경계 GeoJSON. **자동 생성** (`build_regions_geojson.mjs`). |
| `regions.ts` | 위 GeoJSON을 typescript 모듈로 export. nearby.ts에서 import. **자동 생성, 직접 수정 금지.** |

---

## stores.ts 갱신 절차

1. `v1_extracted/v1_capital_area_stores.md`를 최신 Excel 데이터로 갱신
2. `stores.ts`에 매장 추가/수정 (스키마 유지). 새 매장은 `lat: null, lng: null`로 추가
3. Geocoding 스크립트 실행 (아래 참조)
4. 변경사항 git commit

---

## Geocoding 스크립트

`scripts/geocode_stores.mjs` — `lat/lng=null`인 매장의 주소를 좌표로 변환.

### Provider 선택

| Provider | 키 | 한국 친화도 | 비고 |
|----------|-----|-----------|------|
| `forge` (기본) | `FORGE_API_URL`, `FORGE_API_KEY` 환경변수 | 높음 (Google Maps) | Manus 사용자 |
| `nominatim` | 불필요 | 중간 (OpenStreetMap) | 4단계 주소 단축 fallback 내장 |

### 실행

```bash
# FORGE (기본, 키 필요)
node scripts/geocode_stores.mjs

# Nominatim (무료, 키 불필요)
node scripts/geocode_stores.mjs --provider nominatim
```

특성:
- 재실행 안전: `lat/lng`가 이미 있는 매장은 건너뜀
- Rate limit: FORGE 200ms, Nominatim 1100ms
- Nominatim은 한국 상세주소(호수·동수·건물명) 매칭률이 낮아 **4단계 변형 시도**:
  1. 원본 그대로
  2. 첫 콤마 이후 + 괄호 안 제거 (도로명+번지만)
  3. 번지 제거 (도로명만)
  4. 시/구까지 (광역 fallback)
- 결과는 `stores.ts`에 인플레이스 업데이트
- 완료 후 반드시 git commit

### 매칭 실패 매장 처리

Nominatim으로도 매칭 안 되는 소수 매장은:
- Kakao Local API 또는 VWorld API 키 발급 후 별도 lookup
- 또는 매장 정보 페이지(예: 카카오맵 검색)에서 좌표 직접 입력 → stores.ts 수동 수정

---

## regions.geojson / regions.ts 갱신 절차

자동 생성 파일. 원본 시도 GeoJSON에서 서울 + 경인(경기∪인천) 추출 후 RDP 단순화.

### 재생성

```bash
node scripts/build_regions_geojson.mjs
```

입력: `.omc/state/skorea-sido.json` (없으면 아래 다운로드 안내 참조)
출력: `client/src/data/regions.geojson` + `client/src/data/regions.ts`

### 원본 시도 GeoJSON 받기

```bash
curl -sL -o .omc/state/skorea-sido.json \
  https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json
```

출처: [southkorea-maps](https://github.com/southkorea/southkorea-maps) (kostat 2018, 17 시도). 라이선스: 공공데이터 개방 라이선스.

### 단순화 강도 조정

`build_regions_geojson.mjs`의 `TOLERANCE` 상수 (현재 0.003 ≈ 330m). 값을 줄이면 정확도↑·파일크기↑.

### 주의사항

- `properties.id`는 `"seoul"` / `"gyeongin"`으로 고정 — `lib/nearby.ts`가 의존
- 경기 + 인천은 단일 `gyeongin` MultiPolygon에 통합
- `regions.ts`의 `REGIONS` export 형태 변경 시 `lib/nearby.ts`의 `detectRegion` 동기화 필요
