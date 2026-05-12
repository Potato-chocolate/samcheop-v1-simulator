import { trpc } from "@/lib/trpc";
import { Copy, FileText, Home, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const fmtWon = (value: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  );
const fmtCompact = (value: number) => `${Math.round((value || 0) / 10000).toLocaleString("ko-KR")}만원`;
const fmtPct = (value: number) => `${((value || 0) * 100).toFixed(1)}%`;

export default function SharedReport() {
  const shareSlug = window.location.pathname.split("/").filter(Boolean).at(-1) || "";
  const reportQuery = trpc.reports.getBySlug.useQuery({ shareSlug }, { retry: false, enabled: Boolean(shareSlug) });
  const report = reportQuery.data;

  const copyCurrentUrl = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => undefined);
    toast.success("공유 링크를 복사했습니다.");
  };

  if (reportQuery.isLoading) {
    return (
      <main className="shared-report-page">
        <section className="shared-report-shell">
          <span className="eyebrow-chip">상담 리포트</span>
          <h1>저장된 리포트를 불러오는 중입니다</h1>
        </section>
      </main>
    );
  }

  if (reportQuery.error || !report) {
    return (
      <main className="shared-report-page">
        <section className="shared-report-shell">
          <span className="eyebrow-chip">상담 리포트</span>
          <h1>리포트를 찾을 수 없습니다</h1>
          <p className="muted">공유 링크가 잘못되었거나 리포트가 삭제되었을 수 있습니다.</p>
          <Link href="/" className="primary-cta button-reset no-print">
            <Home size={17} /> 시뮬레이터로 돌아가기
          </Link>
        </section>
      </main>
    );
  }

  const metrics = [
    ["월매출", fmtCompact(report.revenueSummary.monthlySales), `일평균 ${fmtCompact(report.revenueSummary.dailySales)}`],
    ["예상 영업이익", fmtCompact(report.revenueSummary.profit), `영업이익률 ${fmtPct(report.revenueSummary.margin)}`],
    ["손익분기점 월매출", fmtCompact(report.revenueSummary.bepSales), "현재 비용구조 기준"],
    ["실납부 투자비", fmtCompact(report.openingSummary.net), "부가세 별도 기준"],
  ];

  const detailRows = [
    ["매출", report.revenueSummary.monthlySales],
    ["식자재+포장", -report.revenueSummary.logistics],
    ["플랫폼·배달 수수료", -report.revenueSummary.platformTotal],
    ["인건비", -report.revenueSummary.labor],
    ["고정비", -report.revenueSummary.fixed],
    ["예상 영업이익", report.revenueSummary.profit],
    ["본사비용 정상가", report.openingSummary.headquartersGross],
    ["프로모션 차감", -report.openingSummary.headquartersDiscount],
    ["인테리어", report.openingSummary.interior],
    ["간판·사인물", report.openingSummary.sign + report.openingSummary.internalSigns],
    ["주방설비·집기", report.openingSummary.kitchen + report.openingSummary.utensils],
    ["홀 구성", report.openingSummary.hallFurniture + report.openingSummary.hallOperatingItems],
    ["실납부 투자비", report.openingSummary.net],
  ];

  return (
    <main className="shared-report-page">
      <section className="shared-report-shell">
        <header className="shared-report-header">
          <div>
            <span className="eyebrow-chip"><Share2 size={16} /> 삼첩분식 창업 상담 리포트</span>
            <h1>{report.title}</h1>
            <p className="muted">
              후보자: {report.candidateName || "미기재"} · 저장일: {new Date(report.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="shared-report-actions no-print">
            <button type="button" className="secondary-cta button-reset" onClick={copyCurrentUrl}><Copy size={17} /> 링크 복사</button>
            <button type="button" className="secondary-cta button-reset" onClick={() => window.print()}><FileText size={17} /> PDF 저장</button>
            <Link href="/" className="primary-cta button-reset"><Home size={17} /> 계산기로 이동</Link>
          </div>
        </header>

        <section className="shared-report-grid">
          {metrics.map(([label, value, sub]) => (
            <article className="metric-card metric-card--cream" key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{sub}</span>
            </article>
          ))}
        </section>

        <table className="shared-report-table">
          <thead>
            <tr><th>항목</th><th>금액</th></tr>
          </thead>
          <tbody>
            {detailRows.map(([label, value]) => (
              <tr key={String(label)}><td>{label}</td><td>{fmtWon(Number(value))}</td></tr>
            ))}
          </tbody>
        </table>

        {report.memo && (
          <section className="shared-report-memo">
            <strong>상담 메모</strong>
            <p>{report.memo}</p>
          </section>
        )}
      </section>
    </main>
  );
}
