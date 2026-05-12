import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const homeSource = readFileSync(path.join(projectRoot, "client/src/pages/Home.tsx"), "utf-8");
const indexHtml = readFileSync(path.join(projectRoot, "client/index.html"), "utf-8");

describe("삼첩분식 상담 화면 QA", () => {
  it("상담 화면에서 로그인, 클라우드 저장, 공유 링크 CTA를 노출하지 않는다", () => {
    expect(homeSource).not.toContain("useAuth");
    expect(homeSource).not.toContain("getLoginUrl");
    expect(homeSource).not.toContain("리포트 저장·링크 복사");
    expect(homeSource).not.toContain("최근 저장 링크 복사");
    expect(homeSource).not.toContain("입력값 공유 링크");
    expect(homeSource).not.toContain("공유 링크를 발급");
  });

  it("PDF 버튼 문구는 저장 중심으로 단순하게 유지한다", () => {
    expect(homeSource).toContain("PDF 저장");
    expect(homeSource).not.toContain("PDF 저장/인쇄");
  });

  it("브라우저 탭 제목과 주요 상담 화면에서 v1/v2 표현을 제거한다", () => {
    expect(indexHtml).toContain("삼첩분식 가맹 매출·개설비용 시뮬레이터");
    expect(indexHtml).not.toContain("삼첩분식 v1");
    expect(homeSource).not.toContain("삼첩분식 v1");
    expect(homeSource).not.toContain("v2 단막");
  });

  it("입력값과 주요 계산 결과는 한국어 천 단위 쉼표 포맷을 사용한다", () => {
    expect(homeSource).toContain("const formatInputValue");
    expect(homeSource).toContain('value.toLocaleString("ko-KR")');
    expect(homeSource).toContain('new Intl.NumberFormat("ko-KR"');
    expect(homeSource).toContain('Math.round(revenue.monthlyOrders).toLocaleString("ko-KR")');
  });

  it("25년 기준 수도권 매장 순위 카드는 인사이트 영역에서 숨김 처리되어 있다", () => {
    expect(homeSource).not.toContain('25년 기준 수도권 매장 순위');
    expect(homeSource).not.toContain('BENCHMARK_STORES');
    expect(homeSource).toContain('insight-grid--single');
  });
});
