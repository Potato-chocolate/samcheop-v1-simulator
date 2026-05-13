# 삼첩분식 v1 상담 시뮬레이터

> **떡볶이의 새로운 기준**을 그대로 빌려온 — **창업 판단의 새로운 기준** 도구.
> 예비 점주와 상담사가 한 화면에서 **목표 매출 → 손익 → 개설비**까지 같이 펼쳐 보는 단일 페이지 시뮬레이터입니다.

🔗 **라이브 데모** · <https://potato-chocolate.github.io/samcheop-v1-simulator/>
📦 **스택** · React 19 + Vite + TypeScript / Express + tRPC (선택적) / Tailwind v4 + shadcn/ui
🧾 **계산 근거** · 26년 삼첩분식 v1 Excel 「목표매출 산정자료」를 풀스택 코드로 거울 이식

---

## 1. 이 도구는 무엇인가요? (비개발자용)

삼첩분식 본사·가맹 상담 현장에서 쓰던 **엑셀 손익 시뮬레이터**를 그대로 웹으로 옮긴 도구입니다.
상담 테이블 위에 펼쳐진 **삼첩분식 패키지 상담지**처럼 보이는 것이 1순위 목표예요.

상담 한 사이클은 **세 첩**으로 끝납니다.

| 순서 | 이름 | 무엇을 하나 | 입력 → 결과 |
|---|---|---|---|
| **1첩** | 인근매장 매출 조회 | 가맹사업법 시행령 §9-③ 양식대로 예상 매출 산정 | 주소 → 같은 권역(서울 / 경기 / 인천) 가장 가까운 5개 매장 → 1·5위 제외 → 2~4위 평균 × (1 ± 25.9%) = **예상 매출 최고/최저** |
| **2첩** | 목표 매출 입력 + 손익 | 6장의 매출 프리셋 카드로 시나리오 비교 | 월매출·임대료·인건비 → 식자재 40% · 공과금 2.2% · 푸드테크 22,000원 · 로열티 110,000원 · 13개 채널별 플랫폼 수수료 → **월 영업이익 + BEP** |
| **3첩** | 창업 비용 계산 | 면적·간판·테이블 옵션으로 개설비 견적 | 평수·간판타입·테이블수 → 가맹비·교육비·인테리어·설비 → **총 개설비 + 면제 항목 별도 표기** |

> 결과는 **상담 리포트 카드**로 묶여 한 페이지 HTML로 저장·공유됩니다(선택 백엔드).
> "**가맹 계약·견적·수익 보장의 근거가 아니라 상담용 추정**"이라는 면책은 모든 출력 화면에 노출됩니다.

---

## 2. 화면을 직접 보고 싶다면

> 정적 스크린샷 대신 **라이브 사이트**가 단일 진실 원천입니다.
> 디자인 리뷰·UX 검수도 항상 라이브 데모를 기준으로 합니다 (목업 PNG는 작업 중간 산출물이라 저장소에 포함하지 않습니다).

🔗 <https://potato-chocolate.github.io/samcheop-v1-simulator/>

- 데스크탑: 1첩 → 2첩 → 3첩 순서로 스크롤하면서 sticky 입력 패널의 동작을 확인
- 모바일: 폭 760px 이하로 줄여 카드/입력 단일 컬럼 적층, 터치 타깃 44px 보장 여부 확인
- 인쇄(⌘/Ctrl + P): "리포트 인쇄 모드"에서 그림자·장식 배경이 모두 제거되는지 확인

---

## 3. UX/UI 디자이너를 위한 디자인 시스템

> 전체 토큰·컴포넌트 정의는 [`DESIGN.md`](./DESIGN.md)에 시스템 단위로 정리되어 있고,
> 실제 구현 토큰은 [`client/src/index.css`](./client/src/index.css)에 CSS 변수로 박혀 있습니다.
> 아래는 **이 프로젝트가 다른 SaaS 대시보드와 어떻게 다른지** 한눈에 보기 위한 요약입니다.

### 3.1 Creative North Star

> **프리미엄 분식 패키지 상담지** — 금융 대시보드도, 음식 브랜드 랜딩도 아닌 그 사이.

- 화면의 기본 분위기는 **순백이 아니라 따뜻한 종이색(#fff8e8)**.
- 핵심 결과는 **영수증 패널 + dashed divider**로 보여준다 (그래프 카드가 아님).
- 버튼·프리셋은 **둥근 알약형 + 옐로우 offset shadow**로 누를 수 있는 스티커처럼 보인다.
- "**1첩 / 2첩 / 3첩**"이라는 브랜드 단위가 곧 정보 구조의 단위.

### 3.2 컬러 토큰

| 토큰 | HEX | 역할 | 사용 규칙 |
|---|---|---|---|
| `sam-red` | `#b91c1c` | 떡볶이 레드 — 메인 CTA / 활성 / 브랜드 마크 | **The Red Leads Rule** — 누르거나 믿고 봐야 할 곳에만. 장식 배경 금지. |
| `sam-red-deep` | `#7f1010` | 옐로우 위 텍스트, 링크, 공유 URL | 노랑 배경 위 가독성 보장용 |
| `sam-yellow` | `#f2b705` | 패키지 옐로우 — CTA 그림자, 활성 프리셋, 배지 | **The Yellow Tags Rule** — 스티커처럼 짧고 선명하게. 본문 배경 금지. |
| `sam-gold` | `#d99000` | 옐로우의 보조 강조 | 옐로우만으로 약할 때만 |
| `sam-cream` | `#fff4d9` | KPI 카드, 정보 박스 | 따뜻한 면 |
| `sam-paper` | `#fff8e8` | 전체 배경, 리포트 표면 | **The Paper First Rule** — 순백은 카드 내부에만 |
| `sam-ink` | `#251b16` | 금액, 표 헤더, 총계 반전 행 | 본문 기준 텍스트 |
| `sam-muted` | `#765d4b` | 캡션, 보조 설명 | 약식 안내 |

**채널 식별 컬러 (차트/목록 전용, 브랜드 CTA로 재사용 금지)**

| 채널 | HEX | 채널 | HEX |
|---|---|---|---|
| 배민원 | `#b91c1c` | 쿠팡이츠 | `#ef7d22` |
| 요기요 | `#7c3aed` | 배달의민족 | `#0891b2` |
| 지역배달 | `#2563eb` | 자사앱 | `#0f766e` |
| 홀/기타 | `#64748b` | … (총 13채널) | |

### 3.3 타이포그래피 스케일

- **Display Font** · Noto Sans KR (`weight 900`, 압축감 있는 한글 패키지 라벨)
- **Receipt Number** · Black Han Sans (개설비 총액·히어로 영수증 금액에만)
- **Body** · Noto Sans KR (`weight 650`, line-height 1.7, `word-break: keep-all`)

| 단계 | 크기 (clamp) | 굵기 | 용도 |
|---|---|---|---|
| Hero Display | `2.65 → 5.25rem` | 900 | 첫 화면 핵심 약속 |
| Section Headline | `2 → 4.25rem` | 900 | 1첩/2첩/3첩 섹션 제목 |
| Panel Title | `1.65rem` | 900 | 입력·결과·비용 패널 |
| Metric Number | `1.18 → 1.65rem` | 950 | KPI 금액/비율 |
| Receipt Total | `2.2 → 4.2rem` | Black Han Sans | 영수증 총액 |
| Body | `1rem` | 650 | 본문 (65~75자 폭) |
| Label | `0.76 → 0.88rem` | 900~950 | 입력 라벨·배지 |

> **The Label Confidence Rule** — 라벨은 약하게 쓰지 않는다. 상담 중 빠르게 훑는 화면이라 무게감으로 위계를 만든다.
> **The Korean First Rule** — `word-break: keep-all; text-wrap: balance;` 우선. 한국어 문장 단위가 깨지지 않게.

### 3.4 모서리·간격 토큰

| 토큰 | 값 | 토큰 | 값 |
|---|---|---|---|
| `rounded.pill` | `999px` | `spacing.xs` | `0.35rem` |
| `rounded.sm` | `0.8rem` | `spacing.sm` | `0.72rem` |
| `rounded.md` | `1rem` | `spacing.md` | `1rem` |
| `rounded.lg` | `1.35rem` | `spacing.lg` | `1.35rem` |
| `rounded.xl` | `1.6rem` | `spacing.xl` | `2rem` |
| | | `spacing.section` | `5rem` |

### 3.5 Elevation — 그림자 어휘

평평한 머티리얼/글래스가 아니라 **종이 카드와 스티커가 겹친 촉감**.

| 이름 | 값 | 어디에 |
|---|---|---|
| Tactile CTA | `6px 6px 0 var(--sam-yellow)` | 주 CTA에만 — 누를 수 있는 스티커 감각 |
| Preset Active | `4px 4px 0 var(--sam-red)` | 선택된 프리셋/토글 |
| Brand Mark | `5px 5px 0 var(--sam-yellow)` | 상단 브랜드 마크 |
| Panel Ambient | `0 24px 50px rgba(82,43,22,.08)` | 입력·결과·믹스·벤치마크 카드 |
| Hero Receipt | `0 24px 50px rgba(80,42,22,.12)` | 히어로 영수증 카드 |
| Modal | `0 30px 90px rgba(37,27,22,.24)` | 최상위 표면 (저장 리포트 모달) |

> **The Tactile Not Glossy Rule** — blur·glass·gradient 장식 대신 색 면 + offset shadow.
> **The Print Reset Rule** — 출력 화면에서는 그림자·장식 배경 전부 제거 (리포트 인쇄 모드 대응).

### 3.6 컴포넌트 카탈로그

| 컴포넌트 | 핵심 디테일 |
|---|---|
| **Primary Button** | `pill` · `#b91c1c` 배경 · 2px 잉크 테두리 · `6px 6px 0 #f2b705` 그림자 · hover `translateY(-3px)` |
| **Secondary Button** | 반투명 흰색 배경 · 옅은 잉크 테두리 · 차콜 텍스트 · 같은 pill |
| **Topbar** | sticky · `rgba(255,248,232,.84)` · 18px blur · hover 시 레드 배경 반전 |
| **Brand Lockup** | 레드 사각형 + 옐로우 글자 + 잉크 테두리 + 옐로우 offset shadow |
| **Hero** | 좌측 카피 / 우측 패키지 이미지 비대칭 그리드 · 옐로우 mark + 약간의 회전 (스티커 감각) |
| **Step Strip** | 1첩/2첩/3첩 카드가 히어로 하단에 살짝 겹쳐서 들어옴 · 레드 번호 배지 |
| **Control Panel** | sticky 입력 패널 · `<1100px`에서 sticky 해제 |
| **Result Panel** | 영수증 스타일 · dashed divider · **총계 행만 차콜 반전** |
| **Mix Card** | hand-built pill stacked bar (Recharts 미사용) · hover 시 brightness/saturate 미세 상승 |
| **Benchmark Card** | 레드 원형 랭킹 배지 · 모바일에서 max-height 해제 |
| **Inputs** | 하단 2px 선만 강조 · focus 시 하단 선만 레드 · glow 금지 |
| **Range / Toggle** | `accent-color: #b91c1c` · toggle 활성 시 옐로우 그림자 |
| **Modal** | `#fff8e8` 배경 · 차콜 잉크 42% + 8px blur backdrop |

### 3.7 인터랙션·모션

- **이동량** · hover/focus에서 `translateY(-1px ~ -3px)`만. 그 이상은 과함.
- **전환 시간** · `160 ~ 180ms`.
- **하이라이트** · gradient text 금지. 강조는 **솔리드 레드 + 옐로우 mark 배경 + 굵기·크기**로만.
- **모션의 역할** · 호버·포커스·선택·노출(reveal)만. 장식적 애니메이션 금지.

### 3.8 반응형 브레이크포인트

| 폭 | 변경 |
|---|---|
| `≤ 1100px` | 히어로·작업 그리드·인사이트 그리드·섹션 헤더를 1열로 / sticky 입력 패널 해제 |
| `≤ 760px` | topbar 세로 적층 · 카드/입력 split 1열 · 벤치마크 max-height 해제 |
| 터치 | 모든 인터랙티브 타깃 **최소 44px** |

### 3.9 Do / Don't (요약)

| ✅ Do | ❌ Don't |
|---|---|
| 종이색 + 차콜 텍스트 + 반투명 흰 카드 | 파란 그라데이션 / 글래스 카드 / AI풍 추상 장식 |
| `#b91c1c` 는 액션과 신뢰의 앵커에만 | 레드를 큰 비활성 영역 배경으로 |
| `#f2b705` 는 스티커처럼 짧고 선명 | 옐로우를 본문 바닥색으로 |
| 1첩/2첩/3첩 구조 유지 | 새로운 최상위 시각 언어(패키지/영수증/스티커/상담리포트 외) 추가 |
| 가정·단위·VAT·면제·BEP 로직을 화면에 평문 노출 | 가정을 툴팁에만 숨기기 |
| `fmtWon` / `fmtCompact` / `fmtPct` 재사용 | 통화 포맷 직접 구현 |
| dashed divider로 영수증 질감 | gradient text |
| **다크모드는 의도적으로 미지원** (밝은 상담 테이블 = 제품 장면) | 다크모드를 기본값으로 |

> 전체 규칙·근거·예시는 [`DESIGN.md`](./DESIGN.md) §6 참조.

---

## 4. 화면 정보 구조 (UX 와이어 흐름)

```
┌─ Topbar (sticky, blur)
│  └ 브랜드 마크 · 네비 (1첩 / 2첩 / 3첩 / 저장)
├─ Hero
│  ├ 좌: "삼첩분식 창업, 한 장으로 끝내는 손익 시뮬레이션"
│  └ 우: 히어로 영수증 카드 (대표 KPI 3종)
├─ Step Strip (1첩 · 2첩 · 3첩 라벨 카드, 히어로에 살짝 겹침)
│
├─ §1첩  인근매장 매출 조회
│  ├ 주소 입력 + 권역 자동 판정 칩 (서울 / 경기 / 인천)
│  ├ Leaflet 지도 (Top 5 핀 = 매장 A~E divIcon, 나머지 핀은 익명)
│  └ 정보공개서 표 (평균 / 최고 / 최저)  · shortageFlag(<5) 노출
│
├─ §2첩  목표 매출 입력 & 손익
│  ├ 6장 프리셋 카드 (현재값 / 평균 / 중앙값 / 상위 25% / 1첩 최고 / 1첩 최저)
│  ├ 좌측 sticky 인풋 (월매출·임대료·풀/파트타이머·운영모드)
│  ├ 우측 영수증형 P&L 카드
│  │     매출 ─ 식자재(40%) ─ 플랫폼 수수료 ─ 인건비 ─ 고정비 ─ 로열티 = 영업이익
│  ├ 채널 믹스 stacked bar (13채널, hand-built)
│  └ BEP (이진 탐색, 상한 ₩70,000,000)
│
├─ §3첩  창업 비용 계산
│  ├ 면적·간판·테이블·운영모드 입력
│  ├ 항목별 영수증 표 (가맹비·교육비·인테리어·설비…)
│  └ 면제 항목은 토글로 별도 노출
│
└─ Footer / 면책 / 저장된 리포트 카드 리스트
```

---

## 5. 기술 흐름 (개발자용 요약)

```bash
pnpm i
pnpm dev          # http://localhost:3000 (점유 시 3001~3019 자동 fallback)
pnpm test         # vitest (node 환경, jsdom 없음)
pnpm check        # tsc --noEmit
pnpm build        # Vite 클라이언트 + esbuild 서버 번들
```

- **프론트엔드만** 봐도 도구는 동작합니다 (정적 GitHub Pages 배포가 그 증거).
- 저장·공유·OAuth가 필요한 경우에만 Express + tRPC + MySQL이 켜집니다.
- 계산 상수는 모두 [`v1_excel_config_spec.md`](./v1_excel_config_spec.md)가 단일 진실 원천.
  상수 바꾸면 `node scripts/validate_simulator_config.mjs` 재실행해 `simulator_config_validation.json` 갱신.

자세한 아키텍처·테스트 규약·tRPC 라우터 등은 [`CLAUDE.md`](./CLAUDE.md) 참조.

---

## 6. 디렉토리 한눈에 보기

| 위치 | 안에 뭐가 있나 |
|---|---|
| `client/src/pages/Home.tsx` | **전체 제품 표면 한 파일.** 1첩/2첩/3첩 흐름·프리셋·계산 모두 여기. |
| `client/src/lib/nearby.ts` | 가맹사업법 §9-③ 인근매장 산식 (순수함수) |
| `client/src/components/NearbyMap.tsx` | Leaflet OSM 지도 — leaflet은 `useEffect` 안에서 dynamic import |
| `client/src/data/stores.ts` | 70개 매장 (좌표·계약일·운영일수·매출). 실명 노출 금지 → 화면은 `매장 A~E`로 익명화 |
| `client/src/index.css` | **디자인 토큰 / 컴포넌트 클래스 / 반응형 / 인쇄 스타일.** 디자이너가 가장 자주 열어볼 파일 |
| `DESIGN.md` | 위 §3 디자인 시스템의 풀 사양 (Named Rules, Do/Don't 포함) |
| `v1_excel_config_spec.md` | 모든 계산 상수의 출처 — Excel 셀 ↔ CONFIG 매핑 |
| `brand_*.md` | 브랜드 리서치 노트 (디자인 의사결정 근거) |

---

## 7. 면책

이 시뮬레이터는 가맹사업법 시행령 §9-③ 정보공개서 양식과 26년 v1 Excel 산정 자료를 충실히 옮긴 **상담 추정 도구**입니다.
실제 가맹 계약·견적·수익 보장의 근거가 아니며, 결과 수치는 상담 시점·계약 조건에 따라 달라질 수 있습니다.

---

## 8. 라이선스

MIT
