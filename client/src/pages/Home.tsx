/*
 * Design philosophy: Premium Bunsik Package Collage for Samcheop franchise counseling.
 * This page uses a 1-cheop / 2-cheop / 3-cheop consultation flow, chili-red and package-yellow accents,
 * receipt-style result panels, tactile paper cards, and asymmetric food-packaging imagery.
 * Every interaction should reinforce a franchise counseling tool that feels practical, appetizing, and brand-specific.
 */
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Flame,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Store,
  Utensils,
} from "lucide-react";

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
  validStores: 55,
  average: 18779225,
  median: 16745233,
  p25: 12776680,
  p75: 21668924,
  p90: 31597574,
  max: 38954521,
  hallAverage: 24084318,
  deliveryAverage: 17600315,
};

const BENCHMARK_STORES = [
  { rank: 1, region: "경기", name: "중동점", sales: 38954521, hall: false },
  { rank: 2, region: "서울", name: "공덕점_홀", sales: 36491458, hall: true },
  { rank: 3, region: "서울", name: "발산점", sales: 36182403, hall: false },
  { rank: 4, region: "서울", name: "은평점", sales: 34064740, hall: false },
  { rank: 5, region: "경기", name: "백석점_홀", sales: 33725388, hall: true },
  { rank: 6, region: "서울", name: "구로점", sales: 32005397, hall: false },
  { rank: 7, region: "경기", name: "하이닉스점_홀", sales: 30985839, hall: true },
  { rank: 8, region: "서울", name: "홍대점", sales: 30531581, hall: false },
  { rank: 9, region: "경기", name: "군포점_홀", sales: 29841100, hall: true },
  { rank: 10, region: "경기", name: "호원점", sales: 29114381, hall: false },
];

const CHANNELS = [
  { group: "배달", name: "배달의민족", ratio: 0.063, kind: "baemin" },
  { group: "배달", name: "배민원", ratio: 0.4112, kind: "baeminOne" },
  { group: "배달", name: "요기요", ratio: 0.075, kind: "yogiyo" },
  { group: "배달", name: "쿠팡이츠", ratio: 0.3516, kind: "coupang" },
  { group: "배달", name: "지역배달", ratio: 0.032, kind: "local" },
  { group: "배달", name: "자사앱", ratio: 0.0243, kind: "self" },
  { group: "포장", name: "배민 포장", ratio: 0.0123, kind: "pickupBaemin" },
  { group: "포장", name: "쿠팡 포장", ratio: 0.0025, kind: "pickupCoupang" },
  { group: "포장", name: "요기요 포장", ratio: 0.0074, kind: "pickupYogiyo" },
  { group: "포장", name: "지역 포장", ratio: 0.0115, kind: "pickupLocal" },
  { group: "포장", name: "홀 포장", ratio: 0.0082, kind: "hallPickup" },
  { group: "홀", name: "카드매출", ratio: 0.0005, kind: "hallCard" },
  { group: "홀", name: "현금매출", ratio: 0.0005, kind: "cash" },
];

const PRESETS = [
  { label: "중앙값", value: STORE_STATS.median, caption: "55개 매장 중위" },
  { label: "평균", value: STORE_STATS.average, caption: "수도권 평균" },
  { label: "상위 25%", value: STORE_STATS.p75, caption: "성장권" },
  { label: "목표값", value: 32344100, caption: "엑셀 목표" },
  { label: "상위 10%", value: STORE_STATS.p90, caption: "고성과권" },
];

type SignType = "flex" | "channel";
type StoreMode = "delivery" | "hybrid";

type RevenueInputs = {
  monthlySales: number;
  avgOrder: number;
  rent: number;
  utilities: number;
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
  utilities: 705000,
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

function calculatePlatformFee(monthlySales: number, avgOrder: number) {
  const orderPrice = Math.max(avgOrder, 1);
  const details = CHANNELS.map((channel) => {
    const sales = monthlySales * channel.ratio;
    const orders = sales / orderPrice;
    let fee = 0;
    if (channel.kind === "baemin") fee = sales * (0.068 + 0.03) * 1.1 + orders * 4000;
    if (channel.kind === "baeminOne") fee = sales * (0.078 + 0.03) * 1.1 + orders * 3400;
    if (channel.kind === "yogiyo") fee = sales * (0.085 + 0.03) * 1.1;
    if (channel.kind === "coupang") fee = sales * (0.078 + 0.03) * 1.1;
    if (channel.kind === "local" || channel.kind === "self") fee = sales * 0.165;
    if (channel.kind === "pickupBaemin") fee = sales * (0.068 + 0.03) * 1.1;
    if (channel.kind === "pickupCoupang") fee = sales * (0.078 + 0.03) * 1.1;
    if (channel.kind === "pickupYogiyo") fee = sales * (0.085 + 0.03) * 1.1;
    if (channel.kind === "pickupLocal") fee = sales * 0.03;
    if (channel.kind === "hallPickup" || channel.kind === "hallCard") fee = sales * 0.00005;
    return { ...channel, sales, orders, fee };
  });
  const quickManagementFee = monthlySales > 0 ? 100000 : 0;
  const total = details.reduce((acc, item) => acc + item.fee, 0) + quickManagementFee;
  return { details, quickManagementFee, total };
}

function calculateRevenue(inputs: RevenueInputs) {
  const monthlySales = Math.max(0, inputs.monthlySales);
  const logistics = monthlySales * 0.4;
  const platform = calculatePlatformFee(monthlySales, inputs.avgOrder);
  const fullTimeLabor = inputs.fullTime * 2500000 * 1.105;
  const partTimeLabor = inputs.partTime * 3 * 5 * 4.35 * 10030 * 1.2 * 1.105;
  const labor = fullTimeLabor + partTimeLabor;
  const fixed = inputs.rent + inputs.utilities + 400000 + 22000 + 110000;
  const totalCost = logistics + platform.total + labor + fixed;
  const profit = monthlySales - totalCost;
  const margin = monthlySales > 0 ? profit / monthlySales : 0;
  const dailySales = monthlySales / 30.4;
  const monthlyOrders = monthlySales / Math.max(inputs.avgOrder, 1);

  const profitAt = (sales: number) => {
    const salesPlatform = calculatePlatformFee(sales, inputs.avgOrder);
    const salesLogistics = sales * 0.4;
    return sales - salesLogistics - salesPlatform.total - labor - fixed;
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
    fixed,
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
        5500 +
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
  const revenue = useMemo(() => calculateRevenue(revenueInputs), [revenueInputs]);
  const opening = useMemo(() => calculateOpeningCost(costInputs), [costInputs]);
  const revenueCostItems = [
    { label: "식자재", value: revenue.ingredients, color: "#b91c1c" },
    { label: "포장재", value: revenue.packaging, color: "#f2b705" },
    { label: "플랫폼·배달", value: revenue.platform.total, color: "#ef7d22" },
    { label: "인건비", value: revenue.labor, color: "#1f2937" },
    { label: "고정비", value: revenue.fixed, color: "#64748b" },
  ];
  const biggestCost = Math.max(...revenueCostItems.map((item) => item.value), 1);
  const totalMix = CHANNELS.reduce((acc, item) => acc + item.ratio, 0);

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
          <a href="#revenue">매출 손익</a>
          <a href="#cost">개설비용</a>
          <a href="#assumptions">자료 기준</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,248,232,.98) 0%, rgba(255,248,232,.94) 44%, rgba(255,248,232,.58) 63%, rgba(255,248,232,.18) 100%), url(${ASSETS.hero})` }}>
          <div className="hero-content">
            <span className="eyebrow-chip"><Flame size={16} /> 삼첩분식 창업 상담용</span>
            <h1>
              매출과 개설비용을 <mark>1·2·3첩</mark>처럼 펼쳐보는 프랜차이즈 시뮬레이터
            </h1>
            <p>
              삼첩분식 상담 자료의 목표매출 산정식, 수도권 매장 매출 통계, 예상 개설비용 항목을 바탕으로 상담 현장에서 바로 설명 가능한 손익·투자비 리포트를 구성했습니다.
            </p>
            <div className="hero-actions">
              <a href="#revenue" className="primary-cta">매출 시뮬레이션 시작 <ArrowRight size={18} /></a>
              <a href="#cost" className="secondary-cta">개설비용 보기</a>
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
            { no: "1첩", title: "목표 매출 입력", text: "평균·중앙값·목표값 프리셋으로 상담 시작점을 빠르게 잡습니다." },
            { no: "2첩", title: "비용 구조 계산", text: "물류비, 플랫폼 수수료, 인건비, 고정비를 한 장의 손익표로 정리합니다." },
            { no: "3첩", title: "개설비용 리포트", text: "평수·간판·홀 테이블 수에 따라 초기 투자비를 즉시 비교합니다." },
          ].map((item) => (
            <article key={item.no}>
              <span>{item.no}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section id="revenue" className="workspace-section revenue-section">
          <SectionHeader
            eyebrow="01 · 매출 시뮬레이션"
            title="목표 월매출을 움직이면 손익 구조가 즉시 바뀝니다"
            description="기본값은 목표매출 산정자료의 3,234만원이며, 수도권 55개 매장 통계 프리셋을 함께 제공합니다."
          />

          <div className="workspace-grid">
            <aside className="control-panel">
              <div className="panel-title">
                <Calculator size={20} />
                <div>
                  <h3>1첩 · 입력값</h3>
                  <p>매출과 운영 조건을 조정하세요.</p>
                </div>
              </div>

              <div className="preset-grid">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={revenueInputs.monthlySales === preset.value ? "preset active" : "preset"}
                    onClick={() => setRevenueInputs((prev) => ({ ...prev, monthlySales: preset.value }))}
                  >
                    <b>{preset.label}</b>
                    <span>{preset.caption}</span>
                    <em>{fmtCompact(preset.value)}</em>
                  </button>
                ))}
              </div>

              <Field label="월매출" suffix="원" value={revenueInputs.monthlySales} min={6000000} max={50000000} step={100000} onChange={(monthlySales) => setRevenueInputs((prev) => ({ ...prev, monthlySales }))} />
              <Field label="평균 객단가" suffix="원" value={revenueInputs.avgOrder} min={12000} max={30000} step={500} onChange={(avgOrder) => setRevenueInputs((prev) => ({ ...prev, avgOrder }))} />
              <Field label="월 임대료" suffix="원" value={revenueInputs.rent} min={0} max={3000000} step={50000} onChange={(rent) => setRevenueInputs((prev) => ({ ...prev, rent }))} />
              <Field label="공과금" suffix="원" value={revenueInputs.utilities} min={200000} max={1500000} step={10000} onChange={(utilities) => setRevenueInputs((prev) => ({ ...prev, utilities }))} />
              <div className="split-fields">
                <Field label="정직원" suffix="명" value={revenueInputs.fullTime} min={0} max={4} step={0.5} onChange={(fullTime) => setRevenueInputs((prev) => ({ ...prev, fullTime }))} />
                <Field label="파트타이머" suffix="명" value={revenueInputs.partTime} min={0} max={6} step={0.5} onChange={(partTime) => setRevenueInputs((prev) => ({ ...prev, partTime }))} />
              </div>
            </aside>

            <section className="result-panel receipt-panel">
              <div className="panel-title panel-title--between">
                <div>
                  <span className="tiny-label">2첩 · 손익 리포트</span>
                  <h3>월 손익 예상</h3>
                </div>
                <ReceiptText size={28} />
              </div>

              <div className="metric-grid">
                <MetricCard label="월매출" value={fmtCompact(revenue.monthlySales)} sub={`일평균 ${fmtCompact(revenue.dailySales)}`} tone="red" />
                <MetricCard label="예상 영업이익" value={fmtCompact(revenue.profit)} sub={`영업이익률 ${fmtPct(revenue.margin)}`} tone={revenue.profit >= 0 ? "yellow" : "dark"} />
                <MetricCard label="BEP 월매출" value={fmtCompact(revenue.bepSales)} sub="현재 비용구조 기준" />
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
                    <em>{fmtCompact(item.value)}</em>
                  </div>
                ))}
              </div>

              <div className="profit-statement">
                <div><span>매출</span><b>{fmtWon(revenue.monthlySales)}</b></div>
                <div><span>물류비(식자재+포장)</span><b>- {fmtWon(revenue.logistics)}</b></div>
                <div><span>플랫폼·배달 수수료</span><b>- {fmtWon(revenue.platform.total)}</b></div>
                <div><span>인건비</span><b>- {fmtWon(revenue.labor)}</b></div>
                <div><span>고정비</span><b>- {fmtWon(revenue.fixed)}</b></div>
                <div className="total"><span>예상 영업이익</span><b>{fmtWon(revenue.profit)}</b></div>
              </div>

              <div className="report-save-card no-print">
                <div>
                  <span className="tiny-label">상담 리포트 출력</span>
                  <h4>로그인이나 클라우드 저장 없이 현재 계산 결과를 로컬 PDF로 저장합니다</h4>
                  <p>버튼을 누른 뒤 인쇄 대화상자에서 대상 항목을 PDF 저장으로 선택하면 상담 현장에서 바로 파일로 보관할 수 있습니다.</p>
                </div>
                <div className="report-action-row">
                  <button type="button" className="primary-cta button-reset" onClick={handlePrint}>
                    <FileText size={17} /> PDF 저장
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="insight-grid">
            <article className="image-card">
              <img src={ASSETS.consulting} alt="삼첩분식 상담용 대시보드 이미지" />
              <div>
                <span>상담 포인트</span>
                <h3>영수증형 손익표로 설명합니다</h3>
                <p>식자재율 36%, 포장재율 4%, 로열티 11만원, 기본 파트타이머 2.5명 등 핵심 가정을 화면에 함께 보여 상담 신뢰도를 높입니다.</p>
              </div>
            </article>

            <article className="mix-card">
              <div className="panel-title"><BarChart3 size={20} /><h3>채널 매출 믹스</h3></div>
              <div className="stacked-bar" aria-label="채널 매출 믹스">
                {CHANNELS.map((channel) => (
                  <span
                    key={channel.name}
                    title={`${channel.name} ${fmtPct(channel.ratio)}`}
                    style={{ width: `${(channel.ratio / totalMix) * 100}%` }}
                    className={`mix-${channel.group}`}
                  />
                ))}
              </div>
              <div className="channel-list">
                {CHANNELS.slice(0, 8).map((channel) => (
                  <div key={channel.name}>
                    <span>{channel.name}</span>
                    <b>{fmtPct(channel.ratio)}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="benchmark-card">
              <div className="panel-title"><Store size={20} /><h3>수도권 상위 매장 벤치마크</h3></div>
              {BENCHMARK_STORES.map((store) => (
                <div className="benchmark-row" key={store.rank}>
                  <b>{store.rank}</b>
                  <span>{store.region} · {store.name}</span>
                  <em>{fmtCompact(store.sales)}</em>
                </div>
              ))}
            </article>
          </div>
        </section>

        <section id="cost" className="workspace-section cost-section" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,248,232,.92), rgba(255,248,232,.98)), url(${ASSETS.pattern})` }}>
          <SectionHeader
            eyebrow="02 · 개설비용 시뮬레이션"
            title="평수와 홀 구성에 따라 초기 투자비를 다시 계산합니다"
            description="본사비용 면제 항목은 정상가와 차감액을 분리하여, 상담자가 프로모션 효과를 명확히 설명할 수 있게 구성했습니다."
          />

          <div className="workspace-grid cost-grid">
            <aside className="control-panel yellow-panel">
              <div className="panel-title">
                <PackageCheck size={20} />
                <div>
                  <h3>3첩 · 개설 조건</h3>
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
            </aside>

            <section className="result-panel investment-panel">
              <div className="panel-title panel-title--between">
                <div>
                  <span className="tiny-label">개설비용 리포트</span>
                  <h3>예상 실납부 투자비</h3>
                </div>
                <CircleDollarSign size={30} />
              </div>
              <div className="investment-hero">
                <span>VAT 별도 기준</span>
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
                  <em>VAT 별도, 현장 별도공사 제외</em>
                  <b>{fmtWon(opening.net)}</b>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section id="assumptions" className="assumption-section">
          <div>
            <span className="eyebrow-chip"><ClipboardCheck size={16} /> 자료 기준</span>
            <h2>매장 실적 자료와 브랜드 조사를 결합한 상담용 계산기입니다</h2>
            <p>
              본 화면은 내부 상담 자료의 주요 수치를 웹 계산기로 옮긴 참고용 도구입니다. 실제 계약·견적·수익 보장을 의미하지 않으며, 가맹 상담 시 후보 상권, 임대 조건, 오픈 프로모션, 배달 권역 정책에 따라 조정되어야 합니다.
            </p>
          </div>
          <div className="assumption-cards">
            <article><BadgePercent /><b>수수료</b><span>배달앱별 중개·카드·배달비 구조를 상담 산정자료 기준으로 반영했습니다.</span></article>
            <article><Utensils /><b>물류비</b><span>식자재율 36%, 포장재율 4%를 기본 적용합니다.</span></article>
            <article><LayoutDashboard /><b>브랜드 UI</b><span>삼첩분식의 레드·옐로우 패키지와 1·2·3첩 구조를 화면 경험에 반영했습니다.</span></article>
          </div>
        </section>
      </main>

      <footer>
        <b>삼첩분식 창업 상담 시뮬레이터</b>
        <span>자료 기반 내부 상담용 · 계약·견적·수익 보장을 의미하지 않는 참고 계산기</span>
        <a href="#top">맨 위로 <ChevronRight size={14} /></a>
      </footer>


    </div>
  );
}
