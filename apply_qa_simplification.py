from __future__ import annotations

import re
from pathlib import Path

root = Path('/home/ubuntu/samcheop-v1-simulator')
home_path = root / 'client/src/pages/Home.tsx'
app_path = root / 'client/src/App.tsx'
css_path = root / 'client/src/index.css'

home = home_path.read_text(encoding='utf-8')

home = re.sub(
    r'import \{ useEffect, useMemo, useState \} from "react";\n'
    r'import \{ useAuth \} from "@/_core/hooks/useAuth";\n'
    r'import \{ getLoginUrl \} from "@/const";\n'
    r'import \{ trpc \} from "@/lib/trpc";\n'
    r'import \{ toast \} from "sonner";\n'
    r'import \{.*?\} from "lucide-react";\n',
    '''import { useMemo, useState } from "react";
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
''',
    home,
    count=1,
    flags=re.S,
)

home = re.sub(
    r'const BENCHMARK_STORES = \[.*?\];\n',
    '''const BENCHMARK_STORES = [
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
''',
    home,
    count=1,
    flags=re.S,
)

home = re.sub(r'type SimulatorShareState = \{.*?\};\n\n', '', home, count=1, flags=re.S)
home = re.sub(
    r'const isRecord = .*?\n\nfunction calculatePlatformFee',
    '''const formatInputValue = (value: number) => {
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

function calculatePlatformFee''',
    home,
    count=1,
    flags=re.S,
)

home = re.sub(
    r'        <input\n          type="number"\n          value=\{Number\.isInteger\(value\) \? value : value\.toFixed\(1\)\}\n          min=\{min\}\n          max=\{max\}\n          step=\{step\}\n          onChange=\{\(event\) => onChange\(Number\(event\.target\.value\)\)\}\n        />',
    '''        <input
          type="text"
          inputMode="decimal"
          value={formatInputValue(value)}
          aria-label={`${label} 직접 입력`}
          onChange={(event) => onChange(parseFormattedNumber(event.target.value))}
        />''',
    home,
    count=1,
)

home = re.sub(
    r'  const \[reportTitle.*?const reportsQuery = trpc\.reports\.list\.useQuery\(undefined, \{ enabled: isAuthenticated \}\);\n\n'
    r'  useEffect\(\(\) => \{.*?\n  \}, \[\]\);\n\n'
    r'  const saveReportMutation = trpc\.reports\.save\.useMutation\(\{.*?\n  \}\);\n',
    '',
    home,
    count=1,
    flags=re.S,
)

home = re.sub(r'\n  const buildReportPayload = \(\) => \(\{.*?\n  \};\n\n(?=  const handlePrint)', '\n', home, count=1, flags=re.S)
home = re.sub(r'\n  const handleCopyShare = async \(\) => \{.*?\n  \};\n\n(?=  return \()', '\n', home, count=1, flags=re.S)

replacements = {
    'aria-label="삼첩분식 v1 시뮬레이터 홈"': 'aria-label="삼첩분식 창업 상담 시뮬레이터 홈"',
    '<b>삼첩분식 v1</b>': '<b>삼첩분식 상담 계산기</b>',
    '<small>Franchise Simulator</small>': '<small>Franchise Counseling</small>',
    '삼첩분식 창업 상담용 v1': '삼첩분식 창업 상담용',
    'v1 삼첩분식 엑셀 자료의 목표매출 산정식, 수도권 매장 매출 통계, 예상 개설비용 항목을 바탕으로 상담 현장에서 바로 설명 가능한 손익·투자비 리포트를 구성했습니다.': '삼첩분식 상담 자료의 목표매출 산정식, 수도권 매장 매출 통계, 예상 개설비용 항목을 바탕으로 상담 현장에서 바로 설명 가능한 손익·투자비 리포트를 구성했습니다.',
    'description="기본값은 v1 목표매출 산정자료의 3,234만원이며, 수도권 55개 매장 통계 프리셋을 함께 제공합니다."': 'description="기본값은 목표매출 산정자료의 3,234만원이며, 수도권 55개 매장 통계 프리셋을 함께 제공합니다."',
    '식자재율 36%, 포장재율 4%, 로열티 11만원, 기본 파트타이머 2.5명 등 v1 자료의 핵심 가정을 그대로 노출해 상담 신뢰도를 높입니다.': '식자재율 36%, 포장재율 4%, 로열티 11만원, 기본 파트타이머 2.5명 등 핵심 가정을 화면에 함께 보여 상담 신뢰도를 높입니다.',
    '<h2>v1 엑셀 자료와 브랜드 조사를 결합한 상담용 초안입니다</h2>': '<h2>매장 실적 자료와 브랜드 조사를 결합한 상담용 계산기입니다</h2>',
    '본 화면은 v1 자료의 수치를 웹 계산기로 옮긴 1차 구현입니다. 실제 계약·견적·수익 보장을 의미하지 않으며, 가맹 상담 시 후보 상권, 임대 조건, 오픈 프로모션, 배달 권역 정책에 따라 조정되어야 합니다.': '본 화면은 내부 상담 자료의 주요 수치를 웹 계산기로 옮긴 참고용 도구입니다. 실제 계약·견적·수익 보장을 의미하지 않으며, 가맹 상담 시 후보 상권, 임대 조건, 오픈 프로모션, 배달 권역 정책에 따라 조정되어야 합니다.',
    '배달앱별 중개·카드·배달비 구조를 v1 산정자료 기준으로 반영했습니다.': '배달앱별 중개·카드·배달비 구조를 상담 산정자료 기준으로 반영했습니다.',
    '<b>삼첩분식 v1 시뮬레이터</b>': '<b>삼첩분식 창업 상담 시뮬레이터</b>',
    '<span>자료 기반 내부 상담용 · v2 단막 구조 온보딩 후 삼첩분식 전용으로 재설계</span>': '<span>자료 기반 내부 상담용 · 계약·견적·수익 보장을 의미하지 않는 참고 계산기</span>',
}
for old, new in replacements.items():
    home = home.replace(old, new)

home = home.replace(
    '          <a href="#assumptions">자료 기준</a>\n          <button type="button" className="topbar-action" onClick={() => setShowSavedReports(true)}>저장 리포트</button>\n',
    '          <a href="#assumptions">자료 기준</a>\n',
)

home = re.sub(
    r'              <div className="report-save-card no-print">.*?              </div>\n            </section>',
    '''              <div className="report-save-card no-print">
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
            </section>''',
    home,
    count=1,
    flags=re.S,
)

start = home.find('      {showSavedReports && (')
if start != -1:
    end = home.rfind('\n    </div>')
    if end == -1:
        raise SystemExit('Home closing div not found while removing saved report modal')
    home = home[:start] + home[end:]

home_path.write_text(home, encoding='utf-8')

app = app_path.read_text(encoding='utf-8')
app = app.replace('Samcheop v1.', 'Samcheop franchise counseling.')
app = app.replace('import SharedReport from "./pages/SharedReport";\n', '')
app = app.replace('      <Route path={"/report/:shareSlug"} component={SharedReport} />\n', '')
app_path.write_text(app, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
css = css.replace('Samcheop v1.', 'Samcheop franchise counseling.')
css = css.replace(
    '''  body {
    @apply bg-background text-foreground;
    margin: 0;
    font-family: "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
''',
    '''  body {
    @apply bg-background text-foreground;
    margin: 0;
    font-family: "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    word-break: keep-all;
    overflow-wrap: break-word;
''',
)
css = css.replace('font-family: "Black Han Sans", "Noto Sans KR", sans-serif;', 'font-family: "Noto Sans KR", system-ui, sans-serif;\n  font-weight: 900;')
css = css.replace('letter-spacing: -0.035em;', 'letter-spacing: -0.045em;\n  word-break: keep-all;', 1)
css = css.replace('font-size: clamp(3rem, 8vw, 6.9rem);\n  line-height: 0.92;', 'font-size: clamp(2.8rem, 7.2vw, 6rem);\n  line-height: 1.04;', 1)
css = css.replace('.field-card input[type="number"]', '.field-card input[type="text"]')
css = css.replace('overflow-wrap: anywhere;', 'overflow-wrap: break-word;')
if '.report-save-card p {' not in css:
    css += '''
.report-save-card p {
  margin: 0.55rem 0 0;
  color: var(--sam-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.6;
}
'''
css_path.write_text(css, encoding='utf-8')
