import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHANNELS, calculateRevenue } from "./Home";

const homeSource = readFileSync("client/src/pages/Home.tsx", "utf8").replace(/\r\n/g, "\n");
const cssSource = readFileSync("client/src/index.css", "utf8").replace(/\r\n/g, "\n");

describe("삼첩분식 상담 계산기", () => {
  it("공과금을 월매출의 3.5%로 자동 계산하고 고정비에 반영한다", () => {
    const result = calculateRevenue({
      monthlySales: 10_000_000,
      avgOrder: 20_000,
      rent: 500_000,
      fullTime: 0,
      partTime: 0,
      mode: "hybrid",
    });

    expect(result.utilities).toBe(350_000);
    expect(result.fixed).toBe(1_382_000);
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

  it("상담 포인트 이미지 카드를 제거하고 채널·벤치마크 2열 인사이트만 렌더링한다", () => {
    expect(homeSource).toContain('className="insight-grid insight-grid--two"');
    expect(homeSource).not.toContain('className="image-card"');
  });

  it("누적 막대와 채널 목록이 동일한 CHANNELS 배열 전체를 사용한다", () => {
    expect(homeSource).toContain('<div className="stacked-bar" aria-label="채널 매출 믹스">\n                {CHANNELS.map((channel) => (');
    expect(homeSource).toContain('<div className="channel-list">\n                {CHANNELS.map((channel) => (');
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

  it("25년 기준 수도권 매장 순위가 유효 매장 55개 전체를 렌더링한다", () => {
    const rankItems = homeSource.match(/rank: \d+/g) ?? [];

    expect(rankItems).toHaveLength(55);
    expect(homeSource).toContain('25년 기준 수도권 매장 순위');
    expect(homeSource).toContain('name: "전곡점"');
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

  it("채널 목록, 매장 순위, 창업 비용 표는 축소 카드 안에서 세로 스크롤을 제공한다", () => {
    expect(cssSource).toContain('.channel-list {\n  --visible-list-rows: 5;');
    expect(cssSource).toContain('max-height: calc(var(--visible-list-rows) * var(--list-row-height));');
    expect(cssSource).toContain('.insight-grid--two .benchmark-card {\n  max-height: calc(5.4rem + var(--visible-list-rows) * var(--list-row-height));');
    expect(cssSource).toContain('.cost-table {\n  max-height: 34rem;\n  overflow-y: auto;');
  });
});
