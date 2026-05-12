---
name: Samcheop V1 Simulator
description: 삼첩분식 프랜차이즈 상담을 위한 프리미엄 분식 패키지형 손익 시뮬레이터
colors:
  sam-red: "#b91c1c"
  sam-red-deep: "#7f1010"
  sam-yellow: "#f2b705"
  sam-gold: "#d99000"
  sam-cream: "#fff4d9"
  sam-paper: "#fff8e8"
  sam-ink: "#251b16"
  sam-muted: "#765d4b"
  channel-coupang: "#ef7d22"
  channel-yogiyo: "#7c3aed"
  channel-baemin: "#0891b2"
  channel-local: "#2563eb"
  channel-self: "#0f766e"
  channel-hall: "#64748b"
typography:
  display:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(2.65rem, 6.25vw, 5.25rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  section:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 4.25rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  receipt-number:
    fontFamily: "Black Han Sans, Noto Sans KR, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 4.2rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Noto Sans KR, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.7
  label:
    fontFamily: "Noto Sans KR, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 950
    lineHeight: 1.4
rounded:
  pill: "999px"
  sm: "0.8rem"
  md: "1rem"
  lg: "1.35rem"
  xl: "1.6rem"
spacing:
  xs: "0.35rem"
  sm: "0.72rem"
  md: "1rem"
  lg: "1.35rem"
  xl: "2rem"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.sam-red}"
    textColor: "{colors.sam-cream}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "3.25rem"
  button-secondary:
    backgroundColor: "#ffffff94"
    textColor: "{colors.sam-ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.15rem"
    height: "3.25rem"
  card-paper:
    backgroundColor: "#ffffffd1"
    textColor: "{colors.sam-ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(1rem, 2vw, 1.45rem)"
  metric-red:
    backgroundColor: "{colors.sam-red}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.85rem"
  metric-yellow:
    backgroundColor: "{colors.sam-yellow}"
    textColor: "{colors.sam-ink}"
    rounded: "{rounded.md}"
    padding: "0.85rem"
---

# Design System: Samcheop V1 Simulator

## 1. Overview

**Creative North Star: "프리미엄 분식 패키지 상담지"**

삼첩분식 v1 시뮬레이터는 일반 SaaS 계산기가 아니라, 상담 테이블 위에 펼쳐진 브랜드 패키지와 영수증 리포트처럼 보여야 한다. 화면은 떡볶이 레드, 패키지 옐로우, 크림색 종이, 차콜 잉크를 중심으로 구성하며, 예비 점주가 매출, 비용, 개설비를 즉시 비교하도록 돕는 실무형 도구다.

디자인은 삼첩분식의 "1첩, 2첩, 3첩" 언어를 UI 구조로 번역한다. 1첩은 인근 매장 기준, 2첩은 목표 매출과 손익, 3첩은 창업 비용이다. 정보 밀도는 높지만 영수증, 박스 라벨, 스티커, 메뉴 패키지의 촉감을 빌려 계산 화면을 브랜드답게 만든다.

이 시스템은 금융 대시보드처럼 차갑거나, 음식 브랜드 랜딩처럼 장식적이면 안 된다. 핵심은 상담사가 수치의 근거를 신뢰 있게 보여주면서도 삼첩분식의 밝고 경쾌한 패키지 감각을 잃지 않는 것이다.

**Key Characteristics:**

- 밝은 크림 종이 배경 위에 레드와 옐로우를 강하게 배치한다.
- 주요 계산 결과는 영수증 패널, 테이블, 바 차트, KPI 카드로 노출한다.
- 버튼과 프리셋은 둥근 알약형 또는 패키지 라벨형이다.
- 카드에는 2px 잉크 톤 테두리, 큰 반경, 낮고 넓은 그림자를 사용한다.
- 카피와 라벨은 한국어 기준으로 짧고 실무적이어야 한다.

## 2. Colors

팔레트는 떡볶이 소스 레드, 치즈와 튀김을 떠올리는 옐로우, 포장지 크림, 계산서 잉크색으로 구성한다.

### Primary

- **Tteokbokki Red** (`#b91c1c`): 기본 CTA, 활성 상태, 브랜드 마크, 랭킹 번호, 핵심 아이콘에 사용한다.
- **Deep Sauce Red** (`#7f1010`): 노란 강조 위 텍스트, 링크, 공유 URL, 진한 상태 표시에 사용한다.

### Secondary

- **Package Yellow** (`#f2b705`): 히어로 하이라이트, CTA 그림자, 활성 프리셋, 상태 배지에 사용한다.
- **Fried Gold** (`#d99000`): 옐로우보다 차분한 보조 강조가 필요할 때만 사용한다.

### Neutral

- **Receipt Cream** (`#fff4d9`): KPI 카드, 강조 배경, 정보 박스의 따뜻한 면으로 사용한다.
- **Paper Canvas** (`#fff8e8`): 전체 페이지 배경, 히어로 오버레이, 리포트 배경의 기준색이다.
- **Charcoal Ink** (`#251b16`): 금액, 표 헤더, 총계 바, 브랜드 로고 테두리의 기준 텍스트색이다.
- **Muted Soy Brown** (`#765d4b`): 보조 설명, 캡션, 라벨, 안내 문장에 사용한다.

### Data and Channel Colors

- **배민원** `#b91c1c`, **쿠팡이츠** `#ef7d22`, **요기요** `#7c3aed`, **배달의민족** `#0891b2`, **지역배달** `#2563eb`, **자사앱** `#0f766e`, **홀/기타** `#64748b` 계열을 사용한다.
- 채널 색은 차트와 목록의 식별 목적에만 사용한다. 브랜드 CTA나 섹션 장식으로 재사용하지 않는다.

### Named Rules

**The Red Leads Rule.** 레드는 사용자가 누르거나 믿고 봐야 하는 지점에만 쓴다. 장식용 레드 면적이 많아지면 계산 결과의 위계가 흐려진다.

**The Yellow Tags Rule.** 옐로우는 패키지 스티커처럼 짧고 선명하게 사용한다. 긴 본문 배경이나 넓은 표면에 옐로우를 깔지 않는다.

**The Paper First Rule.** 화면의 기본 분위기는 흰색이 아니라 따뜻한 종이색이다. 순백색은 카드 내부, 입력 필드, 리포트 표면처럼 가독성이 필요한 곳에 제한적으로 사용한다.

## 3. Typography

**Display Font:** Noto Sans KR, system-ui, sans-serif  
**Body Font:** Noto Sans KR, system-ui, -apple-system, BlinkMacSystemFont, sans-serif  
**Receipt Number Font:** Black Han Sans, Noto Sans KR, system-ui, sans-serif

**Character:** 굵고 압축감 있는 한글 타이포그래피로 패키지 라벨의 자신감을 만든다. 본문과 설명은 같은 산세리프 계열을 사용해 상담 도구의 신뢰성을 유지한다.

### Hierarchy

- **Hero Display** (`900`, `clamp(2.65rem, 6.25vw, 5.25rem)`, `1.08`): 첫 화면의 핵심 약속과 브랜드 메시지에 사용한다.
- **Section Headline** (`900`, `clamp(2rem, 4.2vw, 4.25rem)`, `0.96`): 1첩, 2첩, 3첩 섹션 제목에 사용한다.
- **Panel Title** (`900`, `1.65rem`, `1`): 입력 패널, 결과 패널, 비용 패널 제목에 사용한다.
- **Metric Number** (`950`, `clamp(1.18rem, 2vw, 1.65rem)`, `1`): KPI 카드의 금액과 비율에 사용한다.
- **Receipt Total** (`Black Han Sans`, `clamp(2.2rem, 5vw, 4.2rem)`, `1`): 개설비 총액과 히어로 영수증 금액에 사용한다.
- **Body** (`650`, `1rem`, `1.7`): 설명 문장과 안내 문구에 사용한다. 긴 문장은 65에서 75자 폭 안에 유지한다.
- **Label** (`900에서 950`, `0.76rem에서 0.88rem`): 입력 라벨, 캡션, 배지, 표 보조 텍스트에 사용한다.

### Named Rules

**The Label Confidence Rule.** 라벨과 버튼은 굵게 쓴다. 상담 중 빠르게 훑어야 하는 화면이므로 약한 라벨은 금지한다.

**The Korean First Rule.** 줄바꿈은 한국어 문장 단위가 깨지지 않도록 `word-break: keep-all`과 `text-wrap: balance`를 우선한다.

## 4. Elevation

이 시스템은 완전한 플랫 UI가 아니라, 종이 카드와 패키지가 겹친 듯한 낮고 넓은 그림자를 쓴다. 깊이는 그림자만으로 만들지 않고, 종이색 배경, 2px 잉크 테두리, dashed divider, 라벨형 배지를 함께 사용해 만든다.

### Shadow Vocabulary

- **Tactile CTA Shadow** (`6px 6px 0 var(--sam-yellow)`): 주 CTA에만 사용한다. 누를 수 있는 브랜드 스티커처럼 보여야 한다.
- **Preset Active Shadow** (`4px 4px 0 var(--sam-red)`): 선택된 프리셋과 토글에 사용한다.
- **Brand Mark Shadow** (`5px 5px 0 var(--sam-yellow)`): 상단 브랜드 마크의 고유 그림자다.
- **Panel Ambient Shadow** (`0 24px 50px rgba(82, 43, 22, 0.08)`): 입력, 결과, 믹스, 벤치마크 카드의 기본 그림자다.
- **Hero Receipt Shadow** (`0 24px 50px rgba(80, 42, 22, 0.12)`): 히어로 영수증 카드에 사용한다.
- **Modal Shadow** (`0 30px 90px rgba(37, 27, 22, 0.24)`): 저장 리포트 모달처럼 최상위 표면에만 사용한다.

### Named Rules

**The Tactile Not Glossy Rule.** 그림자는 종이와 스티커의 물성을 만드는 용도다. 유리처럼 반짝이는 글래스모피즘이나 과한 blur 장식으로 바꾸지 않는다.

**The Print Reset Rule.** 출력용 화면에서는 그림자와 장식 배경을 제거하고, 리포트의 숫자와 표만 남긴다.

## 5. Components

### Buttons

- **Shape:** 기본 CTA와 네비게이션은 pill radius (`999px`)를 사용한다.
- **Primary:** `#b91c1c` 배경, 크림 또는 흰색 텍스트, 2px 잉크 테두리, `6px 6px 0 #f2b705` 그림자를 사용한다.
- **Secondary:** 반투명 흰색 배경, 옅은 잉크 테두리, 차콜 텍스트를 사용한다.
- **Hover / Focus:** `translateY(-3px)` 또는 `translateY(-1px)` 정도의 짧은 이동만 허용한다. 전환 시간은 160에서 180ms다.
- **Disabled:** 불투명도를 낮추고 움직임을 제거한다.

### Topbar and Brand Lockup

- 상단 바는 sticky이며, `rgba(255, 248, 232, 0.84)` 배경과 18px blur를 쓴다.
- 브랜드 마크는 레드 사각형, 옐로우 글자, 잉크 테두리, 옐로우 offset shadow로 구성한다.
- 네비게이션 링크는 작은 pill로 유지하고, hover 시 레드 배경과 크림 텍스트로 반전한다.

### Hero

- 히어로는 우측 음식 패키지 이미지와 좌측 카피가 만나는 비대칭 그리드다.
- 배경 오버레이는 종이색에서 투명으로 흐르는 linear gradient를 사용해 텍스트 가독성을 확보한다.
- 핵심 단어는 옐로우 mark와 딥레드 텍스트로 처리하고, 약간의 회전으로 스티커 감각을 준다.
- 히어로 영수증은 반투명 흰색 카드, dashed divider, 큰 금액 타이포그래피로 구성한다.

### Step Strip

- 1첩, 2첩, 3첩 카드는 히어로 하단에 살짝 겹쳐 배치한다.
- 각 카드는 흰 종이 표면, 2px 잉크 계열 테두리, 낮은 그림자를 사용한다.
- 번호 배지는 레드 배경과 흰색 텍스트로 통일한다.

### Cards and Panels

- **Control Panel:** sticky 입력 패널이다. 1100px 이하에서는 sticky를 해제한다.
- **Result Panel:** receipt 스타일의 손익 계산서다. dashed divider와 총계 반전 행을 사용한다.
- **Mix Card:** 채널 stacked bar와 channel list를 함께 둔다.
- **Benchmark Card:** 랭킹 번호는 레드 원형 배지로 표시한다.
- **Image Card:** 음식 또는 상담 이미지를 좌측에 두고 우측에 설명을 배치한다.

### Inputs and Controls

- 입력 필드는 카드 내부에 배치하고, 텍스트 입력은 하단 2px 선으로 강조한다.
- focus 시 하단 선만 레드로 바꾼다. 과한 glow는 사용하지 않는다.
- range input은 `accent-color: #b91c1c`를 사용한다.
- toggle은 pill shape, 활성 상태는 레드 배경과 옐로우 그림자를 사용한다.
- checkbox는 레드 accent를 사용한다.

### Metrics

- metric card는 크림, 레드, 옐로우, 차콜 네 가지 톤만 사용한다.
- 금액은 굵고 촘촘하게 표시하며, 라벨은 작은 굵은 글씨와 낮은 opacity로 둔다.
- KPI 카드는 설명보다 숫자가 먼저 보이게 구성한다.

### Charts and Tables

- 채널 믹스는 Recharts가 아니라 hand-built stacked bar를 사용한다.
- bar track은 pill shape이며, segment hover는 brightness와 saturate만 살짝 올린다.
- 비용과 손익 표는 dashed divider로 영수증 질감을 유지한다.
- 총계 행은 차콜 배경과 흰색 텍스트로 강하게 반전한다.

### Modals and Saved Reports

- 저장 리포트 모달은 `#fff8e8` 배경, 2px 잉크 계열 테두리, 큰 shadow를 사용한다.
- backdrop은 차콜 잉크 42%와 8px blur를 쓴다.
- 저장 리포트 목록은 작은 종이 카드 리스트로 표시한다.

### Responsive Behavior

- 1100px 이하에서는 히어로, 작업 그리드, 인사이트 그리드, 섹션 헤더를 1열로 전환한다.
- 760px 이하에서는 topbar를 세로로 쌓고, 카드 그리드와 입력 split field를 1열로 전환한다.
- 모바일에서는 스크롤 가능한 벤치마크와 비용 테이블의 max-height를 해제해 자연 문서 흐름으로 보여준다.
- 터치 대상은 최소 44px 이상을 유지한다.

## 6. Do's and Don'ts

### Do:

- **Do** keep the screen warm and paper-like with `#fff8e8`, `#fff4d9`, translucent white cards, and charcoal text.
- **Do** use `#b91c1c` for primary actions, active states, and trusted calculation anchors.
- **Do** reserve `#f2b705` for sticker-like emphasis, hover shadows, selected presets, and short highlights.
- **Do** keep calculation sections structured as 1첩, 2첩, 3첩 when adding new content.
- **Do** expose assumptions, units, VAT status, waived fees, and BEP logic plainly.
- **Do** reuse `fmtWon`, `fmtCompact`, and `fmtPct` for monetary and percentage display.
- **Do** use dashed dividers inside receipt-like panels and tables.
- **Do** preserve print styles so consultation reports can become clean paper documents.
- **Do** keep user-facing copy in Korean and identifiers in English.
- **Do** prefer existing shadcn/ui primitives for dialogs, buttons, inputs, and feedback before adding bespoke controls.

### Don't:

- **Don't** turn the simulator into a generic SaaS dashboard with blue gradients, glass cards, or abstract AI-style decoration.
- **Don't** use dark mode as the default. The product scene is a bright consultation table, not a night operations console.
- **Don't** use gradient text. Highlight with solid red, yellow mark backgrounds, weight, and size.
- **Don't** introduce new colored side-stripe callouts. If a memo needs emphasis, use a full border, tinted background, icon, or label badge instead.
- **Don't** use red as a decorative background for large inactive areas. Red should mean action, brand anchor, or key result.
- **Don't** add new top-level visual languages outside the package, receipt, sticker, and consultation report metaphors.
- **Don't** rely on animation for delight. Motion should only communicate hover, focus, selection, or reveal.
- **Don't** hide numerical assumptions behind tooltips only. 상담 중 설명 가능한 위치에 직접 노출한다.
- **Don't** reformat fragile `Home.tsx` source strings casually. `Home.calculations.test.ts` asserts literal source snippets.

### Agent Prompt Guide

Use this when extending the UI:

> Build the Samcheop simulator as a premium Korean bunsik package consultation tool. Use chili red `#b91c1c`, package yellow `#f2b705`, receipt paper `#fff8e8`, cream `#fff4d9`, and charcoal ink `#251b16`. Keep the 1첩, 2첩, 3첩 structure, receipt-style result panels, tactile pill buttons, dashed dividers, and brand-specific Korean copy. The UI must feel like a trustworthy franchise counseling report wearing Samcheop packaging, not a generic SaaS dashboard.

### Source References

- `client/src/index.css`: global tokens, layout, component classes, responsive and print behavior.
- `client/src/pages/Home.tsx`: main simulator surface, 1첩/2첩/3첩 flow, channel colors, revenue and cost UI.
- `client/src/pages/SharedReport.tsx`: public report page and saved report presentation.
- `brand_identity_research.md`, `brand_research_samcheop.md`, `brand_visual_references.md`: brand rationale and visual direction.
- `visual_assets_manifest.md`: current generated image assets and usage rules.
