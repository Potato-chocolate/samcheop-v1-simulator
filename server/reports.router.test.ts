import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createConsultationReport: vi.fn(),
  deleteConsultationReport: vi.fn(),
  getConsultationReportBySlug: vi.fn(),
  listConsultationReportsByOwner: vi.fn(),
  storagePut: vi.fn(),
  nanoid: vi.fn(() => "share-slug-for-test-12345"),
}));

vi.mock("nanoid", () => ({ nanoid: mocks.nanoid }));

vi.mock("./storage", () => ({
  storagePut: mocks.storagePut,
}));

vi.mock("./db", () => ({
  createConsultationReport: mocks.createConsultationReport,
  deleteConsultationReport: mocks.deleteConsultationReport,
  getConsultationReportBySlug: mocks.getConsultationReportBySlug,
  listConsultationReportsByOwner: mocks.listConsultationReportsByOwner,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const user: AuthenticatedUser = {
  id: 7,
  openId: "report-user",
  email: "report@example.com",
  name: "Report User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  lastSignedIn: new Date("2026-01-01T00:00:00.000Z"),
};

function createContext(): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const revenueInputs = {
  monthlySales: 32344100,
  avgOrder: 20000,
  rent: 500000,
  fullTime: 0,
  partTime: 2.5,
  mode: "hybrid" as const,
};

const costInputs = {
  area: 12,
  signType: "flex" as const,
  tableCount: 6,
  mode: "hybrid" as const,
  showWaivedFees: true,
};

const revenueSummary = {
  monthlySales: 32344100,
  logistics: 12937640,
  ingredients: 11643876,
  packaging: 1293764,
  platformTotal: 6750000,
  labor: 1970000,
  fixed: 1237000,
  royalty: 110000,
  totalCost: 23004640,
  profit: 9449460,
  margin: 0.2921,
  dailySales: 1063950,
  monthlyOrders: 1617,
  bepSales: 17500000,
};

const openingSummary = {
  area: 12,
  headquartersGross: 7900000,
  headquartersDiscount: 7900000,
  headquartersNet: 0,
  interior: 12000000,
  sign: 700000,
  internalSigns: 1000000,
  kitchen: 8000000,
  utensils: 2100000,
  hallFurniture: 1450000,
  hallOperatingItems: 650000,
  gross: 33800000,
  net: 25900000,
  vatGuide: 2590000,
  grandTotalWithVatGuide: 28490000,
  seats: 12,
};

function createReportRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 31,
    ownerId: user.id,
    shareSlug: "share-slug-for-test-12345",
    title: "삼첩분식 상담 리포트",
    candidateName: "홍길동 예비점주",
    memo: "임대료 재확인 필요",
    revenueInputsJson: JSON.stringify(revenueInputs),
    costInputsJson: JSON.stringify(costInputs),
    revenueSummaryJson: JSON.stringify(revenueSummary),
    openingSummaryJson: JSON.stringify(openingSummary),
    reportHtmlKey: "samcheop-v1-reports/7/share-slug-for-test-12345.html",
    reportHtmlUrl: "/manus-storage/samcheop-v1-reports/7/share-slug-for-test-12345.html",
    createdAt: new Date("2026-05-10T00:00:00.000Z"),
    updatedAt: new Date("2026-05-10T00:00:00.000Z"),
    ...overrides,
  };
}

describe("reports router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.nanoid.mockReturnValue("share-slug-for-test-12345");
    mocks.storagePut.mockResolvedValue({
      key: "samcheop-v1-reports/7/share-slug-for-test-12345.html",
      url: "/manus-storage/samcheop-v1-reports/7/share-slug-for-test-12345.html",
    });
    mocks.createConsultationReport.mockResolvedValue(createReportRow());
    mocks.listConsultationReportsByOwner.mockResolvedValue([createReportRow()]);
    mocks.getConsultationReportBySlug.mockResolvedValue(createReportRow());
    mocks.deleteConsultationReport.mockResolvedValue({ success: true });
  });

  it("stores report HTML in storage and persists normalized report data", async () => {
    const caller = appRouter.createCaller(createContext());

    const saved = await caller.reports.save({
      title: "삼첩분식 상담 리포트",
      candidateName: "홍길동 예비점주",
      memo: "임대료 재확인 필요",
      origin: "https://example.manus.space",
      revenueInputs,
      costInputs,
      revenueSummary,
      openingSummary,
    });

    expect(mocks.storagePut).toHaveBeenCalledWith(
      "samcheop-v1-reports/7/share-slug-for-test-12345.html",
      expect.stringContaining("삼첩분식 창업 상담 리포트"),
      "text/html; charset=utf-8",
    );
    expect(mocks.createConsultationReport).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 7,
        shareSlug: "share-slug-for-test-12345",
        reportHtmlKey: "samcheop-v1-reports/7/share-slug-for-test-12345.html",
      }),
    );
    expect(saved?.revenueSummary.profit).toBe(9449460);
    expect(saved?.openingSummary.net).toBe(25900000);
  });

  it("lists only the authenticated owner's saved reports", async () => {
    const caller = appRouter.createCaller(createContext());

    const reports = await caller.reports.list();

    expect(mocks.listConsultationReportsByOwner).toHaveBeenCalledWith(7);
    expect(reports).toHaveLength(1);
    expect(reports[0]?.shareSlug).toBe("share-slug-for-test-12345");
  });

  it("serves a public report by share slug", async () => {
    const caller = appRouter.createCaller({ ...createContext(), user: undefined });

    const report = await caller.reports.getBySlug({ shareSlug: "share-slug-for-test-12345" });

    expect(mocks.getConsultationReportBySlug).toHaveBeenCalledWith("share-slug-for-test-12345");
    expect(report?.candidateName).toBe("홍길동 예비점주");
  });

  it("deletes a report with owner scoping", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.reports.delete({ id: 31 });

    expect(result).toEqual({ success: true });
    expect(mocks.deleteConsultationReport).toHaveBeenCalledWith(31, 7);
  });
});
