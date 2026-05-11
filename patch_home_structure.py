from pathlib import Path

home_path = Path('client/src/pages/Home.tsx')
text = home_path.read_text(encoding='utf-8')
store_snippet = Path('/tmp/store_snippet.txt').read_text(encoding='utf-8').replace('\n// count: 55\n', '\n')

# Replace imports that are only used by the removed assumptions section.
text = text.replace('  BadgePercent,\n', '')
text = text.replace('  ClipboardCheck,\n', '')
text = text.replace('  LayoutDashboard,\n', '')
text = text.replace('  Utensils,\n', '')

old_stores_start = text.index('const BENCHMARK_STORES = [')
old_stores_end = text.index('];', old_stores_start) + 3
text = text[:old_stores_start] + store_snippet + text[old_stores_end:]

text = text.replace(
'''        <nav>
          <a href="#revenue">매출 손익</a>
          <a href="#cost">개설비용</a>
          <a href="#assumptions">자료 기준</a>
        </nav>''',
'''        <nav>
          <a href="#nearby">인근매장 조회</a>
          <a href="#revenue">목표 매출</a>
          <a href="#cost">창업 비용</a>
        </nav>'''
)

text = text.replace(
'''              <a href="#revenue" className="primary-cta">매출 시뮬레이션 시작 <ArrowRight size={18} /></a>
              <a href="#cost" className="secondary-cta">개설비용 보기</a>''',
'''              <a href="#nearby" className="primary-cta">상담 흐름 시작 <ArrowRight size={18} /></a>
              <a href="#revenue" className="secondary-cta">목표 매출 입력</a>'''
)

text = text.replace(
'''          {[
            { no: "1첩", title: "목표 매출 입력", text: "평균·중앙값·목표값 프리셋으로 상담 시작점을 빠르게 잡습니다." },
            { no: "2첩", title: "비용 구조 계산", text: "물류비, 플랫폼 수수료, 인건비, 고정비를 한 장의 손익표로 정리합니다." },
            { no: "3첩", title: "개설비용 리포트", text: "평수·간판·홀 테이블 수에 따라 초기 투자비를 즉시 비교합니다." },
          ].map((item) => (''',
'''          {[
            { no: "1첩", title: "인근매장 매출 조회", text: "후보 상권 주변의 참고 매출을 먼저 확인하는 단계입니다. 현재 기능은 개발중으로 안내합니다." },
            { no: "2첩", title: "목표 매출 입력", text: "수도권 매장 통계와 채널 믹스를 참고해 목표 월매출과 손익 구조를 계산합니다." },
            { no: "3첩", title: "창업 비용 계산", text: "평수·간판·홀 테이블 수에 따라 초기 투자비와 프로모션 차감액을 비교합니다." },
          ].map((item) => ('''
)

nearby_section = '''
        <section id="nearby" className="workspace-section nearby-section">
          <SectionHeader
            eyebrow="01 · 인근매장 매출 조회"
            title="상담 시작점은 후보 상권 주변 매출 확인입니다"
            description="주소나 상권을 입력해 인근 삼첩분식 매장 매출을 조회하는 기능을 준비 중입니다. 현재 화면에서는 상담 흐름상 첫 단계의 목적과 상태를 명확히 안내합니다."
          />

          <article className="development-card">
            <span className="status-pill">개발중</span>
            <div>
              <h3>인근매장 매출 조회 기능</h3>
              <p>
                상담자는 이 단계에서 후보 점포 주변의 참고 매장, 지역, 월평균 환산 매출을 확인한 뒤 2첩의 목표 매출 입력으로 이동하게 됩니다.
              </p>
            </div>
            <a href="#revenue" className="secondary-cta">2첩 목표 매출 입력으로 이동</a>
          </article>
        </section>

'''
text = text.replace('        <section id="revenue" className="workspace-section revenue-section">', nearby_section + '        <section id="revenue" className="workspace-section revenue-section">')

text = text.replace('eyebrow="01 · 매출 시뮬레이션"', 'eyebrow="02 · 목표 매출 입력"')
text = text.replace('title="목표 월매출을 움직이면 손익 구조가 즉시 바뀝니다"', 'title="목표 월매출을 입력하면 손익 구조가 즉시 계산됩니다"')
text = text.replace('description="기본값은 내부 목표매출 산정자료의 3,234만원이며, 수도권 55개 매장 통계 프리셋을 함께 제공합니다."', 'description="1첩에서 확인한 인근매장 참고 매출을 바탕으로 목표 월매출을 정하고, 수도권 55개 매장 통계 프리셋과 손익표를 함께 확인합니다."')
text = text.replace('<h3>1첩 · 입력값</h3>', '<h3>2첩 · 목표 매출 입력</h3>')
text = text.replace('<p>매출과 운영 조건을 조정하세요.</p>', '<p>목표 매출과 운영 조건을 조정하세요.</p>')
text = text.replace('<span className="tiny-label">2첩 · 손익 리포트</span>', '<span className="tiny-label">2첩 · 손익 계산</span>')
text = text.replace('<h3>월 손익 예상</h3>', '<h3>목표 매출 손익 리포트</h3>')

text = text.replace('eyebrow="02 · 개설비용 시뮬레이션"', 'eyebrow="03 · 창업 비용 계산"')
text = text.replace('title="평수와 홀 구성에 따라 초기 투자비를 다시 계산합니다"', 'title="평수와 홀 구성에 따라 창업 비용을 계산합니다"')
text = text.replace('description="본사비용 면제 항목은 정상가와 차감액을 분리하여, 상담자가 프로모션 효과를 명확히 설명할 수 있게 구성했습니다."', 'description="2첩에서 정한 목표 매출 이후 실제 창업 검토 단계로 이어지도록, 본사비용 면제 항목과 현장 투자 항목을 분리해 보여줍니다."')
text = text.replace('<h3>3첩 · 개설 조건</h3>', '<h3>3첩 · 창업 조건</h3>')
text = text.replace('<span className="tiny-label">개설비용 리포트</span>', '<span className="tiny-label">3첩 · 창업 비용 리포트</span>')

assumption_start = text.index('        <section id="assumptions" className="assumption-section">')
assumption_end = text.index('        </section>', assumption_start) + len('        </section>\n')
text = text[:assumption_start] + text[assumption_end:]

home_path.write_text(text, encoding='utf-8')
