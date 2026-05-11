import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHANNELS, calculateRevenue } from "./Home";

const homeSource = readFileSync("client/src/pages/Home.tsx", "utf8");

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
});
