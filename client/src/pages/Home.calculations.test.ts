import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHANNELS, calculateRevenue } from "./Home";

const homeSource = readFileSync("client/src/pages/Home.tsx", "utf8").replace(/\r\n/g, "\n");
const cssSource = readFileSync("client/src/index.css", "utf8").replace(/\r\n/g, "\n");

describe("삼첩분식 상담 계산기", () => {
  it("공과금을 월매출의 2.2%로 자동 계산하고 고정비 = 공과금 + 임대료 + 푸드테크(22,000원)로 구성한다", () => {
    const result = calculateRevenue({
      monthlySales: 10_000_000,
      avgOrder: 20_000,
      rent: 500_000,
      fullTime: 0,
      partTime: 0,
      mode: "hybrid",
    });

    expect(result.utilities).toBe(220_000);
    expect(result.fixed).toBe(742_000);
  });

  it("채널 매출 믹스가 상위 비중부터 하위 비중까지 내림차순으로 정렬되어 있다", () => {
    const ratios = CHANNELS.map((channel) => channel.ratio);
    const sortedRatios = [...ratios].sort((a, b) => b - a);

    expect(ratios).toEqual(sortedRatios);
    expect(CHANNELS[0].name).toBe("배민원");
    expect(CHANNELS[1].name).toBe("쿠팡이츠");
  });

  it("각 채널이 막대 그래프와 목록에서 공유할 고유 색상값을 가진다", () => {
    expect(CHANNELS.every((channel) => /^#[0-9a-f]{6}$/i.test(channel.color))).toBe(true);
    expect(new Set(CHANNELS.map((channel) => channel.color)).size).toBe(CHANNELS.length);
  });

  it("비용 막대가 금액과 비율을 축약 형식으로 함께 렌더링한다", () => {
    expect(homeSource).toContain("{fmtCompact(item.value)} · {fmtPct(item.value / revenue.monthlySales)}");
  });

  it("벤치마크 매장 순위 카드를 숨기고 채널 매출 믹스 단독 인사이트로 렌더링한다", () => {
    expect(homeSource).toContain('className="insight-grid insight-grid--single"');
    expect(homeSource).toContain('className="mix-card mix-card--wide"');
    expect(homeSource).not.toContain('className="image-card"');
    expect(homeSource).not.toContain('25년 기준 수도권 매장 순위');
  });

  it("누적 막대와 채널 목록이 동일한 CHANNELS 배열 전체를 사용한다", () => {
    expect(homeSource).toContain('<div className="stacked-bar" aria-label="채널 매출 믹스">\n                {CHANNELS.map((channel) => (');
    expect(homeSource).toContain('<div className="channel-list channel-list--grid">\n                {CHANNELS.map((channel) => (');
    expect(homeSource).not.toContain("CHANNELS.slice");
  });

  it("상담 흐름을 인근매장 조회, 목표 매출 입력, 창업 비용 계산 순서로 안내한다", () => {
    expect(homeSource).toContain('href="#nearby"');
    expect(homeSource).toContain('title: "인근매장 매출 조회"');
    expect(homeSource).toContain('title: "목표 매출 입력"');
    expect(homeSource).toContain('title: "창업 비용 계산"');
    expect(homeSource).toContain('id="nearby"');
    expect(homeSource).not.toContain('id="assumptions"');
  });

  it("STORE_STATS.validStores 통계는 71개 매장을 기준으로 표기된다", () => {
    expect(homeSource).toContain('validStores: 71,');
    expect(homeSource).toContain('수도권 71개 매장 통계');
  });

  it("2첩 PRESETS가 6개 카드로 구성된다", () => {
    const presetIds = ["national", "metro-avg", "metro-p25", "metro-p10", "nearby-max", "nearby-min"];
    for (const id of presetIds) {
      expect(homeSource).toContain(`id: "${id}"`);
    }
    const presetLabels = ["전국 평균", "수도권 평균", "수도권 상위 25%", "수도권 상위 10%", "인근 매장 평균 최고액", "인근 매장 평균 최저액"];
    for (const label of presetLabels) {
      expect(homeSource).toContain(`label: "${label}"`);
    }
  });

  it("인근 매장 PRESETS ⑤⑥은 nearbyResult 없을 때 disabled 처리된다", () => {
    expect(homeSource).toContain("preset--disabled");
    expect(homeSource).toContain("disabled: !nearbyResult");
    expect(homeSource).toContain("preset.disabled");
  });

  it("인근 매장 PRESETS 값 변환식이 연환산천원→월매출원 (× 1000 / 12) 이다", () => {
    expect(homeSource).toContain("nearbyResult.maxEstimate * 1000) / 12");
    expect(homeSource).toContain("nearbyResult.minEstimate * 1000) / 12");
  });

  it("채널 목록은 그리드로 펼쳐 스크롤 없이 노출하고, 창업 비용 표만 축소 카드 스크롤을 유지한다", () => {
    expect(cssSource).toContain('.channel-list--grid {');
    expect(cssSource).toContain('grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));');
    expect(cssSource).toContain('max-height: none;');
    expect(cssSource).toContain('.cost-table {\n  max-height: 34rem;\n  overflow-y: auto;');
  });

  it("플랫폼·배달 수수료는 26년 Excel 「목표매출 산정자료」 산식을 따른다 (배민 가게배달 퀵비 + 모든 앱 배달비×VAT)", () => {
    const result = calculateRevenue({
      monthlySales: 32_344_100,
      avgOrder: 20_000,
      rent: 500_000,
      fullTime: 0,
      partTime: 2.5,
      mode: "hybrid",
    });

    // Excel F39+F40+F41+F42+F47 + F37(배민/지역/자사 퀵비 16.5%) + F38(퀵관리비) = 9,789,893
    expect(Math.round(result.platform.total)).toBe(9_789_893);

    const find = (kind: string) =>
      result.platform.details.find((d) => d.kind === kind)!;

    // 배민(가게배달): 퀵비 16.5% + 중개·결제 VAT + 주문당 배달비×VAT — Excel 1,004,168
    expect(Math.round(find("baemin").fee)).toBe(1_004_168);
    // 배민원: 중개·결제 VAT + 주문당 배달비×VAT — Excel 4,067,108
    expect(Math.round(find("baeminOne").fee)).toBe(4_067_108);
    // 요기요: 신규 추가된 주문당 배달비 4,000원×VAT — Excel 840,542
    expect(Math.round(find("yogiyo").fee)).toBe(840_542);
    // 쿠팡이츠: 신규 추가된 주문당 배달비 3,400원×VAT — Excel 3,477,614
    expect(Math.round(find("coupang").fee)).toBe(3_477_614);
    // 포장 채널은 Excel 원본에서 수수료 없음
    for (const k of ["pickupBaemin", "pickupCoupang", "pickupYogiyo", "pickupLocal", "hallPickup"]) {
      expect(find(k).fee).toBe(0);
    }
    // 매출이 0이면 퀵관리비도 0
    const zero = calculateRevenue({
      monthlySales: 0,
      avgOrder: 20_000,
      rent: 0,
      fullTime: 0,
      partTime: 0,
      mode: "hybrid",
    });
    expect(zero.platform.total).toBe(0);
  });

  it("로열티 110,000원은 고정비와 분리된 별도 라인이며 영업이익에서 별도 차감된다", () => {
    const result = calculateRevenue({
      monthlySales: 10_000_000,
      avgOrder: 20_000,
      rent: 500_000,
      fullTime: 0,
      partTime: 0,
      mode: "hybrid",
    });

    // 로열티는 고정비에 합산되지 않음
    expect(result.royalty).toBe(110_000);
    expect(result.fixed).toBe(742_000);

    // totalCost와 profit은 로열티를 별도 차감한 값
    expect(result.totalCost).toBe(
      result.logistics + result.platform.total + result.labor + result.fixed + result.royalty,
    );
    expect(result.profit).toBe(result.monthlySales - result.totalCost);
  });

  it("결과 리포트 저장 카드는 3첩 yellow-panel 안(본사비용 면제 체크박스 다음)으로 이동했다", () => {
    // 3첩에서 본사비용 면제 체크박스 바로 다음에 카드가 등장
    expect(homeSource).toContain(
      '본사비용 면제 프로모션 반영\n              </label>\n\n              <div className="report-save-card no-print">',
    );
    // 2첩 receipt-panel 안에서는 더 이상 카드가 보이지 않음
    expect(homeSource).not.toMatch(
      /receipt-panel[\s\S]*?report-save-card no-print[\s\S]*?2첩 \\u00b7 손익 계산/,
    );
  });

  it("2첩 입력 카드와 손익 리포트 카드는 동일한 세로 높이로 stretch 된다", () => {
    expect(cssSource).toContain(".revenue-section .workspace-grid {\n  align-items: stretch;");
    expect(cssSource).toContain(".revenue-section .profit-statement {\n  flex: 1 1 auto;");
    expect(cssSource).toContain(".revenue-section .control-panel {\n  position: static;");
  });

  it("손익표 영수증과 비용 막대 차트 모두 로열티를 별도 라인으로 노출한다", () => {
    // 막대 차트(receipt-lines)의 비용 항목 순서
    expect(homeSource).toContain('{ label: "식자재", value: revenue.ingredients');
    expect(homeSource).toContain('{ label: "로열티", value: revenue.royalty, color: "#9333ea" },');

    // 영수증형 손익표 라인: 고정비 다음, 영업이익 위
    expect(homeSource).toContain(
      '<div><span>고정비</span><b>- {fmtWon(revenue.fixed)}</b></div>\n                <div><span>로열티</span><b>- {fmtWon(revenue.royalty)}</b></div>\n                <div className="total"><span>예상 영업이익</span><b>{fmtWon(revenue.profit)}</b></div>',
    );
  });
});
