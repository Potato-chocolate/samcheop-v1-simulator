/*
 * Design philosophy: Premium Bunsik Package Collage for Samcheop franchise counseling.
 * This page uses a 1-cheop / 2-cheop / 3-cheop consultation flow, chili-red and package-yellow accents,
 * receipt-style result panels, tactile paper cards, and asymmetric food-packaging imagery.
 * Every interaction should reinforce a franchise counseling tool that feels practical, appetizing, and brand-specific.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Flame,
  MapPin,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import NearbyMap from "@/components/NearbyMap";
import {
  calculateNearbyDisclosure,
  fmtKwon,
  type DisclosureResult,
} from "@/lib/nearby";

const ASSETS = {
  hero:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030875989/dbwWDyPEKvXkiZVreDb4hM/samcheop_v1_hero_collage-AdzgAgVZoBwcKp9kga5y6X.webp",
  pattern:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030875989/dbwWDyPEKvXkiZVreDb4hM/samcheop_v1_receipt_pattern-aMR346NbTqjnGPmQHjMjfu.webp",
  consulting:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030875989/dbwWDyPEKvXkiZVreDb4hM/samcheop_v1_consulting_scene-UsFJDuDKMznvvc44jAhZUP.webp",
  food:
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663030875989/dbwWDyPEKvXkiZVreDb4hM/samcheop_v1_food_package_closeup-HTp6z9tGgngTnS86c6Yv9G.webp",
};

const STORE_STATS = {
  validStores: 71,
  average: 18779225,
  median: 16745233,
  p25: 12776680,
  p75: 21668924,
  p90: 31597574,
  max: 38954521,
  hallAverage: 24084318,
  deliveryAverage: 17600315,
};

export const CHANNELS = [
  { group: "배달", name: "배민원", ratio: 0.4112, kind: "baeminOne", color: "#b91c1c" },
  { group: "배달", name: "쿠팡이츠", ratio: 0.3516, kind: "coupang", color: "#ef7d22" },
  { group: "배달", name: "요기요", ratio: 0.075, kind: "yogiyo", color: "#7c3aed" },
  { group: "배달", name: "배달의민족", ratio: 0.063, kind: "baemin", color: "#0891b2" },
  { group: "배달", name: "지역배달", ratio: 0.032, kind: "local", color: "#2563eb" },
  { group: "배달", name: "자사앱", ratio: 0.0243, kind: "self", color: "#0f766e" },
  { group: "포장", name: "배민 포장", ratio: 0.0123, kind: "pickupBaemin", color: "#eab308" },
  { group: "포장", name: "지역 포장", ratio: 0.0115, kind: "pickupLocal", color: "#f59e0b" },
  { group: "포장", name: "홀 포장", ratio: 0.0082, kind: "hallPickup", color: "#84cc16" },
  { group: "포장", name: "요기요 포장", ratio: 0.0074, kind: "pickupYogiyo", color: "#a3e635" },
  { group: "포장", name: "쿠팡 포장", ratio: 0.0025, kind: "pickupCoupang", color: "#facc15" },
  { group: "홀", name: "카드매출", ratio: 0.0005, kind: "hallCard", color: "#64748b" },
  { group: "홀", name: "현금매출", ratio: 0.0005, kind: "cash", color: "#94a3b8" },
];

// TODO: 전국 데이터 입수 시 실제 값으로 교체 (현재 수도권 평균으로 임시 대체)
const NATIONAL_MONTHLY_AVG = STORE_STATS.average;

type SignType = "flex" | "channel";
type StoreMode = "delivery" | "hybrid";

type RevenueInputs = {
  monthlySales: number;
  avgOrder: number;
  rent: number;
  fullTime: number;
  partTime: number;
  mode: StoreMode;
};

type CostInputs = {
  area: number;
  signType: SignType;
  tableCount: number;
  mode: StoreMode;
  showWaivedFees: boolean;
};

const DEFAULT_REVENUE: RevenueInputs = {
  monthlySales: 32344100,
  avgOrder: 20000,
  rent: 500000,
  fullTime: 0,
  partTime: 2.5,
  mode: "hybrid",
};

const DEFAULT_COST: CostInputs = {
  area: 12,
  signType: "flex",
  tableCount: 6,
  mode: "hybrid",
  showWaivedFees: true,
};

const fmtWon = (value: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  );
const fmtCompact = (value: number) => `${Math.round((value || 0) / 10000).toLocaleString("ko-KR")}만원`;
const fmtPct = (value: number) => `${(value * 100).toFixed(1)}%`;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const formatInputValue = (value: number) => {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value)
    ? value.toLocaleString("ko-KR")
    : value.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
};
const parseFormattedNumber = (value: string) => {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

// 수수료 산식 출처: v1_excel_config_spec.md §3 (26년 매출분석시트 「목표매출 산정자료」 F37~F47)
// - 배달의민족: 가게배달이라 퀵비(16.5%) + 중개·결제(VAT 별도) + 주문당 배달비(VAT 별도)
// - 배민원/쿠팡이츠/요기요: 중개·결제 + 주문당 배달비, 모두 VAT 별도(×1.1)
// - 포장 채널: Excel 원본에서 별도 수수료 없음 — 0원
// - 카드매출: 0.005% 정액
function calculatePlatformFee(monthlySales: number, avgOrder: number) {
  const orderPrice = Math.max(avgOrder, 1);
  const details = CHANNELS.map((channel) => {
    const sales = monthlySales * channel.ratio;
    const orders = sales / orderPrice;
    let fee = 0;
    if (channel.kind === "baemin")
      fee = sales * 0.165 + sales * (0.068 + 0.03) * 1.1 + orders * 4000 * 1.1;
    if (channel.kind === "baeminOne")
      fee = sales * (0.078 + 0.03) * 1.1 + orders * 3400 * 1.1;
    if (channel.kind === "yogiyo")
      fee = sales * (0.085 + 0.03) * 1.1 + orders * 4000 * 1.1;
    if (channel.kind === "coupang")
      fee = sales * (0.078 + 0.03) * 1.1 + orders * 3400 * 1.1;
    if (channel.kind === "local" || channel.kind === "self") fee = sales * 0.165;
    if (channel.kind === "hallCard") fee = sales * 0.00005;
    return { ...channel, sales, orders, fee };
  });
  const quickManagementFee = monthlySales > 0 ? 100000 : 0;
  const total = details.reduce((acc, item) => acc + item.fee, 0) + quickManagementFee;
  return { details, quickManagementFee, total };
}

export function calculateRevenue(inputs: RevenueInputs) {
  const monthlySales = Math.max(0, inputs.monthlySales);
  const logistics = monthlySales * 0.4;
  const platform = calculatePlatformFee(monthlySales, inputs.avgOrder);
  const fullTimeLabor = inputs.fullTime * 2500000 * 1.105;
  const partTimeLabor = inputs.partTime * 3 * 5 * 4.35 * 10030 * 1.2 * 1.105;
  const labor = fullTimeLabor + partTimeLabor;
  const utilities = Math.round(monthlySales * 0.022);
  const foodtech = 22000;
  const fixed = utilities + inputs.rent + foodtech;
  const royalty = 110000;
  const totalCost = logistics + platform.total + labor + fixed + royalty;
  const profit = monthlySales - totalCost;
  const margin = monthlySales > 0 ? profit / monthlySales : 0;
  const dailySales = monthlySales / 30.4;
  const monthlyOrders = monthlySales / Math.max(inputs.avgOrder, 1);

  const profitAt = (sales: number) => {
    const salesPlatform = calculatePlatformFee(sales, inputs.avgOrder);
    const salesLogistics = sales * 0.4;
    const salesFixed = inputs.rent + foodtech + sales * 0.022;
    return sales - salesLogistics - salesPlatform.total - labor - salesFixed - royalty;
  };

  let low = 0;
  let high = 70000000;
  for (let i = 0; i < 36; i += 1) {
    const mid = (low + high) / 2;
    if (profitAt(mid) >= 0) high = mid;
    else low = mid;
  }

  return {
    monthlySales,
    logistics,
    ingredients: monthlySales * 0.36,
    packaging: monthlySales * 0.04,
    platform,
    fullTimeLabor,
    partTimeLabor,
    labor,
    utilities,
    fixed,
    royalty,
    totalCost,
    profit,
    margin,
    dailySales,
    monthlyOrders,
    bepSales: high,
  };
}

function calculateOpeningCost(inputs: CostInputs) {
  const area = Math.max(0, inputs.area);
  const headquartersGross = 2200000 + 1100000 + 300000 * area + 1000000;
  const headquartersDiscount = inputs.showWaivedFees ? headquartersGross : 0;
  const headquartersNet = headquartersGross - headquartersDiscount;
  const interior = area * 1000000;
  const sign = inputs.signType === "flex" ? 700000 : 2000000;
  const internalSigns = 1000000;
  const kitchen = 8000000;
  const utensils = 2100000;
  const seats = inputs.tableCount * 2;
  const hallFurniture = inputs.mode === "hybrid" ? inputs.tableCount * 199650 + seats * 21536 : 0;
  const hallOperatingItems =
    inputs.mode === "hybrid"
      ? inputs.tableCount * 3 * 2750 +
        inputs.tableCount * 1210 +
        inputs.tableCount * 2 * 3850 +
        inputs.tableCount * 1.5 * 4950 +
        inputs.tableCount * 5500 +
        inputs.tableCount * 40955 +
        inputs.tableCount * 1.5 * 10900 +
        inputs.tableCount * 2.5 * 1935 +
        inputs.tableCount * 8247
      : 0;
  const gross = headquartersGross + interior + sign + internalSigns + kitchen + utensils + hallFurniture + hallOperatingItems;
  const net = headquartersNet + interior + sign + internalSigns + kitchen + utensils + hallFurniture + hallOperatingItems;
  const vatGuide = net * 0.1;
  return {
    area,
    headquartersGross,
    headquartersDiscount,
    headquartersNet,
    interior,
    sign,
    internalSigns,
    kitchen,
    utensils,
    hallFurniture,
    hallOperatingItems,
    gross,
    net,
    vatGuide,
    grandTotalWithVatGuide: net + vatGuide,
    seats,
  };
}

function MetricCard({ label, value, sub, tone = "cream" }: { label: string; value: string; sub: string; tone?: "cream" | "red" | "yellow" | "dark" }) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{sub}</span>
    </div>
  );
}

function Field({
  label,
  suffix,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field-card">
      <span className="field-card__label">{label}</span>
      <div className="field-card__input-row">
        <input
          type="text"
          inputMode="decimal"
          value={formatInputValue(value)}
          aria-label={`${label} 직접 입력`}
          onChange={(event) => onChange(parseFormattedNumber(event.target.value))}
        />
        {suffix && <em>{suffix}</em>}
      </div>
      <input
        aria-label={`${label} 슬라이더`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="section-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const [revenueInputs, setRevenueInputs] = useState<RevenueInputs>(DEFAULT_REVENUE);
  const [costInputs, setCostInputs] = useState<CostInputs>(DEFAULT_COST);
  const [nearbyResult, setNearbyResult] = useState<DisclosureResult | null>(null);
  const [siteCoords, setSiteCoords] = useState<{ lat: number; lng: number } | null>(null);
  const revenue = useMemo(() => calculateRevenue(revenueInputs), [revenueInputs]);
  const opening = useMemo(() => calculateOpeningCost(costInputs), [costInputs]);

  const handleMapClick = (lat: number, lng: number) => {
    setSiteCoords({ lat, lng });
    setNearbyResult(calculateNearbyDisclosure(lat, lng));
  };
  const revenueCostItems = [
    { label: "식자재", value: revenue.ingredients, color: "#b91c1c" },
    { label: "포장재", value: revenue.packaging, color: "#f2b705" },
    { label: "플랫폼·배달", value: revenue.platform.total, color: "#ef7d22" },
    { label: "인건비", value: revenue.labor, color: "#1f2937" },
    { label: "고정비", value: revenue.fixed, color: "#64748b" },
    { label: "로열티", value: revenue.royalty, color: "#9333ea" },
  ];
  const biggestCost = Math.max(...revenueCostItems.map((item) => item.value), 1);
  const totalMix = CHANNELS.reduce((acc, item) => acc + item.ratio, 0);

  const presets = useMemo(
    () => [
      { id: "national", label: "전국 평균", caption: "25년 가맹점 월매출", value: NATIONAL_MONTHLY_AVG, disabled: false },
      { id: "metro-avg", label: "수도권 평균", caption: "25년 가맹점 월매출", value: STORE_STATS.average, disabled: false },
      { id: "metro-p25", label: "수도권 상위 25%", caption: "월매출 기준", value: STORE_STATS.p75, disabled: false },
      { id: "metro-p10", label: "수도권 상위 10%", caption: "월매출 기준", value: STORE_STATS.p90, disabled: false },
      {
        id: "nearby-max",
        label: "인근 매장 평균 최고액",
        caption: nearbyResult ? "1첩 산출값" : "1첩 먼저 진행하세요",
        value: nearbyResult ? Math.round((nearbyResult.maxEstimate * 1000) / 12) : 0,
        disabled: !nearbyResult,
      },
      {
        id: "nearby-min",
        label: "인근 매장 평균 최저액",
        caption: nearbyResult ? "1첩 산출값" : "1첩 먼저 진행하세요",
        value: nearbyResult ? Math.round((nearbyResult.minEstimate * 1000) / 12) : 0,
        disabled: !nearbyResult,
      },
    ],
    [nearbyResult],
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="삼첩분식 창업 상담 시뮬레이터 홈">
          <span className="brand-mark">3</span>
          <span>
            <b>삼첩분식 상담 계산기</b>
            <small>Franchise Counseling</small>
          </span>
        </a>
        <nav>
          <a href="#nearby">인근매장 조회</a>
          <a href="#revenue">목표 매출</a>
          <a href="#cost">창업 비용</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,248,232,.98) 0%, rgba(255,248,232,.94) 44%, rgba(255,248,232,.58) 63%, rgba(255,248,232,.18) 100%), url(${ASSETS.hero})` }}>
          <div className="hero-content">
            <span className="eyebrow-chip"><Flame size={16} /> 삼첩분식 예비 창업자용</span>
            <h1>
              매출과 개설비용을 <mark>1·2·3첩</mark>처럼 펼쳐보는 삼첩분식 가맹 계산기
            </h1>
            <p>
              삼첩분식의 목표매출 산정식, 수도권 매장 매출 통계, 예상 개설비용 항목을 바탕으로 손익과 투자비를 한눈에 확인하실 수 있도록 구성했습니다.
            </p>
            <div className="hero-actions step-cta-row">
              <a href="#nearby" className="step-cta step-cta--1">
                <span className="step-cta__no">1첩</span>
                <span className="step-cta__title">인근매장 매출 조회</span>
                <ArrowRight size={16} />
              </a>
              <a href="#revenue" className="step-cta step-cta--2">
                <span className="step-cta__no">2첩</span>
                <span className="step-cta__title">목표 매출 입력</span>
                <ArrowRight size={16} />
              </a>
              <a href="#cost" className="step-cta step-cta--3">
                <span className="step-cta__no">3첩</span>
                <span className="step-cta__title">창업 비용 계산</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="hero-receipt" aria-label="핵심 통계 요약">
            <span>수도권 자료 기준</span>
            <strong>{STORE_STATS.validStores}개 매장</strong>
            <div>
              <p>월평균 환산</p>
              <b>{fmtCompact(STORE_STATS.average)}</b>
            </div>
            <div>
              <p>상위 10%</p>
              <b>{fmtCompact(STORE_STATS.p90)}</b>
            </div>
          </div>
        </section>

        <section className="three-cheop-strip" aria-label="시뮬레이션 단계">
          {[
            { no: "1첩", title: "인근매장 매출 조회", text: "지도에서 가맹 예정지를 클릭하면 같은 권역 인근 5개 매장의 평균 매출과 예상 매출 범위(±25.9%)를 산출합니다." },
            { no: "2첩", title: "목표 매출 입력", text: "수도권 매장 통계와 채널 믹스를 참고해 목표 월매출과 손익 구조를 계산합니다." },
            { no: "3첩", title: "창업 비용 계산", text: "평수·간판·홀 테이블 수에 따라 초기 투자비와 프로모션 차감액을 비교합니다." },
          ].map((item) => (
            <article key={item.no}>
              <span>{item.no}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>


        <section id="nearby" className="workspace-section nearby-section">
          <div className="nearby-disclaimer-banner">
            본 화면은 공식 정보공개서가 아닌 상담용 참고 자료입니다.
          </div>

          <SectionHeader
            eyebrow="01 · 인근매장 매출 조회"
            title="가맹사업법 정보공개서 양식의 인근 가맹점 매출 범위"
            description="지도에서 후보 점포 위치를 클릭하면 가맹사업법 제9조에 따라 인근 매장 매출 범위를 산출합니다."
          />

          <div className="workspace-grid">
            <aside className="control-panel">
              <div className="panel-title">
                <MapPin size={20} />
                <div>
                  <h3>1첩 · 가맹 예정지 입력</h3>
                  <p>지도를 클릭해 후보 점포 위치를 지정하세요.</p>
                </div>
              </div>

              <NearbyMap
                stores={
                  nearbyResult
                    ? nearbyResult.candidates.filter(c => !c.excluded).map(c => c.store)
                    : []
                }
                excludedStores={
                  nearbyResult
                    ? nearbyResult.candidates.filter(c => c.excluded).map(c => c.store)
                    : []
                }
                selectedSite={siteCoords}
                highlightedStoreNames={
                  nearbyResult ? nearbyResult.rank1to5.map(c => c.store.name) : []
                }
                onClick={handleMapClick}
              />

              {siteCoords && nearbyResult && (
                <p className="region-indicator">
                  {nearbyResult.region === "seoul"
                    ? "서울 권역"
                    : nearbyResult.region === "gyeonggi"
                      ? "경기 권역"
                      : nearbyResult.region === "incheon"
                        ? "인천 권역"
                        : "수도권 외 지역"}
                </p>
              )}
              {!siteCoords && (
                <p className="region-indicator region-indicator--placeholder">
                  지도를 클릭하면 권역이 자동 판정됩니다
                </p>
              )}
            </aside>

            <section className="result-panel receipt-panel">
              <div className="panel-title panel-title--between">
                <div>
                  <span className="tiny-label">1첩 · 정보공개서 양식</span>
                  <h3>예상 매출액의 범위</h3>
                </div>
                <ReceiptText size={28} />
              </div>

              {!nearbyResult ? (
                <div className="nearby-empty-state">
                  <MapPin size={36} />
                  <p>지도에서 위치를 선택하세요</p>
                  <span>클릭한 위치 기준으로 인근 매장 매출 범위를 계산합니다.</span>
                </div>
              ) : nearbyResult.region === "outside" ? (
                <div className="nearby-empty-state">
                  <MapPin size={36} />
                  <p>수도권 외 지역입니다</p>
                  <span>현재 데이터는 서울·경기·인천 권역만 지원합니다.</span>
                </div>
              ) : (
                <>
                  <div className="legal-kpi">
                    <div className="kpi-row">
                      <span>최고액</span>
                      <b>{fmtKwon(nearbyResult.maxEstimate)} 천원 (VAT 포함)</b>
                    </div>
                    <div className="kpi-row kpi-row--min">
                      <span>최저액</span>
                      <b>{fmtKwon(nearbyResult.minEstimate)} 천원 (VAT 포함)</b>
                    </div>
                  </div>

                  {nearbyResult.rank1to5.length > 0 ? (
                    <table className="disclosure-table">
                      <thead>
                        <tr>
                          <th>매출액 순위</th>
                          <th>가맹점명</th>
                          <th>직전 사업연도 매출 환산액</th>
                          <th>비고</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nearbyResult.rank1to5.map((c, i) => (
                          <tr
                            key={c.store.name}
                            className={
                              !nearbyResult.shortageFlag && (i === 0 || i === nearbyResult.rank1to5.length - 1)
                                ? "excluded-row"
                                : ""
                            }
                          >
                            <td>{i + 1}</td>
                            <td>매장 {String.fromCharCode(65 + i)}</td>
                            <td>{fmtKwon(Math.round(c.annualizedSales / 1000))} 천원 (VAT 포함)</td>
                            <td>
                              {!nearbyResult.shortageFlag && (i === 0 || i === nearbyResult.rank1to5.length - 1)
                                ? "제외"
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="shortage-warning">
                      해당 권역에 조건 충족 매장이 없습니다. 매장 좌표 산출 후 다시 시도하세요.
                    </div>
                  )}

                  <p className="disclosure-rationale">
                    당사에서 예상한 귀하의 점포 예정지 매출액의 범위는 위 표의 5개 가맹점 중
                    가장 작은 가맹점과 가장 큰 가맹점을 제외한 나머지 3개 가맹점을 기준으로
                    평균 매출액에 (±25.9%)를 곱하여 산출한 것입니다.
                    가맹사업거래의 공정화에 관한 법률 제9조 제5항 및 같은 법 시행령 제9조 제3항의
                    규정에 따르면 예상매출액의 최고액은 최저액의 1.7배를 초과하지 않도록 되어 있으며,
                    이 규정에 따른 최대 비율은 (±25.9%)입니다.
                  </p>

                  {nearbyResult.shortageFlag && (
                    <div className="shortage-warning">
                      해당 권역의 조건 충족 매장이{" "}
                      {nearbyResult.shortageCount ?? nearbyResult.rank1to5.length}개뿐이므로
                      가맹사업법 권장 산식(2~4위 평균)이 아닌 단순 평균으로 산출되었습니다.
                    </div>
                  )}

                  <p className="disclaimer">
                    예상매출액은 기존 가맹점사업자의 매출액을 근거로 작성된 것으로 가맹희망자가
                    운영할 가맹점의 매출액은 상권변화, 고객변화, 가맹점사업자의 노력차이 등 기타
                    환경변화에 따라 변동될 수 있으며, 가맹본부가 가맹희망자에게 예상매출액을
                    보장하는 것이 아닙니다.
                  </p>

                  <button
                    type="button"
                    className="primary-cta"
                    onClick={() => {
                      document.getElementById("revenue")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    이 권역으로 2첩 시작 <ArrowRight size={18} />
                  </button>
                </>
              )}
            </section>
          </div>
        </section>

        <section id="revenue" className="workspace-section revenue-section">
          <SectionHeader
            eyebrow="02 · 목표 매출 입력"
            title="목표 월매출을 입력하면 손익 구조가 즉시 계산됩니다"
            description="1첩에서 확인하신 인근매장 참고 매출을 바탕으로 목표 월매출을 정하고, 수도권 71개 매장 통계 프리셋과 손익표를 함께 살펴보세요."
          />

          <div className="workspace-grid">
            <aside className="control-panel">
              <div className="panel-title">
                <Calculator size={20} />
                <div>
                  <h3>2첩 · 목표 매출 입력</h3>
                  <p>목표 매출과 운영 조건을 조정하세요.</p>
                </div>
              </div>

              <div className="preset-grid">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset${revenueInputs.monthlySales === preset.value && !preset.disabled ? " active" : ""}${preset.disabled ? " preset--disabled" : ""}`}
                    onClick={() => !preset.disabled && setRevenueInputs((prev) => ({ ...prev, monthlySales: preset.value }))}
                    disabled={preset.disabled}
                    aria-disabled={preset.disabled}
                  >
                    <b>{preset.label}</b>
                    <span>{preset.caption}</span>
                    <em>{preset.disabled ? "—" : fmtCompact(preset.value)}</em>
                  </button>
                ))}
              </div>

              <Field label="월매출" suffix="원" value={revenueInputs.monthlySales} min={6000000} max={50000000} step={100000} onChange={(monthlySales) => setRevenueInputs((prev) => ({ ...prev, monthlySales }))} />
              <Field label="평균 객단가" suffix="원" value={revenueInputs.avgOrder} min={12000} max={30000} step={500} onChange={(avgOrder) => setRevenueInputs((prev) => ({ ...prev, avgOrder }))} />
              <Field label="월 임대료" suffix="원" value={revenueInputs.rent} min={0} max={3000000} step={50000} onChange={(rent) => setRevenueInputs((prev) => ({ ...prev, rent }))} />
              <p className="auto-cost-note">공과금 = 월매출 2.2% + 푸드테크</p>
              <div className="split-fields">
                <Field label="정직원" suffix="명" value={revenueInputs.fullTime} min={0} max={4} step={0.5} onChange={(fullTime) => setRevenueInputs((prev) => ({ ...prev, fullTime }))} />
                <Field label="파트타이머" suffix="명" value={revenueInputs.partTime} min={0} max={6} step={0.5} onChange={(partTime) => setRevenueInputs((prev) => ({ ...prev, partTime }))} />
              </div>
            </aside>

            <section className="result-panel receipt-panel">
              <div className="panel-title panel-title--between">
                <div>
                  <span className="tiny-label">2첩 · 손익 계산</span>
                  <h3>목표 매출 손익 리포트</h3>
                </div>
                <ReceiptText size={28} />
              </div>

              <div className="metric-grid">
                <MetricCard label="월매출" value={fmtCompact(revenue.monthlySales)} sub={`일평균 ${fmtCompact(revenue.dailySales)}`} tone="red" />
                <MetricCard label="예상 영업이익" value={fmtCompact(revenue.profit)} sub={`영업이익률 ${fmtPct(revenue.margin)}`} tone={revenue.profit >= 0 ? "yellow" : "dark"} />
                <MetricCard label="손익분기점 월매출" value={fmtCompact(revenue.bepSales)} sub="현재 비용구조 기준" />
                <MetricCard label="예상 주문수" value={`${Math.round(revenue.monthlyOrders).toLocaleString("ko-KR")}건`} sub="객단가 기준 환산" />
              </div>

              <div className="receipt-lines">
                {revenueCostItems.map((item) => (
                  <div className="receipt-line" key={item.label}>
                    <div>
                      <span style={{ backgroundColor: item.color }} />
                      <b>{item.label}</b>
                    </div>
                    <div className="bar-track"><i style={{ width: `${(item.value / biggestCost) * 100}%`, backgroundColor: item.color }} /></div>
                    <em>{fmtCompact(item.value)} · {fmtPct(item.value / revenue.monthlySales)}</em>
                  </div>
                ))}
              </div>

              <div className="profit-statement">
                <div><span>매출</span><b>{fmtWon(revenue.monthlySales)}</b></div>
                <div><span>물류비(식자재+포장)</span><b>- {fmtWon(revenue.logistics)}</b></div>
                <div><span>플랫폼·배달 수수료</span><b>- {fmtWon(revenue.platform.total)}</b></div>
                <div><span>인건비</span><b>- {fmtWon(revenue.labor)}</b></div>
                <div><span>고정비</span><b>- {fmtWon(revenue.fixed)}</b></div>
                <div><span>로열티</span><b>- {fmtWon(revenue.royalty)}</b></div>
                <div className="total"><span>예상 영업이익</span><b>{fmtWon(revenue.profit)}</b></div>
              </div>

            </section>
          </div>

          <div className="insight-grid insight-grid--single">
            <article className="mix-card mix-card--wide">
              <div className="panel-title"><BarChart3 size={20} /><h3>채널 매출 믹스</h3></div>
              <div className="stacked-bar" aria-label="채널 매출 믹스">
                {CHANNELS.map((channel) => (
                  <span
                    key={channel.name}
                    title={`${channel.name} ${fmtPct(channel.ratio)}`}
                    style={{ width: `${(channel.ratio / totalMix) * 100}%`, backgroundColor: channel.color }}
                    className={`mix-segment mix-${channel.group}`}
                  />
                ))}
              </div>
              <div className="channel-list channel-list--grid">
                {CHANNELS.map((channel) => (
                  <div key={channel.name}>
                    <span><i style={{ backgroundColor: channel.color }} />{channel.name}</span>
                    <b>{fmtPct(channel.ratio)}</b>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="cost" className="workspace-section cost-section" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,248,232,.92), rgba(255,248,232,.98)), url(${ASSETS.pattern})` }}>
          <SectionHeader
            eyebrow="03 · 창업 비용 계산"
            title="평수와 홀 구성에 따라 창업 비용을 계산합니다"
            description="2첩에서 정하신 목표 매출에 이어, 본사비용 면제 항목과 현장 투자 항목을 분리해 정리했습니다."
          />

          <div className="workspace-grid cost-grid">
            <aside className="control-panel yellow-panel">
              <div className="panel-title">
                <PackageCheck size={20} />
                <div>
                  <h3>3첩 · 창업 조건</h3>
                  <p>평수, 간판, 홀 운영 여부를 선택하세요.</p>
                </div>
              </div>

              <div className="toggle-row" role="group" aria-label="운영 형태 선택">
                <button className={costInputs.mode === "delivery" ? "active" : ""} onClick={() => setCostInputs((prev) => ({ ...prev, mode: "delivery" }))}>배달 중심형</button>
                <button className={costInputs.mode === "hybrid" ? "active" : ""} onClick={() => setCostInputs((prev) => ({ ...prev, mode: "hybrid" }))}>홀 겸업형</button>
              </div>
              <Field label="전용면적" suffix="평" value={costInputs.area} min={8} max={35} step={1} onChange={(area) => setCostInputs((prev) => ({ ...prev, area }))} />
              <div className="toggle-row" role="group" aria-label="간판 선택">
                <button className={costInputs.signType === "flex" ? "active" : ""} onClick={() => setCostInputs((prev) => ({ ...prev, signType: "flex" }))}>플렉스 간판</button>
                <button className={costInputs.signType === "channel" ? "active" : ""} onClick={() => setCostInputs((prev) => ({ ...prev, signType: "channel" }))}>채널 간판</button>
              </div>
              <Field label="2인 테이블" suffix="개" value={costInputs.tableCount} min={0} max={16} step={1} onChange={(tableCount) => setCostInputs((prev) => ({ ...prev, tableCount }))} />
              <label className="check-row">
                <input type="checkbox" checked={costInputs.showWaivedFees} onChange={(event) => setCostInputs((prev) => ({ ...prev, showWaivedFees: event.target.checked }))} />
                본사비용 면제 프로모션 반영
              </label>

              <div className="report-save-card no-print">
                <div>
                  <span className="tiny-label">결과 리포트 저장</span>
                  <h4>로그인 없이 지금 화면의 계산 결과를 PDF 파일로 저장하실 수 있습니다</h4>
                  <p>버튼을 누른 뒤 인쇄 대화상자에서 대상을 "PDF로 저장"으로 선택하시면 파일로 보관하실 수 있습니다.</p>
                </div>
                <div className="report-action-row">
                  <button type="button" className="primary-cta button-reset" onClick={handlePrint}>
                    <FileText size={17} /> PDF 저장
                  </button>
                </div>
              </div>
            </aside>

            <section className="result-panel investment-panel">
              <div className="panel-title panel-title--between">
                <div>
                  <span className="tiny-label">3첩 · 창업 비용 리포트</span>
                  <h3>예상 실납부 투자비</h3>
                </div>
                <CircleDollarSign size={30} />
              </div>
              <div className="investment-hero">
                <span>부가세 별도 기준</span>
                <strong>{fmtCompact(opening.net)}</strong>
                <p>정상가 대비 {fmtCompact(opening.headquartersDiscount)} 차감</p>
              </div>

              <div className="cost-table" role="table" aria-label="개설비용 항목">
                {[
                  ["본사비용 정상가", opening.headquartersGross, "가맹비·교육비·감리비·물류보증금"],
                  ["프로모션 차감", -opening.headquartersDiscount, "면제 항목 분리 표시"],
                  ["인테리어", opening.interior, `${opening.area}평 × 100만원`],
                  ["간판", opening.sign, costInputs.signType === "flex" ? "플렉스 간판" : "채널 간판"],
                  ["내외부 사인물", opening.internalSigns, "시트지·내부 사인물 포함"],
                  ["주방설비", opening.kitchen, "냉장고·세척기·싱크대 등"],
                  ["홀/주방 집기", opening.utensils, "코팅웍·받드·집게·국자 등"],
                  ["의탁자", opening.hallFurniture, `${opening.seats}석 기준`],
                  ["홀 운영품목", opening.hallOperatingItems, "수저·그릇·컵·바스켓 등"],
                ].map(([label, value, memo]) => (
                  <div className="cost-row" key={String(label)}>
                    <span>{label}</span>
                    <em>{memo}</em>
                    <b>{Number(value) < 0 ? `- ${fmtCompact(Math.abs(Number(value)))}` : fmtCompact(Number(value))}</b>
                  </div>
                ))}
                <div className="cost-row total">
                  <span>실납부 예상 합계</span>
                  <em>부가세 별도, 현장 별도공사 제외</em>
                  <b>{fmtWon(opening.net)}</b>
                </div>
              </div>
            </section>
          </div>
        </section>

      </main>

      <footer>
        <b>삼첩분식 창업 시뮬레이터</b>
        <span>삼첩분식 자료 기반 참고 계산기 · 계약·견적·수익을 보장하지 않습니다</span>
        <a href="#top">맨 위로 <ChevronRight size={14} /></a>
      </footer>


    </div>
  );
}
