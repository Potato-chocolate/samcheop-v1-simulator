import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createConsultationReport,
  deleteConsultationReport,
  getConsultationReportBySlug,
  listConsultationReportsByOwner,
} from "./db";
import { storagePut } from "./storage";

const revenueInputsSchema = z.object({
  monthlySales: z.number(),
  avgOrder: z.number(),
  rent: z.number(),
  fullTime: z.number(),
  partTime: z.number(),
  mode: z.enum(["delivery", "hybrid"]),
});

const costInputsSchema = z.object({
  area: z.number(),
  signType: z.enum(["flex", "channel"]),
  tableCount: z.number(),
  mode: z.enum(["delivery", "hybrid"]),
  showWaivedFees: z.boolean(),
});

const revenueSummarySchema = z.object({
  monthlySales: z.number(),
  logistics: z.number(),
  ingredients: z.number(),
  packaging: z.number(),
  platformTotal: z.number(),
  labor: z.number(),
  fixed: z.number(),
  totalCost: z.number(),
  profit: z.number(),
  margin: z.number(),
  dailySales: z.number(),
  monthlyOrders: z.number(),
  bepSales: z.number(),
});

const openingSummarySchema = z.object({
  area: z.number(),
  headquartersGross: z.number(),
  headquartersDiscount: z.number(),
  headquartersNet: z.number(),
  interior: z.number(),
  sign: z.number(),
  internalSigns: z.number(),
  kitchen: z.number(),
  utensils: z.number(),
  hallFurniture: z.number(),
  hallOperatingItems: z.number(),
  gross: z.number(),
  net: z.number(),
  vatGuide: z.number(),
  grandTotalWithVatGuide: z.number(),
  seats: z.number(),
});

const reportSaveInputSchema = z.object({
  title: z.string().trim().min(1).max(180).default("삼첩분식 상담 리포트"),
  candidateName: z.string().trim().max(120).optional().nullable(),
  memo: z.string().trim().max(2000).optional().nullable(),
  origin: z.string().url().optional(),
  revenueInputs: revenueInputsSchema,
  costInputs: costInputsSchema,
  revenueSummary: revenueSummarySchema,
  openingSummary: openingSummarySchema,
});

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtWon(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

function fmtCompact(value: number) {
  return `${Math.round((value || 0) / 10000).toLocaleString("ko-KR")}만원`;
}

function fmtPct(value: number) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function buildReportHtml(input: z.infer<typeof reportSaveInputSchema>, shareSlug: string) {
  const createdAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const shareUrl = input.origin ? `${input.origin.replace(/\/+$/, "")}/report/${shareSlug}` : `/report/${shareSlug}`;
  const rows = [
    ["월매출", fmtWon(input.revenueSummary.monthlySales), "일평균 " + fmtCompact(input.revenueSummary.dailySales)],
    ["예상 영업이익", fmtWon(input.revenueSummary.profit), "영업이익률 " + fmtPct(input.revenueSummary.margin)],
    ["BEP 월매출", fmtWon(input.revenueSummary.bepSales), "현재 비용구조 기준"],
    ["실납부 투자비", fmtWon(input.openingSummary.net), "VAT 별도, 프로모션 차감 반영"],
  ];
  const costRows = [
    ["식자재+포장", input.revenueSummary.logistics],
    ["플랫폼·배달", input.revenueSummary.platformTotal],
    ["인건비", input.revenueSummary.labor],
    ["고정비", input.revenueSummary.fixed],
    ["본사비용 정상가", input.openingSummary.headquartersGross],
    ["프로모션 차감", -input.openingSummary.headquartersDiscount],
    ["인테리어", input.openingSummary.interior],
    ["주방설비·집기", input.openingSummary.kitchen + input.openingSummary.utensils],
    ["홀 구성", input.openingSummary.hallFurniture + input.openingSummary.hallOperatingItems],
  ];

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    :root { --sam-red:#b91c1c; --sam-yellow:#f2b705; --sam-cream:#fff4d9; --sam-paper:#fff8e8; --sam-ink:#251b16; }
    * { box-sizing:border-box; }
    body { margin:0; background:#fff8e8; color:var(--sam-ink); font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR","Segoe UI",sans-serif; }
    main { max-width:960px; margin:32px auto; padding:28px; background:#fffdf7; border:1px solid rgba(37,27,22,.12); border-radius:28px; box-shadow:0 24px 60px rgba(37,27,22,.12); }
    .brand { display:flex; justify-content:space-between; gap:20px; align-items:flex-start; border-bottom:4px double rgba(185,28,28,.22); padding-bottom:22px; margin-bottom:24px; }
    .brand b { display:inline-grid; place-items:center; width:48px; height:48px; border-radius:16px; background:var(--sam-red); color:#fff; font-size:28px; }
    h1 { margin:10px 0 8px; font-size:34px; line-height:1.2; }
    .chip { display:inline-flex; align-items:center; border-radius:999px; padding:7px 12px; background:var(--sam-yellow); color:#251b16; font-weight:800; }
    .muted { color:#6f5b4e; line-height:1.7; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin:24px 0; }
    .metric { padding:18px; border-radius:20px; background:var(--sam-paper); border:1px solid rgba(37,27,22,.12); }
    .metric span { display:block; color:#7c6152; font-weight:800; font-size:13px; }
    .metric strong { display:block; margin:8px 0 4px; color:var(--sam-red); font-size:26px; }
    table { width:100%; border-collapse:collapse; overflow:hidden; border-radius:18px; background:#fff; }
    th, td { padding:14px 12px; border-bottom:1px dashed rgba(37,27,22,.18); text-align:left; }
    th { background:#251b16; color:#fff; }
    td:last-child, th:last-child { text-align:right; font-weight:800; }
    .memo { margin-top:22px; padding:18px; border-left:6px solid var(--sam-red); background:#fff4d9; line-height:1.7; }
    .footer { margin-top:26px; display:flex; justify-content:space-between; gap:18px; color:#6f5b4e; font-size:13px; }
    @media print { body { background:white; } main { margin:0; max-width:none; border:0; box-shadow:none; border-radius:0; } .grid { grid-template-columns:repeat(2,1fr); } }
  </style>
</head>
<body>
  <main>
    <section class="brand">
      <div>
        <span class="chip">삼첩분식 창업 상담 리포트</span>
        <h1>${escapeHtml(input.title)}</h1>
        <p class="muted">후보자: ${escapeHtml(input.candidateName || "미기재")} · 생성일: ${escapeHtml(createdAt)}</p>
      </div>
      <b>3</b>
    </section>
    <section class="grid">
      ${rows.map(([label, value, sub]) => `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(sub)}</small></article>`).join("")}
    </section>
    <h2>손익·투자비 상세</h2>
    <table>
      <thead><tr><th>항목</th><th>금액</th></tr></thead>
      <tbody>
        ${costRows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(fmtWon(Number(value)))}</td></tr>`).join("")}
      </tbody>
    </table>
    ${input.memo ? `<section class="memo"><strong>상담 메모</strong><br />${escapeHtml(input.memo).replaceAll("\n", "<br />")}</section>` : ""}
    <section class="footer"><span>공유 링크: ${escapeHtml(shareUrl)}</span><span>본 리포트는 상담 참고용이며 수익을 보장하지 않습니다.</span></section>
  </main>
</body>
</html>`;
}

function parseJsonField<T>(value: string): T {
  return JSON.parse(value) as T;
}

function serializeReport(row: Awaited<ReturnType<typeof getConsultationReportBySlug>>) {
  if (!row) return undefined;
  return {
    ...row,
    revenueInputs: parseJsonField<z.infer<typeof revenueInputsSchema>>(row.revenueInputsJson),
    costInputs: parseJsonField<z.infer<typeof costInputsSchema>>(row.costInputsJson),
    revenueSummary: parseJsonField<z.infer<typeof revenueSummarySchema>>(row.revenueSummaryJson),
    openingSummary: parseJsonField<z.infer<typeof openingSummarySchema>>(row.openingSummaryJson),
  };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  reports: router({
    save: protectedProcedure.input(reportSaveInputSchema).mutation(async ({ ctx, input }) => {
      const shareSlug = nanoid(24);
      const reportHtml = buildReportHtml(input, shareSlug);
      const stored = await storagePut(
        `samcheop-v1-reports/${ctx.user.id}/${shareSlug}.html`,
        reportHtml,
        "text/html; charset=utf-8",
      );

      const report = await createConsultationReport({
        ownerId: ctx.user.id,
        shareSlug,
        title: input.title,
        candidateName: input.candidateName || null,
        memo: input.memo || null,
        revenueInputsJson: JSON.stringify(input.revenueInputs),
        costInputsJson: JSON.stringify(input.costInputs),
        revenueSummaryJson: JSON.stringify(input.revenueSummary),
        openingSummaryJson: JSON.stringify(input.openingSummary),
        reportHtmlKey: stored.key,
        reportHtmlUrl: stored.url,
      });

      return serializeReport(report);
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const reports = await listConsultationReportsByOwner(ctx.user.id);
      return reports.map(serializeReport);
    }),
    getBySlug: publicProcedure
      .input(z.object({ shareSlug: z.string().min(8).max(32) }))
      .query(async ({ input }) => {
        const report = await getConsultationReportBySlug(input.shareSlug);
        if (!report) {
          throw new TRPCError({ code: "NOT_FOUND", message: "리포트를 찾을 수 없습니다." });
        }
        return serializeReport(report);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => deleteConsultationReport(input.id, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
