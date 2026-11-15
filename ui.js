// 《대입의 신》 UI 컨트롤러 · 모달 · 캔버스 루프 · 이벤트 핸들러
window.GameUI = (() => {
  const D = window.GameData;
  const E = window.GameEngine;
  const P = window.PixelArt;

  let state = E.loadState() || E.createInitialState();
  let tick = 0;
  let miniAnimId = null;

  // DOM 참조
  const mainCanvas = document.getElementById('main-viewport');
  const stageEl = document.getElementById('stage-content');
  const logCard = document.getElementById('log-card');
  const logList = document.getElementById('log-list');

  // 메인 캔버스 애니메이션 루프 (약 15fps 도트 감성)
  let lastFrame = 0;
  function animateViewport(ts) {
    if (ts - lastFrame > 65) {
      tick++;
      P.drawMainViewport(mainCanvas, state, tick);
      lastFrame = ts;
    }
    requestAnimationFrame(animateViewport);
  }
  requestAnimationFrame(animateViewport);

  // 대한민국 지도 핀 캔버스 직접 클릭 지원
  mainCanvas.addEventListener('click', (ev) => {
    if (state.phase !== 'char_district') return;
    const rect = mainCanvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width;
    const ny = (ev.clientY - rect.top) / rect.height;
    const hitId = P.getDistrictPinAt(nx, ny);
    if (hitId) {
      state.selectedDistrictId = hitId;
      render();
    }
  });

  // 상단 고정 상태 바 업데이트
  function updateStatusBar() {
    const periodEl = document.getElementById('badge-period');
    const schoolEl = document.getElementById('badge-school');
    const moneyEl = document.getElementById('val-money');
    const stamEl = document.getElementById('val-stamina');
    const stamBar = document.getElementById('bar-stamina');
    const mentEl = document.getElementById('val-mental');
    const mentBar = document.getElementById('bar-mental');
    const setukEl = document.getElementById('val-setuk');
    const gpaEl = document.getElementById('val-gpa');
    const btnShop = document.getElementById('btn-shop');
    const btnStats = document.getElementById('btn-stats');

    let periodText = '캐릭터 생성';
    if (state.phase === 'ms') {
      const names = ['중3 1학기 중간고사', '중3 1학기 기말고사', '중3 2학기 중간고사', '중3 2학기 기말고사'];
      periodText = names[state.msTurn] || '중3 고입 준비';
    } else if (state.phase === 'hs_apply') {
      periodText = '고등학교 입시 원서접수';
    } else if (state.phase === 'hs') {
      periodText = D.HS_TURNS[state.hsTurn]?.label || '고3 대입 준비';
    } else if (state.phase === 'susi') {
      periodText = '수시 6장 원서 접수';
    } else if (state.phase === 'jeongsi') {
      periodText = '정시 가·나·다군 원서 접수';
    } else if (state.phase === 'nsu_apply') {
      periodText = `${state.nsuCount + 1}수 학원/인강 선택`;
    } else if (state.phase === 'nsu') {
      periodText = D.NSU_TURNS[state.nsuTurn]?.label || 'N수 대입 정산';
    } else if (state.phase === 'ended') {
      periodText = '대입 최종 합격';
    }

    periodEl.textContent = periodText;
    let schoolText = '미배정';
    if (state.school) {
      schoolText = state.school.name;
      if (state.district?.id === 'daechi' && state.phase === 'hs') {
        schoolText += ` · 대치 ${state.daechiClass}반`;
      }
    } else if (state.middleSchool) {
      schoolText = state.middleSchool;
    }
    schoolEl.textContent = schoolText;

    moneyEl.textContent = `${state.money.toLocaleString()}만 원`;
    stamEl.textContent = Math.round(state.stamina);
    stamBar.style.width = `${state.stamina}%`;
    mentEl.textContent = Math.round(state.mental);
    mentBar.style.width = `${state.mental}%`;
    setukEl.textContent = state.phase.startsWith('char_') ? '-' : `${state.setuk}점`;
    gpaEl.textContent = state.cumulativeGpa ? `${state.cumulativeGpa}등급` : (state.msReports.length ? `중 ${state.msAvgRaw}점` : '-');

    const inGame = !state.phase.startsWith('char_');
    btnShop.style.display = inGame && state.phase !== 'ended' ? 'inline-flex' : 'none';
    btnStats.style.display = inGame ? 'inline-flex' : 'none';

    if (inGame && state.logs.length > 0) {
      logCard.style.display = 'block';
      logList.innerHTML = state.logs.slice(0, 8).map(l => `<li>${l}</li>`).join('');
    } else {
      logCard.style.display = 'none';
    }

    // 뷰포트 태그
    const tag = document.getElementById('viewport-overlay-tag');
    if (state.phase === 'char_district') {
      tag.style.display = 'block';
      tag.textContent = '지도 위의 핀을 클릭하거나 아래에서 학군을 선택하세요';
    } else if (state.school && state.phase === 'hs') {
      tag.style.display = 'block';
      tag.textContent = `${state.school.name} · ${state.majorName} 지망`;
    } else if (state.phase === 'nsu' && state.nsuAcademy) {
      tag.style.display = 'block';
      tag.textContent = `${state.nsuAcademy.name} (${state.isBansu ? '반수' : '재수'})`;
    } else {
      tag.style.display = 'none';
    }
  }

  // 로딩 모션 (순차 텍스트 & 프로그레스)
  function runLoadingSequence(title, steps, durationPerStep = 550) {
    return new Promise((resolve) => {
      const modal = document.getElementById('loading-modal');
      const titleEl = document.getElementById('loading-title');
      const stepEl = document.getElementById('loading-step');
      const barEl = document.getElementById('loading-progress-bar');

      titleEl.textContent = title;
      modal.style.display = 'flex';
      let i = 0;

      const advance = () => {
        if (i >= steps.length) {
          barEl.style.width = '100%';
          setTimeout(() => {
            modal.style.display = 'none';
            barEl.style.width = '0%';
            resolve();
          }, 220);
          return;
        }
        stepEl.textContent = steps[i];
        barEl.style.width = `${Math.round(((i + 1) / steps.length) * 100)}%`;
        i++;
        setTimeout(advance, durationPerStep);
      };
      advance();
    });
  }

  // 이벤트 · 면접 · 상담 · StudyGram 전용 팝업 모달 (기본 회색 -> 클릭 시 파란색 -> [선택 완료 →])
  function openChoiceModal({ title, subtitle, miniScene, studygramData, choices }) {
    return new Promise((resolve) => {
      const modal = document.getElementById('event-modal');
      const inner = document.getElementById('event-modal-inner');

      let html = '';
      if (studygramData) {
        html += `
          <div class="studygram-frame">
            <div class="sg-header">
              <span class="sg-logo">StudyGram</span>
              <span style="font-size:0.75rem;color:#64748B;">방금 전 · 서울 대치동</span>
            </div>
            <div class="sg-user-row">
              <span class="sg-avatar">${studygramData.avatar}</span>
              <span>${studygramData.handle}</span>
            </div>
            <div class="mini-canvas-wrap"><canvas id="event-mini-canvas" width="480" height="270"></canvas></div>
            <div class="sg-likes">좋아요 ${studygramData.likes}개</div>
            <div class="sg-caption">${studygramData.caption}</div>
            ${studygramData.dm ? `
              <div class="sg-dm-box">
                <div class="sg-dm-sender">📩 ${studygramData.handle}의 도발 DM</div>
                <div>"${studygramData.dm}"</div>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        html += `
          <h3 class="section-title">${title}</h3>
          <p class="section-desc">${subtitle}</p>
          <div class="mini-canvas-wrap"><canvas id="event-mini-canvas" width="480" height="270"></canvas></div>
        `;
      }

      html += `<div class="stack-1col" id="modal-choices-list">`;
      choices.forEach((c, idx) => {
        html += `
          <button type="button" class="modal-choice-btn" data-idx="${idx}">
            <span>${c.label}</span>
            ${c.desc ? `<span class="modal-choice-desc">${c.desc}</span>` : ''}
          </button>
        `;
      });
      html += `</div>`;
      html += `<button type="button" id="modal-confirm-btn" class="btn-primary" disabled>선택 완료 →</button>`;

      inner.innerHTML = html;
      modal.style.display = 'flex';

      const miniCanvas = document.getElementById('event-mini-canvas');
      let mTick = 0;
      if (miniAnimId) cancelAnimationFrame(miniAnimId);
      let lastM = 0;
      const loopMini = (ts) => {
        if (modal.style.display === 'none') return;
        if (ts - lastM > 70) {
          mTick++;
          P.drawEventMiniCanvas(miniCanvas, miniScene || 'default_event', mTick);
          lastM = ts;
        }
        miniAnimId = requestAnimationFrame(loopMini);
      };
      miniAnimId = requestAnimationFrame(loopMini);

      let selectedIdx = null;
      const btns = inner.querySelectorAll('.modal-choice-btn');
      const confirmBtn = document.getElementById('modal-confirm-btn');

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedIdx = parseInt(btn.dataset.idx, 10);
          confirmBtn.disabled = false;
        });
      });

      confirmBtn.addEventListener('click', () => {
        if (selectedIdx === null) return;
        modal.style.display = 'none';
        if (miniAnimId) cancelAnimationFrame(miniAnimId);
        resolve(choices[selectedIdx]);
      });
    });
  }

  // 단순 알림형 결과 모달
  function openInfoModal(title, bodyHtml, btnLabel = '확인 →') {
    return new Promise((resolve) => {
      const modal = document.getElementById('report-modal');
      const inner = document.getElementById('report-modal-inner');
      inner.innerHTML = `
        <h3 class="section-title" style="margin-bottom:8px;">${title}</h3>
        <div style="font-size:0.9rem;color:#334155;line-height:1.65;">${bodyHtml}</div>
        <button type="button" id="info-modal-ok" class="btn-primary">${btnLabel}</button>
      `;
      modal.style.display = 'flex';
      document.getElementById('info-modal-ok').addEventListener('click', () => {
        modal.style.display = 'none';
        resolve();
      });
    });
  }

  // 공식 성적표 모달 출력 (중학교 내신 / 고교 5등급제 내신 / KICE 성적통지표)
  function showReportModal(report) {
    return new Promise((resolve) => {
      const modal = document.getElementById('report-modal');
      const inner = document.getElementById('report-modal-inner');

      if (report.kind === 'ms') {
        inner.innerHTML = `
          <div class="school-report-sheet">
            <div class="school-report-title">${state.middleSchool} ${report.title}</div>
            <div style="font-size:0.82rem;color:#475569;margin-bottom:10px;display:flex;justify-content:space-between;">
              <span>성명: <strong>${state.playerName}</strong></span>
              <span>고입 예상 석차: <strong>상위 ${report.percentile}%</strong></span>
            </div>
            <table class="kice-table">
              <thead><tr><th>과목</th><th>원점수</th><th>성취도</th></tr></thead>
              <tbody>
                ${report.rows.map(r => `<tr><td>${r.name}</td><td><strong>${r.score}점</strong></td><td><strong>${r.achievement}</strong></td></tr>`).join('')}
              </tbody>
            </table>
            <div style="font-size:0.84rem;text-align:right;color:#1E293B;">전 과목 평균: <strong>${report.avgRaw}점</strong></div>
          </div>
          <button type="button" id="report-ok-btn" class="btn-primary">성적표 확인 완료 →</button>
        `;
      } else if (report.kind === 'hs_school') {
        inner.innerHTML = `
          <div class="school-report-sheet">
            <div class="school-report-title">${report.schoolName} · ${report.title}</div>
            <div style="font-size:0.82rem;color:#475569;margin-bottom:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
              <span>성명: <strong>${state.playerName}</strong></span>
              <span>전략 결과: <strong>${report.note}</strong></span>
            </div>
            <table class="kice-table">
              <thead><tr><th>이수 과목 (2022 개정)</th><th>성취도</th><th>석차등급 (5등급제)</th></tr></thead>
              <tbody>
                ${report.rows.map(r => `
                  <tr>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.achievement}</td>
                    <td class="grade-badge-${r.grade}">${r.grade}등급</td>
                  </tr>`).join('')}
              </tbody>
            </table>
            <div style="font-size:0.86rem;display:flex;justify-content:space-between;margin-top:8px;">
              <span>이번 시험 평균: <strong>${report.semAvg}등급</strong></span>
              <span>누적 내신 등급: <strong style="color:#2563EB;">${report.cumulativeGpa}등급</strong></span>
            </div>
            ${report.rewardMsg ? `<div class="tag-chip good" style="margin-top:8px;display:inline-block;">🎉 ${report.rewardMsg}</div>` : ''}
          </div>
          <button type="button" id="report-ok-btn" class="btn-primary">성적표 확인 완료 →</button>
        `;
      } else {
        // KICE 공식 성적통지표 100% 재현
        const genderKor = state.gender === 'F' ? '여' : '남';
        const originSchool = state.nsuCount > 0 ? `${state.school?.name || '졸업'} (졸업)` : `${state.school?.name || ''} (3학년)`;
        inner.innerHTML = `
          <div class="kice-sheet">
            <div class="kice-watermark">
              <svg width="230" height="230" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="88" fill="none" stroke="#38BDF8" stroke-width="10"/>
                <circle cx="100" cy="100" r="66" fill="none" stroke="#38BDF8" stroke-width="4" stroke-dasharray="8 6"/>
                <text x="100" y="96" text-anchor="middle" fill="#0284C7" font-size="34" font-weight="900" font-family="sans-serif">KICE</text>
                <text x="100" y="126" text-anchor="middle" fill="#0284C7" font-size="13" font-weight="700" font-family="sans-serif">한국교육과정평가원</text>
              </svg>
            </div>
            <div class="kice-content">
              <div class="kice-title">${report.title}</div>
              <div class="kice-table-wrap">
                <table class="kice-table">
                  <thead>
                    <tr>
                      <th>수험번호</th><th>성명</th><th>생년월일</th><th>성별</th><th colspan="4">출신고교 (반 또는 졸업년도)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${state.examId}</td>
                      <td><strong>${state.playerName}</strong></td>
                      <td>${state.birthDate}</td>
                      <td>${genderKor}</td>
                      <td colspan="4">${originSchool}</td>
                    </tr>
                    <tr>
                      <th rowspan="2">구분</th>
                      <th rowspan="2">한국사<br>영역</th>
                      <th rowspan="2">국어<br>영역</th>
                      <th rowspan="2">수학<br>영역</th>
                      <th rowspan="2">영어<br>영역</th>
                      <th colspan="2">탐구 영역</th>
                      <th rowspan="2">제2외국어/<br>한문 영역</th>
                    </tr>
                    <tr>
                      <th>통합사회</th>
                      <th>통합과학</th>
                    </tr>
                    <tr>
                      <th>표준점수</th>
                      <td rowspan="2" class="kice-slash"></td>
                      <td><strong>${report.kor.std}</strong></td>
                      <td><strong>${report.math.std}</strong></td>
                      <td rowspan="2" class="kice-slash"></td>
                      <td><strong>${report.soc.std}</strong></td>
                      <td><strong>${report.sci.std}</strong></td>
                      <td rowspan="2">-</td>
                    </tr>
                    <tr>
                      <th>백분위</th>
                      <td>${report.kor.pct}</td>
                      <td>${report.math.pct}</td>
                      <td>${report.soc.pct}</td>
                      <td>${report.sci.pct}</td>
                    </tr>
                    <tr>
                      <th>등급</th>
                      <td><strong>${report.hist.grade}</strong></td>
                      <td><strong>${report.kor.grade}</strong></td>
                      <td><strong>${report.math.grade}</strong></td>
                      <td><strong>${report.eng.grade}</strong></td>
                      <td><strong>${report.soc.grade}</strong></td>
                      <td><strong>${report.sci.grade}</strong></td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              ${report.rewardMsg ? `<div class="tag-chip good" style="margin-bottom:6px;display:inline-block;">🎉 ${report.rewardMsg}</div>` : ''}
              <div class="kice-footer">
                <div class="kice-date">${report.date}</div>
                <div class="kice-sign-row">
                  <span class="kice-sign-text">한국교육과정평가원장</span>
                  <span class="kice-seal">한국교육<br>과정평가<br>원장인</span>
                </div>
              </div>
            </div>
          </div>
          <button type="button" id="report-ok-btn" class="btn-primary">성적통지표 확인 완료 →</button>
        `;
      }

      modal.style.display = 'flex';
      document.getElementById('report-ok-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        resolve();
      });
    });
  }

  // ------------------------------------------------------------------
  // 시험 직후 엄격한 순서 파이프라인 후속 이벤트 트리거
  // ------------------------------------------------------------------
  async function triggerPostReportEvent(contextType, turnMeta) {
    // 1. 고2 말 담임선생님 노선 확정 상담
    if (contextType === 'hs' && turnMeta?.postCounsel) {
      const gpa = state.cumulativeGpa || 2.5;
      const lastMock = state.mockHistory[state.mockHistory.length - 1];
      const choice = await openChoiceModal({
        title: '고2 말 담임선생님 진학 노선 확정 상담',
        subtitle: `현재 누적 내신 ${gpa}등급, 11월 학평 평균 백분위 ${lastMock?.avgPct || 75}%입니다. 고3 대입 최종 전략 노선을 확정하세요.`,
        miniScene: 'counseling',
        choices: [
          { id: 'susi', label: '수시 올인 트랙 (교과·학종·수능최저 사수)', desc: '고3 1학기 내신과 세특 심화에 화력을 집중합니다. (세특 +8, 멘탈 +5)' },
          { id: 'jeongsi', label: '정시 파이터 트랙 (수능 100% 직진 선언)', desc: '모의고사·수능 실전 스탯 보너스를 대폭 확보합니다. (정시 보정 +8, 수·과/국·사 성장)' },
          { id: 'balanced', label: '수시·정시 병행 밸런스 트랙', desc: '내신과 수능 최저를 동시에 챙기는 표준 전략입니다. (전 영역 +2, 멘탈 +3)' }
        ]
      });
      state.routeChoice = choice.id;
      if (choice.id === 'susi') { state.setuk = E.clamp(state.setuk + 8, 0, 100); state.mental = E.clamp(state.mental + 5, 0, 100); }
      else if (choice.id === 'jeongsi') { state.lastMockStatsBonus += 8; E.growStat(state, 'math', 3); E.growStat(state, 'kor', 3); }
      else { ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => E.growStat(state, k, 2)); state.mental = E.clamp(state.mental + 3, 0, 100); }
      E.addLog(state, `고2 말 진학 상담 완료: ${choice.label}`);
      return;
    }

    // 2. StudyGram 라이벌 도발 이벤트 (디지털 디톡스 중이면 차단)
    if (state.snsDetoxTurns <= 0 && Math.random() < 0.34) {
      const choice = await openChoiceModal({
        title: 'StudyGram 알림 도착',
        subtitle: '',
        miniScene: 'studygram',
        studygramData: {
          avatar: 'M',
          handle: 'study_king_minwoo',
          likes: 84,
          caption: '시대인재 서바이벌 수학 100점. 이번 6평도 만점 수렴한다 🔥 #대치동 #의대지망 #정시파이터',
          dm: '야 너 이번 시험 수학 킬러 틀렸다며? ㅋㅋ 난 3분 컷 했는데 긴장 좀 해라'
        },
        choices: [
          { id: 'ignore', label: '무시하고 조용히 오답노트를 편다', desc: '멘탈 +5, 국·수 스탯 +2' },
          { id: 'grind', label: '오기 발동! 잠 줄이고 새벽 3시까지 기출 양치기', desc: '수학·탐구 스탯 +6, 체력 -15, 멘탈 -5' },
          { id: 'detox', label: 'StudyGram 앱 삭제 및 디지털 디톡스 선언', desc: '멘탈 +18, 향후 3턴간 SNS 스트레스 완전 차단' }
        ]
      });
      if (choice.id === 'ignore') {
        state.mental = E.clamp(state.mental + 5, 5, 100);
        E.growStat(state, 'kor', 2); E.growStat(state, 'math', 2);
      } else if (choice.id === 'grind') {
        E.growStat(state, 'math', 6); E.growStat(state, 'sci', 3); E.growStat(state, 'soc', 3);
        state.stamina = E.clamp(state.stamina - 15, 5, 100);
        state.mental = E.clamp(state.mental - 5, 5, 100);
      } else {
        state.mental = E.clamp(state.mental + 18, 5, 100);
        state.snsDetoxTurns = 3;
      }
      E.addLog(state, `StudyGram 대응: ${choice.label}`);
      return;
    }

    // 3. 대치동 단과 S반 레벨테스트 (승강고사)
    if (state.district?.id === 'daechi' && contextType === 'hs' && Math.random() < 0.30) {
      const choice = await openChoiceModal({
        title: '대치동 단과 S반 레벨테스트 (승강고사)',
        subtitle: `현재 소속: 대치동 단과 ${state.daechiClass}반. 이번 승강 테스트 기준 미달 시 A반으로 강등될 위기입니다!`,
        miniScene: 'level_test',
        choices: [
          { id: 'cram_s', label: '자존심을 걸고 특강 추가 결제 + 밤샘 대비 (-40만 원)', desc: 'S반 승급/유지 확률 대폭 상승, 체력 -14' },
          { id: 'accept_a', label: '강등 감수하고 학교 내신 기본기에 집중한다', desc: '비용 절감, 멘탈 -6, 학교 내신 안정' }
        ]
      });
      if (choice.id === 'cram_s') {
        state.money = Math.max(0, state.money - 40);
        state.stamina = E.clamp(state.stamina - 14, 5, 100);
        const pass = (state.stats.math + state.stats.kor) / 2 >= 46 || Math.random() < 0.72;
        state.daechiClass = pass ? 'S' : 'A';
        E.growStat(state, 'math', 3.5);
        E.addLog(state, pass ? '대치동 단과 승강고사 통과! S반 유지 성공!' : '승강고사 아쉽게 탈락... A반 배치');
      } else {
        state.daechiClass = 'A';
        state.mental = E.clamp(state.mental - 6, 5, 100);
        E.addLog(state, '대치동 단과 승강고사 포기 후 내신 집중 선택 (A반)');
      }
      return;
    }

    // 4. 교무실의 불길한 소문 / 시험 종료 3분 전 OMR 마킹 밀림
    if (contextType === 'hs' && Math.random() < 0.28) {
      if (Math.random() < 0.5) {
        const c = await openChoiceModal({
          title: '교무실의 불길한 소문 (기말고사 킬러 출제 예고)',
          subtitle: '수학 선생님이 다음 시험에서 프린트 외부의 극악 킬러 2문항을 출제한다고 공언했습니다.',
          miniScene: 'killer_rumor',
          choices: [
            { id: 'deep', label: '밤새 심화 변형 문제집을 파고든다', desc: '다음 킬러 문항 성공 확률 +15%, 체력 -12' },
            { id: 'safe', label: '기본 문항 실수 방어에 집중한다', desc: '멘탈 +6, 안정적 스탯 상승' }
          ]
        });
        if (c.id === 'deep') { state.killerPrepBonus = 0.15; state.stamina = E.clamp(state.stamina - 12, 5, 100); E.growStat(state, 'math', 3); }
        else { state.mental = E.clamp(state.mental + 6, 5, 100); E.growStat(state, 'math', 1.5); E.growStat(state, 'kor', 1.5); }
      } else {
        const c = await openChoiceModal({
          title: '시험 종료 3분 전 OMR 마킹 밀림 발견!',
          subtitle: '마킹을 1칸씩 밀려 쓴 것을 발견했습니다! 감독관의 종료 예고 방송이 울리고 있습니다.',
          miniScene: 'omr_panic',
          choices: [
            { id: 'replace', label: '초인적인 집중력으로 OMR 카드 교체 후 전면 재마킹', desc: '멘탈 높으면 위기 탈출(+보너스), 낮으면 미완성 감점 위험' },
            { id: 'partial', label: '아는 핵심 문항만이라도 화이트로 신속 수정한다', desc: '큰 참사는 막지만 소폭 감점' }
          ]
        });
        if (c.id === 'replace') {
          if (state.mental >= 55) {
            state.mental = E.clamp(state.mental + 6, 5, 100);
            E.addLog(state, '초인적 집중력으로 3분 만에 OMR 전면 교체 성공!');
          } else {
            state.mental = E.clamp(state.mental - 12, 5, 100);
            state.lastMockStatsBonus -= 3;
            E.addLog(state, 'OMR 교체 도중 종이 울려 일부 문항 마킹 미완성...');
          }
        } else {
          state.mental = E.clamp(state.mental - 4, 5, 100);
          E.addLog(state, '핵심 문항 위주로 신속히 OMR을 수정해 치명타를 방어했다.');
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // 화면 렌더링 (Phase 0 ~ Phase 5)
  // ------------------------------------------------------------------
  function render() {
    updateStatusBar();
    E.saveState(state);

    if (state.phase === 'char_district') renderCharDistrict();
    else if (state.phase === 'char_profile') renderCharProfile();
    else if (state.phase === 'char_stats') renderCharStats();
    else if (state.phase === 'ms') renderMiddlePhase();
    else if (state.phase === 'hs_apply') renderHsApplyPhase();
    else if (state.phase === 'hs') renderHighSchoolPhase();
    else if (state.phase === 'susi') renderSusiPhase();
    else if (state.phase === 'jeongsi') renderJeongsiPhase();
    else if (state.phase === 'nsu_apply') renderNsuApplyPhase();
    else if (state.phase === 'nsu') renderNsuPhase();
    else if (state.phase === 'ended') renderEndedPhase();
  }

  // Phase 0-1: 학군 선택 (지도 핀 + 상세 카드)
  function renderCharDistrict() {
    state.viewportScene = 'map';
    const d = D.DISTRICTS.find(x => x.id === state.selectedDistrictId) || D.DISTRICTS[0];

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">1단계. 시작 학군지 선택</h2>
        <p class="section-desc">상단 대한민국 지도의 핀을 누르거나 아래에서 시작할 지역을 선택하세요.</p>
        <div class="grid-2col">
          ${D.DISTRICTS.map(dist => `
            <button type="button" class="choice-card-btn ${dist.id === d.id ? 'selected' : ''}" data-dist="${dist.id}">
              <div class="choice-title">${dist.shortName}</div>
              <div class="choice-sub">매 턴 +${dist.allowance}만 원</div>
            </button>
          `).join('')}
        </div>
        <div class="district-detail-box">
          <div style="font-weight:800;font-size:0.98rem;color:#0F172A;">${d.name}</div>
          <div class="district-spec-grid">
            <div class="spec-cell">
              <div class="spec-cell-label">매 턴 기본 용돈</div>
              <div class="spec-cell-val">+${d.allowance}만 원</div>
            </div>
            <div class="spec-cell">
              <div class="spec-cell-label">사교육/학습 효율</div>
              <div class="spec-cell-val">${d.academyEff >= 0 ? '+' : ''}${Math.round(d.academyEff * 100)}%</div>
            </div>
            <div class="spec-cell">
              <div class="spec-cell-label">내신 경쟁 난이도</div>
              <div class="spec-cell-val">${d.diffLabel.split(' ')[0]}</div>
            </div>
          </div>
          <p style="font-size:0.82rem;color:#475569;"><strong>특징:</strong> ${d.specialNote}</p>
        </div>
        <button type="button" id="btn-confirm-dist" class="btn-primary">선택 완료: 이 지역에서 시작</button>
      </div>
    `;

    stageEl.querySelectorAll('[data-dist]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedDistrictId = btn.dataset.dist;
        render();
      });
    });

    document.getElementById('btn-confirm-dist').addEventListener('click', () => {
      state.district = d;
      state.advanceStudy = d.initAdvance;
      state.money = d.allowance;
      state.phase = 'char_profile';
      render();
    });
  }

  // Phase 0-2: 성별 · 희망 계열(위) · 세부 희망 학과(아래) (2열 그리드!)
  function renderCharProfile() {
    const fieldObj = D.FIELDS.find(f => f.id === state.fieldId) || D.FIELDS[1];
    if (!fieldObj.majors.includes(state.majorName)) {
      state.majorName = fieldObj.majors[0];
    }

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">2단계. 수험생 프로필 & 목표 학과 설정</h2>
        <p class="section-desc">성별과 희망 계열을 선택한 뒤, 아래 세부 희망 학과를 지정하세요.</p>

        <div class="input-row">
          <label style="font-size:0.84rem;font-weight:700;" for="player-name-input">학생 이름</label>
          <input id="player-name-input" class="text-input" type="text" maxlength="8" value="${state.playerName}" placeholder="이름 입력" />
        </div>

        <div class="sub-heading">성별 선택 (2열 그리드)</div>
        <div class="grid-2col">
          <button type="button" class="choice-card-btn ${state.gender === 'M' ? 'selected' : ''}" data-gender="M">
            <div class="choice-title">👦 남학생</div>
            <div class="choice-sub">남고/공학 배정 가능</div>
          </button>
          <button type="button" class="choice-card-btn ${state.gender === 'F' ? 'selected' : ''}" data-gender="F">
            <div class="choice-title">👧 여학생</div>
            <div class="choice-sub">여고/공학 배정 가능</div>
          </button>
        </div>

        <div class="sub-heading">희망 계열 선택 (위쪽 배치)</div>
        <div class="grid-2col">
          ${D.FIELDS.map(f => `
            <button type="button" class="choice-card-btn ${f.id === state.fieldId ? 'selected' : ''}" data-field="${f.id}">
              <div class="choice-title">${f.name}</div>
              <div class="choice-sub">${f.desc}</div>
            </button>
          `).join('')}
        </div>

        <div class="sub-heading">세부 희망 학과 선택 (아래쪽 배치)</div>
        <div class="grid-2col">
          ${fieldObj.majors.map(m => `
            <button type="button" class="choice-card-btn ${m === state.majorName ? 'selected' : ''}" data-major="${m}">
              <div class="choice-title">${m}</div>
              <div class="choice-sub">${fieldObj.name} 목표 모집단위</div>
            </button>
          `).join('')}
        </div>

        <button type="button" id="btn-to-stats" class="btn-primary">중학교 배정 & 초기 능력치 추첨 →</button>
      </div>
    `;

    const nameInput = document.getElementById('player-name-input');
    nameInput.addEventListener('input', (e) => {
      state.playerName = e.target.value.trim() || '김수험';
    });

    stageEl.querySelectorAll('[data-gender]').forEach(btn => {
      btn.addEventListener('click', () => { state.gender = btn.dataset.gender; render(); });
    });
    stageEl.querySelectorAll('[data-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.fieldId = btn.dataset.field;
        const f = D.FIELDS.find(x => x.id === state.fieldId);
        state.majorName = f.majors[0];
        render();
      });
    });
    stageEl.querySelectorAll('[data-major]').forEach(btn => {
      btn.addEventListener('click', () => { state.majorName = btn.dataset.major; render(); });
    });

    document.getElementById('btn-to-stats').addEventListener('click', () => {
      const ms = E.assignMiddleSchool(state.district, state.gender);
      state.middleSchool = ms.name;
      state.isIntlMiddle = ms.isIntl;
      state.candidates = E.generateCandidates(state.district.id);
      if (ms.isIntl) {
        state.candidates.forEach(c => { c.stats.kor += 14; c.stats.eng += 18; c.total += 32; });
        state.money = Math.max(0, state.money - 60);
      }
      state.selectedCandidateIdx = 0;
      state.phase = 'char_stats';
      render();
    });
  }

  // Phase 0-3: 중학교 배정 결과 + 초기 능력치 리롤 (3회 제한) + 집중 과목 지정
  function renderCharStats() {
    state.viewportScene = 'classroom';
    const selIdx = state.selectedCandidateIdx || 0;
    const focusList = [
      { key: 'kor', label: '국어 (+15%)' },
      { key: 'math', label: '수학 (+15%)' },
      { key: 'eng', label: '영어 (+15%)' },
      { key: 'soc', label: '사회 (+15%)' },
      { key: 'sci', label: '과학 (+15%)' }
    ];

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">3단계. 중학교 배정 & 초기 능력치 선택</h2>
        ${state.isIntlMiddle
          ? `<div class="tag-chip good" style="margin-bottom:10px;padding:6px 10px;">🎉 5% 히든 당첨! <strong>${state.middleSchool}</strong> 특별전형 합격! (국·영 대폭 보너스 / 학비 60만 원 차감)</div>`
          : `<p class="section-desc">거주 학군에 따라 <strong>${state.middleSchool}</strong>에 배정되었습니다. 능력치 합계는 모두 동일합니다.</p>`}

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="sub-heading" style="margin:0;">후보 능력치 선택</span>
          <button type="button" id="btn-reroll" class="icon-btn" ${state.rerollLeft <= 0 ? 'disabled' : ''}>🎲 다시 뽑기 (${state.rerollLeft}/3회 남음)</button>
        </div>

        <div class="stack-1col">
          ${state.candidates.map((c, idx) => `
            <div class="candidate-card ${idx === selIdx ? 'selected' : ''}" data-cand="${idx}">
              <div style="display:flex;justify-content:space-between;font-weight:700;font-size:0.9rem;">
                <span>후보 ${idx + 1}. ${c.title}</span>
                <span style="color:#64748B;font-size:0.8rem;">총합 ${c.total}</span>
              </div>
              <div class="stat-mini-bars">
                <div class="stat-mini-item"><span>국어</span><strong>${c.stats.kor}</strong></div>
                <div class="stat-mini-item"><span>수학</span><strong>${c.stats.math}</strong></div>
                <div class="stat-mini-item"><span>영어</span><strong>${c.stats.eng}</strong></div>
                <div class="stat-mini-item"><span>사회</span><strong>${c.stats.soc}</strong></div>
                <div class="stat-mini-item"><span>과학</span><strong>${c.stats.sci}</strong></div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="sub-heading">집중 육성 과목 지정 (성장률 영구 +15%)</div>
        <div class="grid-2col">
          ${focusList.map(f => `
            <button type="button" class="choice-card-btn ${state.focusSubject === f.key ? 'selected' : ''}" data-focus="${f.key}">
              <div class="choice-title">${f.label}</div>
            </button>
          `).join('')}
        </div>

        <button type="button" id="btn-start-ms" class="btn-primary">중학교 3학년 1학기 시작하기 →</button>
      </div>
    `;

    document.getElementById('btn-reroll').addEventListener('click', () => {
      if (state.rerollLeft <= 0) return;
      state.rerollLeft--;
      state.candidates = E.generateCandidates(state.district.id);
      if (state.isIntlMiddle) {
        state.candidates.forEach(c => { c.stats.kor += 14; c.stats.eng += 18; c.total += 32; });
      }
      render();
    });

    stageEl.querySelectorAll('[data-cand]').forEach(el => {
      el.addEventListener('click', () => {
        state.selectedCandidateIdx = parseInt(el.dataset.cand, 10);
        render();
      });
    });

    stageEl.querySelectorAll('[data-focus]').forEach(el => {
      el.addEventListener('click', () => {
        state.focusSubject = el.dataset.focus;
        render();
      });
    });

    document.getElementById('btn-start-ms').addEventListener('click', () => {
      state.stats = { ...state.candidates[selIdx].stats };
      state.phase = 'ms';
      state.season = 'spring';
      E.addLog(state, `${state.middleSchool} 3학년 입학! 목표: ${state.majorName}`);
      render();
    });
  }

  // Phase 1: 중학교 3학년 4턴 (가로 1단 스택)
  function renderMiddlePhase() {
    state.viewportScene = 'classroom';
    const turnNames = ['중3 1학기 중간고사', '중3 1학기 기말고사', '중3 2학기 중간고사', '중3 2학기 기말고사'];
    state.season = state.msTurn === 0 ? 'spring' : state.msTurn === 1 ? 'summer' : state.msTurn === 2 ? 'autumn' : 'winter';

    const actions = [
      {
        id: 'academy',
        title: '내신 올인 (단과·종합학원 집중반)',
        sub: '전 과목 내신 원점수 대폭 상승, 자금 45만 원 소모, 체력 -10',
        tags: [['내신 급상승', 'good'], ['-45만 원', 'warn'], ['체력 -10', 'bad']]
      },
      {
        id: 'self',
        title: '내신 올인 (자기주도 독학 & 기출 풀이)',
        sub: '비용 없이 전 과목 내신 원점수 안정적 상승, 멘탈 -8',
        tags: [['무료', 'blue'], ['안정 상승', 'good'], ['멘탈 -8', 'warn']]
      },
      {
        id: 'advance',
        title: '고등 심화 선행학습 (수학·과학 집중)',
        sub: '중학교 내신 보너스는 적지만 [선행학습도] 및 고등 수·과 잠재력 대폭 상승',
        tags: [['선행도 +14', 'blue'], ['특목·고1모고 핵심', 'good']]
      },
      {
        id: 'spec',
        title: '교내 대회·학생회·영재원 스펙 쌓기',
        sub: '비교과(봉사·출결·수상) 점수 대폭 상승 (특목·자사·IT 특성화고 합격률 보너스)',
        tags: [['비교과 스펙 급상승', 'good'], ['세특 +8', 'blue']]
      }
    ];

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">${turnNames[state.msTurn]} (${state.msTurn + 1}/4턴)</h2>
        <p class="section-desc">현재 고입 예상 석차: <strong>상위 ${state.msPercentile}%</strong> · 선행학습도: <strong>${state.advanceStudy}</strong> · 비교과 스펙: <strong>${state.msSpec}</strong></p>
        <div class="stack-1col">
          ${actions.map(a => `
            <button type="button" class="choice-card-btn" data-ms-act="${a.id}" ${a.id === 'academy' && state.money < 45 ? 'disabled' : ''}>
              <div class="choice-title">${a.title}</div>
              <div class="choice-sub">${a.sub}</div>
              <div class="choice-tags">${a.tags.map(([t, cls]) => `<span class="tag-chip ${cls}">${t}</span>`).join('')}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('[data-ms-act]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.msAct;
        state.viewportScene = 'exam';
        await runLoadingSequence('중학교 정기고사 응시 중...', [
          '시험지 배부 및 주의사항 확인 중...',
          '문제를 집중해서 풀고 있습니다...',
          'OMR 카드 검토 및 채점 중...'
        ], 420);

        const report = E.executeMiddleTurn(state, actId);
        state.viewportScene = 'classroom';
        await showReportModal(report);

        if (state.msTurn >= 4) {
          // 겨울방학 고입 직전 점검 이벤트
          const ev = await openChoiceModal({
            title: '겨울방학 고입 직전 최종 점검',
            subtitle: `최종 중학교 내신 평균 ${state.msAvgRaw}점, 석차 상위 ${state.msPercentile}%로 고등학교 원서 접수를 앞두고 있습니다.`,
            miniScene: 'counseling',
            choices: [
              { id: 'prep_interview', label: '예비 고1 구술 면접 & 자기소개서 다듬기', desc: '고입 면접 가산점 획득, 세특 +5' },
              { id: 'prep_hs', label: '고1 3월·6월 대비 고등 선행 총정리', desc: '선행도 +8, 국·수 기초 +2' }
            ]
          });
          if (ev.id === 'prep_interview') { state.msSpec += 10; state.setuk += 5; }
          else { state.advanceStudy += 8; E.growStat(state, 'kor', 2); E.growStat(state, 'math', 2); }
          state.phase = 'hs_apply';
        }
        render();
      });
    });
  }

  // Phase 2: 고등학교 입시 원서 접수 (특목·자사·IT·비평준화 vs 평준화 일반고 1·2지망)
  let hsApplyTab = 'special'; // 'special' | 'general'
  let hsGeneralChoice1 = null;
  let hsGeneralChoice2 = null;

  function renderHsApplyPhase() {
    state.viewportScene = 'classroom';
    const dHighs = state.district.generalHighs.filter(h => h.gender === 'all' || h.gender === state.gender);
    if (!hsGeneralChoice1 || !dHighs.some(h => h.id === hsGeneralChoice1)) hsGeneralChoice1 = dHighs[0]?.id;
    if (!hsGeneralChoice2 || !dHighs.some(h => h.id === hsGeneralChoice2) || hsGeneralChoice2 === hsGeneralChoice1) {
      hsGeneralChoice2 = dHighs.find(h => h.id !== hsGeneralChoice1)?.id || dHighs[0]?.id;
    }

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">고등학교 입시 원서 접수</h2>
        <p class="section-desc">내신 평균 <strong>${state.msAvgRaw}점</strong> · 고입 석차 <strong>상위 ${state.msPercentile}%</strong> · 비교과 스펙 <strong>${state.msSpec}</strong></p>

        <div class="cert-tabs">
          <button type="button" class="cert-tab-btn ${hsApplyTab === 'special' ? 'active' : ''}" id="tab-hs-spec">전기·특목·자사·IT·비평준화 지원</button>
          <button type="button" class="cert-tab-btn ${hsApplyTab === 'general' ? 'active' : ''}" id="tab-hs-gen">후기 평준화 일반고 1·2지망 추첨</button>
        </div>

        ${hsApplyTab === 'special' ? `
          <div class="tag-chip warn" style="margin-bottom:10px;display:inline-block;">⚠️ 불합격 시 원거리 미달 일반고로 추가 배정됩니다 (매 턴 체력 -5, 멘탈 -20)</div>
          <div class="stack-1col">
            ${D.SPECIAL_HIGH_SCHOOLS.map(hs => `
              <button type="button" class="choice-card-btn" data-spec-hs="${hs.id}">
                <div class="choice-title">
                  <span>[${hs.category}] ${hs.name}</span>
                  <span class="tag-chip blue">상위 ${hs.maxPct}% 권장</span>
                </div>
                <div class="choice-sub"><strong>지원 조건:</strong> ${hs.reqText}</div>
                <div class="choice-sub" style="margin-top:2px;"><strong>학교 패시브:</strong> ${hs.passiveDesc}</div>
              </button>
            `).join('')}
          </div>
        ` : `
          <p class="section-desc">거주 학군(${state.district.shortName}) 내 1지망(65%) · 2지망(25%) · 임의배정(10%) 추첨을 진행합니다.</p>
          <div class="sub-heading">1지망 학교 선택 (배정 확률 65%)</div>
          <div class="stack-1col">
            ${dHighs.map(h => `
              <button type="button" class="choice-card-btn ${h.id === hsGeneralChoice1 ? 'selected' : ''}" data-g1="${h.id}">
                <div class="choice-title">${h.name}</div>
                <div class="choice-sub">${h.desc} (내신 난이도 gradeDiff ${h.gradeDiff >= 0 ? '+' : ''}${h.gradeDiff})</div>
              </button>
            `).join('')}
          </div>
          <div class="sub-heading">2지망 학교 선택 (배정 확률 25%)</div>
          <div class="stack-1col">
            ${dHighs.map(h => `
              <button type="button" class="choice-card-btn ${h.id === hsGeneralChoice2 ? 'selected' : ''}" data-g2="${h.id}" ${h.id === hsGeneralChoice1 ? 'disabled' : ''}>
                <div class="choice-title">${h.name}</div>
                <div class="choice-sub">${h.desc}</div>
              </button>
            `).join('')}
          </div>
          <button type="button" id="btn-run-lottery" class="btn-primary">평준화 일반고 추첨 배정 확인 →</button>
        `}
      </div>
    `;

    document.getElementById('tab-hs-spec').addEventListener('click', () => { hsApplyTab = 'special'; render(); });
    document.getElementById('tab-hs-gen').addEventListener('click', () => { hsApplyTab = 'general'; render(); });

    if (hsApplyTab === 'special') {
      stageEl.querySelectorAll('[data-spec-hs]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const hs = D.SPECIAL_HIGH_SCHOOLS.find(x => x.id === btn.dataset.specHs);
          await runLoadingSequence(`${hs.name} 입학 전형 진행 중`, [
            '1단계 서류 및 생기부 심사 중...',
            '2단계 영재성·구술 심층 면접 진행 중...'
          ], 600);

          const iv = await openChoiceModal({
            title: `${hs.name} 실전 압박 면접`,
            subtitle: '면접관들이 날카로운 질문을 던집니다. 어떻게 대응하시겠습니까?',
            miniScene: 'interview',
            choices: [
              { id: 'bold', label: '자신감 있게 핵심 개념과 탐구 과정을 논리적으로 답변한다', desc: '선행도·멘탈이 높을수록 큰 면접 가산점' },
              { id: 'humble', label: '모르는 부분은 솔직히 인정하고 입학 후 포부를 강조한다', desc: '안정적인 기본 면접 점수 확보' }
            ]
          });
          const ivBonus = iv.id === 'bold' ? (state.mental >= 65 ? 0.14 : 0.04) : 0.08;

          await runLoadingSequence('최종 합격자 사정 중', [
            '최종 합격자 사정 및 발표 대기 중...'
          ], 700);

          const res = E.evaluateSpecialHighSchool(state, hs, ivBonus);
          if (res.passed) {
            state.school = hs;
            state.schoolTier = 'special';
            await openInfoModal('🎉 고입 최종 합격!', `축하합니다! <strong>${hs.name}</strong>에 당당히 합격했습니다!<br><br>${hs.passiveDesc}`);
            E.addLog(state, `${hs.name} 합격! 고교 생활 시작`);
          } else {
            state.school = {
              id: 'fallback_far',
              name: `${state.district.shortName} 원거리 추가배정 일반고`,
              gradeDiff: 0.15,
              mockBonus: 2,
              hakjongBonus: 0.08
            };
            state.schoolTier = 'normal';
            state.commutePenalty = 5;
            state.mental = E.clamp(state.mental - 20, 5, 100);
            await openInfoModal('아쉬운 고입 불합격 및 추가 배정', `${hs.name} 전형에서 아쉽게 탈락했습니다.<br>지역 내 <strong>원거리 미달 일반고</strong>로 추가 배정되어 통학 시간 증가로 <strong>매 턴 체력 -5, 멘탈 -20</strong> 페널티를 받습니다.`);
            E.addLog(state, `${hs.name} 불합격 → 원거리 추가배정 일반고 진학`);
          }
          state.phase = 'hs';
          render();
        });
      });
    } else {
      stageEl.querySelectorAll('[data-g1]').forEach(b => b.addEventListener('click', () => { hsGeneralChoice1 = b.dataset.g1; render(); }));
      stageEl.querySelectorAll('[data-g2]').forEach(b => b.addEventListener('click', () => { hsGeneralChoice2 = b.dataset.g2; render(); }));
      document.getElementById('btn-run-lottery').addEventListener('click', async () => {
        await runLoadingSequence('평준화 일반고 배정 추첨 중', [
          '교육청 전산 배정 프로그램 가동 중...',
          '1·2지망 및 근거리 배정 결과 산출 중...'
        ], 550);
        const r = Math.random();
        let chosen;
        let msg;
        if (r < 0.65) {
          chosen = dHighs.find(h => h.id === hsGeneralChoice1) || dHighs[0];
          msg = '1지망 배정 성공! (65% 확률)';
        } else if (r < 0.90) {
          chosen = dHighs.find(h => h.id === hsGeneralChoice2) || dHighs[0];
          msg = '2지망 학교로 배정되었습니다. (25% 확률)';
        } else {
          const rest = dHighs.filter(h => h.id !== hsGeneralChoice1 && h.id !== hsGeneralChoice2);
          chosen = rest[0] || dHighs[dHighs.length - 1];
          msg = '3지망/임의 배정으로 배정되었습니다. (10% 확률)';
        }
        state.school = chosen;
        state.schoolTier = 'normal';
        await openInfoModal('고등학교 배정 결과 발표', `<strong>${msg}</strong><br>배정 학교: <strong>${chosen.name}</strong><br>${chosen.desc}`);
        E.addLog(state, `${chosen.name} 배정 완료 (${msg})`);
        state.phase = 'hs';
        render();
      });
    }
  }

  // Phase 3: 고등학교 1~3학년 18턴
  function renderHighSchoolPhase() {
    const turnObj = D.HS_TURNS[state.hsTurn];
    if (!turnObj) {
      state.phase = 'ended';
      render();
      return;
    }

    // 고2 진급 직전 수강신청
    if (turnObj.needCourse2 && !state.hs2CourseDone) {
      renderCourseSelection(2);
      return;
    }
    // 고3 진급 직전 수강신청
    if (turnObj.needCourse3 && !state.hs3CourseDone) {
      renderCourseSelection(3);
      return;
    }

    // 최종 발표 턴 처리
    if (turnObj.type === 'admissions') {
      state.phase = 'susi';
      render();
      return;
    }

    state.season = turnObj.season;
    if (state.district?.id === 'daechi' && Math.random() < 0.45) state.viewportScene = 'lecture';
    else state.viewportScene = 'classroom';

    if (turnObj.type === 'mid' || turnObj.type === 'fin') {
      const strategies = [
        {
          id: 'killer_gamble',
          title: '🔥 킬러 문항 & 변형 문제 도박 (하이리스크 하이리턴)',
          sub: '성공(45%+멘탈 보정) 시 최상위 1등급 컷 돌파 보너스(+12점) / 실패 시 기본 문항 실수로 원점수 하락(-8점)'
        },
        {
          id: 'core_focus',
          title: '🎯 핵심 권장과목 선택과 집중',
          sub: '희망 전공 핵심 과목 내신 보너스(+10점) 및 세특(+7) 상승 / 비주력 과목 내신 소폭 하락(-5점)'
        },
        {
          id: 'past_defense',
          title: '📘 기출·족보 완벽 분석 (안정 방어)',
          sub: '전 과목 안정적 상승(+5점), 실수 확률 최소화'
        },
        {
          id: 'setuk_soul',
          title: '📑 수행평가·세특 심화 보고서 영혼 갈아넣기',
          sub: '생기부(세특) 스탯 대폭 상승(+15), 학종 경쟁력 강화 / 체력 -18, 지필고사 점수 소폭 하락(-3점)'
        },
        {
          id: 'jeongsi_fighter',
          title: '⚡ 수능·모의고사 기출 집중 (정시 파이터 선언)',
          sub: '수능 실전 감각 및 모의고사 스탯 대폭 상승 / 학교 지필고사 내신 대폭 페널티(-18점)'
        }
      ];

      stageEl.innerHTML = `
        <div class="stage-card">
          <h2 class="section-title">${turnObj.label} (${state.hsTurn + 1}/18턴)</h2>
          <p class="section-desc">소속: <strong>${state.school.name}</strong> · 시험 전략을 선택하세요 (가로 1단 선택).</p>
          <div class="stack-1col">
            ${strategies.map(s => `
              <button type="button" class="choice-card-btn" data-hs-act="${s.id}">
                <div class="choice-title">${s.title}</div>
                <div class="choice-sub">${s.sub}</div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // 모의고사 / 평가원 모평 / 본수능 턴
      const mockActions = [
        { id: 'real_mock', title: '⏱️ 실전 모의고사 시간 배분 집중 훈련', sub: '전 영역 실전 감각 및 모의고사 점수 대폭 상승 (체력 -9)' },
        { id: 'past_analysis', title: '🔍 평가원·학평 기출 킬러 오답 정밀 분석', sub: '고난도 문항 대응력 강화 및 전 과목 균형 상승 (체력 -9)' },
        { id: 'weak_focus', title: '📚 취약 과목 집중 보완 학습', sub: '부족한 영역의 기초와 응용을 탄탄하게 보강합니다 (체력 -9)' },
        { id: 'rest_condition', title: '🛌 컨디션 회복 및 수험 멘탈 안정', sub: '체력 +25, 멘탈 대폭 회복 (학업 스탯 상승 없음)' }
      ];

      stageEl.innerHTML = `
        <div class="stage-card">
          <h2 class="section-title">${turnObj.label} (${state.hsTurn + 1}/18턴)</h2>
          <p class="section-desc">${turnObj.type === 'csat' ? '드디어 결전의 날! 2028학년도 대학수학능력시험 직전 최종 점검을 선택하세요.' : '전국 단위 모의고사를 앞두고 마지막 학습 방향을 선택하세요.'}</p>
          <div class="stack-1col">
            ${mockActions.map(a => `
              <button type="button" class="choice-card-btn" data-hs-act="${a.id}">
                <div class="choice-title">${a.title}</div>
                <div class="choice-sub">${a.sub}</div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    stageEl.querySelectorAll('[data-hs-act]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.hsAct;
        state.viewportScene = 'exam';
        const isExamMock = turnObj.type === 'mock' || turnObj.type === 'csat';
        await runLoadingSequence(
          turnObj.type === 'csat' ? '2028학년도 대학수학능력시험 응시 중...' : `${turnObj.label} 응시 중...`,
          isExamMock
            ? ['1교시 국어 · 2교시 수학 영역 응시 중...', '3교시 영어 · 4교시 한국사·통합사회·통합과학 응시 중...', '한국교육과정평가원 OMR 채점 및 성적 산출 중...']
            : ['시험지 배부 및 지필고사 진행 중...', 'OMR 답안 제출 및 5등급제 석차 산출 중...'],
          450
        );

        const report = E.executeHighSchoolTurn(state, actId);
        state.viewportScene = 'classroom';
        // 반드시 공식 성적표 모달 먼저 출력!
        await showReportModal(report);

        // 성적표 확인 후 후속 전환점/StudyGram 처리
        if (turnObj.openSusiAfter) {
          state.phase = 'susi';
          render();
          return;
        }
        if (turnObj.openResultsAfter) {
          await processPostCsatAdmissions();
          return;
        }

        await triggerPostReportEvent('hs', turnObj);
        render();
      });
    });
  }

  // 고2 / 고3 진급 직전 2022 개정 교육과정 선택과목 수강신청
  function renderCourseSelection(grade) {
    state.viewportScene = 'classroom';
    const fieldObj = D.FIELDS.find(f => f.id === state.fieldId);
    const isStem = fieldObj?.track === 'stem' || state.majorName === '수학교육과';

    if (grade === 2) {
      const tamPool = [...D.ELECTIVES_HS2.stemTamgu, ...D.ELECTIVES_HS2.humTamgu];
      stageEl.innerHTML = `
        <div class="stage-card">
          <h2 class="section-title">고2 진급 직전 선택과목 수강신청 (2022 개정)</h2>
          <p class="section-desc">목표 학과(<strong>${state.majorName}</strong>) 전공적합성 권장과목을 확인하고 2학년 1·2학기 과목을 신청하세요. (1학기: 문학·대수·영어Ⅰ / 2학기: 독서와 작문·수학선택·영어Ⅱ + 탐구 2과목)</p>
          <div class="tag-chip blue" style="margin-bottom:10px;display:inline-block;">
            ${isStem ? '💡 자연·의약학 권장: 미적분Ⅰ + 물리학/화학/생명과학/지구과학 중 2과목' : '💡 인문·상경 권장: 확률과 통계 + 사탐 2과목'}
          </div>

          <div class="sub-heading">2학년 2학기 수학 선택 (1학기 '대수' 공통)</div>
          <div class="stack-1col">
            ${D.ELECTIVES_HS2.mathSem2.map(m => `
              <button type="button" class="choice-card-btn ${state.hs2Courses.mathSem2 === m ? 'selected' : ''}" data-c2m="${m}">
                <div class="choice-title">${m}</div>
              </button>
            `).join('')}
          </div>

          <div class="sub-heading">2학년 탐구 2과목 선택 (현재 ${state.hs2Courses.tamgu.length}/2개 선택됨: ${state.hs2Courses.tamgu.join(', ')})</div>
          <div class="stack-1col">
            ${tamPool.map(t => `
              <button type="button" class="choice-card-btn ${state.hs2Courses.tamgu.includes(t) ? 'selected' : ''}" data-c2t="${t}">
                <div class="choice-title">${t}</div>
              </button>
            `).join('')}
          </div>

          <button type="button" id="btn-save-c2" class="btn-primary" ${state.hs2Courses.tamgu.length !== 2 ? 'disabled' : ''}>고2 수강신청 확정 →</button>
        </div>
      `;

      stageEl.querySelectorAll('[data-c2m]').forEach(b => b.addEventListener('click', () => { state.hs2Courses.mathSem2 = b.dataset.c2m; render(); }));
      stageEl.querySelectorAll('[data-c2t]').forEach(b => b.addEventListener('click', () => {
        const val = b.dataset.c2t;
        if (state.hs2Courses.tamgu.includes(val)) state.hs2Courses.tamgu = state.hs2Courses.tamgu.filter(x => x !== val);
        else if (state.hs2Courses.tamgu.length < 2) state.hs2Courses.tamgu.push(val);
        render();
      }));
      document.getElementById('btn-save-c2').addEventListener('click', () => {
        state.hs2CourseDone = true;
        E.addLog(state, `고2 수강신청 완료: ${state.hs2Courses.mathSem2}, ${state.hs2Courses.tamgu.join('·')}`);
        render();
      });
      return;
    }

    // 고3 수강신청
    const tamPool3 = [...D.ELECTIVES_HS3.stemTamgu, ...D.ELECTIVES_HS3.humTamgu];
    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">고3 진급 직전 진로·융합선택 수강신청 (2022 개정)</h2>
        <p class="section-desc">1학기(화법과 언어·수학1·영어 독해와 작문)와 2학기(주제탐구 독서·수학2·심화 영어)에 이수할 진로선택 과목을 확정하세요.</p>
        <div class="tag-chip blue" style="margin-bottom:10px;display:inline-block;">
          ${isStem ? '💡 자연·의약학 권장: 미적분Ⅱ / 기하 + 역학·물질·세포·유전 중 2과목' : '💡 인문·상경 권장: 확률과 통계 / 경제수학 + 사탐 진로 2과목'}
        </div>

        <div class="sub-heading">고3 수학 진로선택 트랙</div>
        <div class="stack-1col">
          ${D.ELECTIVES_HS3.mathPair.map(p => `
            <button type="button" class="choice-card-btn ${state.hs3Courses.mathPairId === p.id ? 'selected' : ''}" data-c3m="${p.id}">
              <div class="choice-title">${p.label}</div>
            </button>
          `).join('')}
        </div>

        <div class="sub-heading">고3 탐구 진로선택 2과목 (현재 ${state.hs3Courses.tamgu.length}/2개: ${state.hs3Courses.tamgu.join(', ')})</div>
        <div class="stack-1col">
          ${tamPool3.map(t => `
            <button type="button" class="choice-card-btn ${state.hs3Courses.tamgu.includes(t) ? 'selected' : ''}" data-c3t="${t}">
              <div class="choice-title">${t}</div>
            </button>
          `).join('')}
        </div>

        <button type="button" id="btn-save-c3" class="btn-primary" ${state.hs3Courses.tamgu.length !== 2 ? 'disabled' : ''}>고3 수강신청 확정 →</button>
      </div>
    `;

    stageEl.querySelectorAll('[data-c3m]').forEach(b => b.addEventListener('click', () => { state.hs3Courses.mathPairId = b.dataset.c3m; render(); }));
    stageEl.querySelectorAll('[data-c3t]').forEach(b => b.addEventListener('click', () => {
      const val = b.dataset.c3t;
      if (state.hs3Courses.tamgu.includes(val)) state.hs3Courses.tamgu = state.hs3Courses.tamgu.filter(x => x !== val);
      else if (state.hs3Courses.tamgu.length < 2) state.hs3Courses.tamgu.push(val);
      render();
    }));
    document.getElementById('btn-save-c3').addEventListener('click', () => {
      state.hs3CourseDone = true;
      E.addLog(state, `고3 수강신청 완료: ${state.hs3Courses.tamgu.join('·')}`);
      render();
    });
  }

  // Phase 4-1: 수시 6장 원서 접수 (가로 1단 스택 + 자동 6장 추천)
  function renderSusiPhase() {
    state.viewportScene = 'studycafe';
    const isItRestricted = state.school?.itRestricted;
    const eligibleUnis = D.UNIVERSITIES.filter(u => {
      if (!u.majors[state.majorName]) return false;
      if (isItRestricted && state.fieldId !== 'eng') return false;
      return true;
    });
    const pool = eligibleUnis.length > 0 ? eligibleUnis : D.UNIVERSITIES.filter(u => u.majors[state.majorName]);
    const isMed = D.FIELDS[0].majors.includes(state.majorName);

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">수시 6장 원서 접수 (${state.majorName})</h2>
        <div class="app-summary-bar">
          <div>내 누적 내신: <strong>${state.cumulativeGpa || '-'}등급</strong> · 세특: <strong>${state.setuk}점</strong></div>
          <div>선택: <strong>${state.susiApps.length}/6장</strong></div>
        </div>
        ${isItRestricted && state.fieldId !== 'eng' ? `<div class="tag-chip bad" style="margin-bottom:8px;">⚠️ IT 특성화고 출신으로 의약학·인문 교차지원 제한이 적용됩니다.</div>` : ''}
        <button type="button" id="btn-auto-susi" class="btn-secondary" style="margin-bottom:12px;">✨ AI 입시 컨설팅: 자동 6장 추천 채우기</button>

        <div class="stack-1col">
          ${pool.map(u => {
            const cut = (isMed && u.cutoffs.med) ? u.cutoffs.med : u.cutoffs.main;
            const gApp = state.susiApps.find(a => a.uniId === u.id && a.track === 'gyokwa');
            const hApp = state.susiApps.find(a => a.uniId === u.id && a.track === 'hakjong');
            return `
              <div class="choice-card-btn" style="cursor:default;">
                <div class="uni-row-head">
                  <div class="uni-svg-mini">${D.buildUniSvg(u)}</div>
                  <div style="flex:1;">
                    <div class="choice-title">${u.name} · ${u.majors[state.majorName]}</div>
                    <div class="choice-sub">수능최저: ${(isMed && u.medMin) ? u.medMin.desc : u.susiMin.desc}</div>
                  </div>
                </div>
                <div class="stack-1col" style="margin-top:8px;">
                  <button type="button" class="choice-card-btn ${gApp ? 'selected' : ''}" data-susi-uni="${u.id}" data-track="gyokwa">
                    <div class="choice-title"><span>학생부교과 전형 ${gApp ? '✓ 선택됨' : ''}</span><span>보수 ${cut.gyokwaCons} / 낙관 ${cut.gyokwaOpt}</span></div>
                  </button>
                  <button type="button" class="choice-card-btn ${hApp ? 'selected' : ''}" data-susi-uni="${u.id}" data-track="hakjong">
                    <div class="choice-title"><span>학생부종합 전형 ${hApp ? '✓ 선택됨' : ''}</span><span>보수 ${cut.hakjongCons} / 낙관 ${cut.hakjongOpt}</span></div>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button type="button" id="btn-submit-susi" class="btn-primary" ${state.susiApps.length === 0 ? 'disabled' : ''}>
          ${state.nsuCount > 0 ? '수시 원서 접수 완료 → 본수능으로 진행' : '수시 6장 원서 접수 완료 → 본수능(11월) 돌입'}
        </button>
      </div>
    `;

    document.getElementById('btn-auto-susi').addEventListener('click', () => {
      state.susiApps = E.buildAutoSusiRecommendations(state);
      render();
    });

    stageEl.querySelectorAll('[data-susi-uni]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uniId = btn.dataset.susiUni;
        const track = btn.dataset.track;
        const existsIdx = state.susiApps.findIndex(a => a.uniId === uniId && a.track === track);
        if (existsIdx >= 0) {
          state.susiApps.splice(existsIdx, 1);
        } else if (state.susiApps.length < 6) {
          state.susiApps.push({ uniId, track, majorName: state.majorName });
        }
        render();
      });
    });

    document.getElementById('btn-submit-susi').addEventListener('click', () => {
      E.addLog(state, `수시 원서 ${state.susiApps.length}장 접수 완료!`);
      if (state.nsuCount > 0) {
        state.phase = 'nsu';
      } else {
        // 고3 본수능 턴으로 이동
        state.hsTurn = D.HS_TURNS.findIndex(t => t.type === 'csat');
        state.phase = 'hs';
      }
      render();
    });
  }

  // 본수능 직후 수시 최종 발표 & 수시 납치/반수/재수/정시 분기
  async function processPostCsatAdmissions() {
    if (state.susiApps.length > 0) {
      await runLoadingSequence('수시모집 최종 사정 중...', [
        '1단계 학생부 서류 및 교과 등급 검증 중...',
        '2단계 수능 최저학력기준 충족 여부 대조 중...',
        '3단계 면접 및 최종 사정 중...'
      ], 650);

      state.susiResults = E.evaluateSusiApplications(state);
      const passedList = state.susiResults.filter(r => r.passed);

      if (passedList.length > 0) {
        // 수시 납치! 정시 지원 불가, 3가지 중 1개 선택
        const choices = [];
        passedList.forEach((p, idx) => {
          choices.push({
            id: `enroll_${idx}`,
            label: `🎓 [${p.uni.name} ${p.majorDisplay}] 최종 등록 및 입학 확정`,
            desc: `${p.track === 'gyokwa' ? '학생부교과' : '학생부종합'} · 합격통지서 발급 및 엔딩`,
            passObj: p
          });
        });
        choices.push({
          id: 'bansu',
          label: `🔄 [${passedList[0].uni.name}] 대학 걸어놓고 반수 도전 (6월 모평부터 N수 합류)`,
          desc: '반수 실패 시 이 대학으로 안전 복학 가능! (수시 납치 탈출 시도)',
          passObj: passedList[0]
        });
        choices.push({
          id: 'jaesu',
          label: '🔥 등록 포기 후 쌩재수 도전 (2월 정규반부터 7턴 풀코스)',
          desc: '합격증을 모두 내려놓고 처음부터 7턴 풀코스 정시·수시 재도전!'
        });

        const summaryHtml = state.susiResults.map(r =>
          `<div style="margin-bottom:4px;">${r.passed ? '✅' : '❌'} <strong>${r.uni.name} (${r.track === 'gyokwa' ? '교과' : '학종'})</strong>: ${r.reason}</div>`
        ).join('');

        const picked = await openChoiceModal({
          title: '수시 최종 합격 발표 (수시 납치 안내)',
          subtitle: `수시 ${passedList.length}관왕 달성! 원칙적으로 정시 지원 자격이 박탈됩니다.<br>${summaryHtml}`,
          miniScene: 'susi_wait',
          choices
        });

        if (picked.id.startsWith('enroll_')) {
          const p = picked.passObj;
          finalizeAdmission(p.uni, p.majorDisplay, '수시모집', p.track === 'gyokwa' ? '학생부교과전형' : '학생부종합전형');
          return;
        } else if (picked.id === 'bansu') {
          const p = picked.passObj;
          state.isBansu = true;
          state.bansuHoldAdmission = {
            uni: p.uni,
            uniId: p.uni.id,
            uniName: p.uni.name,
            majorName: p.majorDisplay,
            admissionType: p.track === 'gyokwa' ? '학생부교과전형' : '학생부종합전형'
          };
          state.nsuCount++;
          state.nsuTurn = 2; // 6월 모평 시점(Turn 3)부터 N수 합류
          state.susiApps = [];
          state.phase = 'nsu_apply';
          render();
          return;
        } else {
          // 쌩재수
          state.isBansu = false;
          state.bansuHoldAdmission = null;
          state.nsuCount++;
          state.nsuTurn = 0;
          state.susiApps = [];
          state.phase = 'nsu_apply';
          render();
          return;
        }
      } else {
        await openInfoModal('수시 6장 전멸... 정시 가·나·다군 개방',
          state.susiResults.map(r => `<div>❌ <strong>${r.uni.name}</strong>: ${r.reason}</div>`).join('') +
          `<br>수시 6장이 모두 불합격하여 <strong>정시 가·나·다군 원서 접수</strong>가 열렸습니다!`
        );
      }
    }

    state.phase = 'jeongsi';
    render();
  }

  // Phase 4-2: 정시 가·나·다군 원서 접수 (서울대 나군 단독 고증!)
  function renderJeongsiPhase() {
    state.viewportScene = 'studycafe';
    const csat = state.lastCsat;
    const isMed = D.FIELDS[0].majors.includes(state.majorName);

    const buildGroupList = (groupKor, groupKey) => {
      const unis = D.UNIVERSITIES.filter(u => u.jeongsiGroup === groupKor && u.majors[state.majorName]);
      const selectedId = state.jeongsiApps[groupKey]?.uniId;
      return `
        <div class="sub-heading">${groupKor}군 지원 대학 선택 ${groupKor === '나' ? '(※ 서울대학교는 오직 나군에서만 지원 가능)' : ''}</div>
        <div class="stack-1col">
          ${unis.length === 0 ? `<div class="choice-sub">해당 군에 개설된 목표 학과가 없습니다.</div>` : unis.map(u => {
            const cut = (isMed && u.cutoffs.med) ? u.cutoffs.med : u.cutoffs.main;
            return `
              <button type="button" class="choice-card-btn ${selectedId === u.id ? 'selected' : ''}" data-jg="${groupKey}" data-juni="${u.id}">
                <div class="uni-row-head">
                  <div class="uni-svg-mini">${D.buildUniSvg(u)}</div>
                  <div style="flex:1;">
                    <div class="choice-title">
                      <span>${u.name} · ${u.majors[state.majorName]}</span>
                      <span class="tag-chip blue">예상 컷 ${cut.jeongsiPct}%</span>
                    </div>
                    <div class="choice-sub">${u.jeongsiGpaWeight ? '※ 서울대 정시: 내신(교과역량평가) 반영' : '수능 100% 반영'}</div>
                  </div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      `;
    };

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">정시 가·나·다군 원서 접수</h2>
        <div class="app-summary-bar">
          <div>내 수능 평균 백분위: <strong>${csat?.avgPct || 0}%</strong> (국${csat?.kor.grade} 수${csat?.math.grade} 영${csat?.eng.grade} 사${csat?.soc.grade} 과${csat?.sci.grade})</div>
          <div>누적 내신: <strong>${state.cumulativeGpa || '-'}등급</strong></div>
        </div>
        ${buildGroupList('가', 'ga')}
        ${buildGroupList('나', 'na')}
        ${buildGroupList('다', 'da')}
        <button type="button" id="btn-submit-jeongsi" class="btn-primary">정시 가·나·다군 최종 지원 & 합격 발표 →</button>
      </div>
    `;

    stageEl.querySelectorAll('[data-jg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gk = btn.dataset.jg;
        const uid = btn.dataset.juni;
        if (state.jeongsiApps[gk]?.uniId === uid) state.jeongsiApps[gk] = null;
        else state.jeongsiApps[gk] = { uniId: uid };
        render();
      });
    });

    document.getElementById('btn-submit-jeongsi').addEventListener('click', async () => {
      if (!state.jeongsiApps.ga && !state.jeongsiApps.na && !state.jeongsiApps.da) {
        await openInfoModal('지원 대학 없음', '가·나·다군 중 최소 1개 대학을 선택하세요.');
        return;
      }
      await runLoadingSequence('정시 최초 및 추가합격 발표 대기 중...', [
        '수능 표준점수·백분위 반영비율 계산 중...',
        '서울대 교과역량평가 및 모집단위 사정 중...',
        '최종 추가합격 전화 대기 중...'
      ], 600);

      const results = E.evaluateJeongsiApplications(state);
      const passed = results.filter(r => r.passed);
      const summaryHtml = results.map(r => `<div>${r.passed ? '✅' : '❌'} <strong>[${r.group}] ${r.uni.name} ${r.majorDisplay}</strong>: ${r.reason}</div>`).join('');

      if (passed.length > 0) {
        const choices = passed.map((p, idx) => ({
          id: `jeong_${idx}`,
          label: `🎓 [${p.group}] ${p.uni.name} ${p.majorDisplay} 최종 등록`,
          desc: p.reason,
          p
        }));
        choices.push({
          id: 'retry_nsu',
          label: `🔥 등록 포기 후 ${state.nsuCount + 2}수 재도전`,
          desc: '더 높은 대학/학과를 목표로 N수 7턴 코스에 도전합니다.'
        });
        const picked = await openChoiceModal({
          title: '정시 합격 발표!',
          subtitle: summaryHtml,
          miniScene: 'susi_wait',
          choices
        });
        if (picked.id === 'retry_nsu') {
          state.nsuCount++;
          state.nsuTurn = 0;
          state.jeongsiApps = { ga: null, na: null, da: null };
          state.phase = 'nsu_apply';
          render();
          return;
        }
        finalizeAdmission(picked.p.uni, picked.p.majorDisplay, '정시모집', `일반전형 (${picked.p.group})`);
      } else {
        const retryChoices = [
          {
            id: 'nsu_go',
            label: `🔥 ${state.nsuCount + 2}수 도전하기 (N수 7턴 풀코스)`,
            desc: '시대인재·강남대성·러셀·잇올·인강 중 선택해 다시 수능을 준비합니다.'
          }
        ];
        if (state.bansuHoldAdmission) {
          retryChoices.unshift({
            id: 'return_hold',
            label: `🛡️ 걸어둔 대학(${state.bansuHoldAdmission.uniName} ${state.bansuHoldAdmission.majorName}) 안전 복학`,
            desc: '반수 도전을 마치고 기존 합격 대학으로 입학을 확정합니다.'
          });
        }
        const picked = await openChoiceModal({
          title: '정시 가·나·다군 최종 불합격...',
          subtitle: summaryHtml,
          miniScene: 'counseling',
          choices: retryChoices
        });
        if (picked.id === 'return_hold') {
          const h = state.bansuHoldAdmission;
          finalizeAdmission(h.uni, h.majorName, '수시모집', h.admissionType);
        } else {
          state.nsuCount++;
          state.nsuTurn = 0;
          state.isBansu = false;
          state.jeongsiApps = { ga: null, na: null, da: null };
          state.phase = 'nsu_apply';
          render();
        }
      }
    });
  }

  // Phase 5-1: N수 학원/인강 7개 브랜드 선택
  function renderNsuApplyPhase() {
    state.viewportScene = 'lecture';
    const prevAvg = state.lastCsat?.avgGrade || 3.0;
    const hasScholarship = prevAvg <= 1.6;
    state.tuitionDiscountRate = hasScholarship ? 0.5 : 0;

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">${state.isBansu ? '반수' : `${state.nsuCount + 1}수`} 학원 · 인강 선택 (7개 브랜드)</h2>
        <p class="section-desc">직전 수능 평균 등급: <strong>${prevAvg}등급</strong> ${hasScholarship ? '🎉 <strong>1.6등급 이내 성적 장학금 50% 감면 대상!</strong>' : ''}</p>
        <div class="stack-1col">
          ${D.NSU_ACADEMY_BRANDS.map(b => {
            const netCost = b.cost > 0 ? Math.round(b.cost * (1 - state.tuitionDiscountRate)) : 0;
            const needTest = b.hasExamTest && prevAvg > b.reqGrade;
            return `
              <button type="button" class="choice-card-btn" data-nsu-brand="${b.id}">
                <div class="choice-title">
                  <span>[${b.category}] ${b.name}</span>
                  <span class="tag-chip ${netCost > 0 ? 'warn' : 'good'}">
                    ${b.initCost ? `초기 ${b.initCost}만 원 / 턴당 0원` : `${netCost}만 원/턴`}
                  </span>
                </div>
                <div class="choice-sub">${b.desc}</div>
                ${needTest ? `<div class="tag-chip bad" style="margin-top:5px;display:inline-block;">📝 유시험 전형 필요 (직전 수능 평균 2.5등급 초과)</div>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('[data-nsu-brand]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const brand = D.NSU_ACADEMY_BRANDS.find(x => x.id === btn.dataset.nsuBrand);
        if (brand.hasExamTest && prevAvg > brand.reqGrade) {
          const testChoice = await openChoiceModal({
            title: `${brand.name} 유시험 입학 테스트`,
            subtitle: '무시험 기준(2.5등급 이내) 미달로 입학 시험을 치러야 합니다.',
            miniScene: 'interview',
            choices: [
              { id: 'focus_test', label: '초집중 모드로 킬러 수학·국어 유시험 테스트 응시', desc: '스탯과 멘탈을 끌어올려 합격에 도전합니다.' },
              { id: 'giveup', label: '다른 독학재수/인강 브랜드로 변경하기', desc: '안전하게 타 학원을 선택합니다.' }
            ]
          });
          if (testChoice.id === 'giveup') return;
          const passTest = (state.stats.kor + state.stats.math) / 2 >= 50 || Math.random() < 0.7;
          if (!passTest) {
            await openInfoModal('유시험 전형 불합격', `${brand.name} 유시험 입학 테스트 커트라인에 아쉽게 미달했습니다. 다른 학원이나 인강을 선택해주세요.`);
            return;
          }
          await openInfoModal('유시험 전형 합격!', `${brand.name} 유시험 입학 테스트를 당당히 통과하여 입소했습니다!`);
        }

        if (brand.initCost && state.money >= brand.initCost) {
          state.money -= brand.initCost;
        }
        state.nsuAcademy = brand;
        state.phase = 'nsu';
        E.addLog(state, `${brand.name} 등록 완료! ${state.isBansu ? '반수' : '재수'} 레이스 시작`);
        render();
      });
    });
  }

  // Phase 5-2: N수 7턴 진행
  function renderNsuPhase() {
    const turnObj = D.NSU_TURNS[state.nsuTurn];
    if (!turnObj) {
      state.phase = 'jeongsi';
      render();
      return;
    }

    state.season = turnObj.season;
    state.viewportScene = state.nsuAcademy?.isHome ? 'studycafe' : 'lecture';

    const prevAvg = state.lastCsat?.avgGrade || 3.5;
    const canAlba = !!state.nsuAcademy?.allowAlba || state.school?.itRestricted;

    const actions = [
      { id: 'nsu_study', title: `🔥 ${state.nsuAcademy?.name || '독학'} 정규 커리큘럼 집중 몰입`, sub: `성장률 +${Math.round((state.nsuAcademy?.growthBonus || 0.2) * 100)}% 적용, 체력/멘탈 소모` },
      { id: 'nsu_rest', title: '🛌 체력·멘탈 집중 재정비 휴식', sub: '체력 +28, 멘탈 +24 이상 회복 (스탯 상승 없음)' }
    ];
    if (canAlba) {
      actions.push({ id: 'alba_conv', title: '🏪 편의점 주말 알바 병행 (+80만 원)', sub: '자금 +80만 원 확보, 소폭 학습 병행, 체력 -14' });
      if (prevAvg <= 2.2) {
        actions.push({ id: 'alba_tutor', title: '🎓 고득점자 전용 대치동 조교·과외 알바 (+160만 원)', sub: '자금 +160만 원 대폭 확보, 학습 감각 유지, 체력 -12' });
      }
    }

    stageEl.innerHTML = `
      <div class="stage-card">
        <h2 class="section-title">${turnObj.label} (${turnObj.turn}/7턴)</h2>
        <p class="section-desc">소속: <strong>${state.nsuAcademy?.name}</strong> ${state.tuitionDiscountRate > 0 ? '<span class="tag-chip good">장학 50% 감면 중</span>' : ''}</p>
        <div class="stack-1col">
          ${actions.map(a => `
            <button type="button" class="choice-card-btn" data-nsu-act="${a.id}">
              <div class="choice-title">${a.title}</div>
              <div class="choice-sub">${a.sub}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    stageEl.querySelectorAll('[data-nsu-act]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actId = btn.dataset.nsuAct;
        const hasExam = turnObj.type === 'mock' || turnObj.type === 'csat';
        if (hasExam) {
          state.viewportScene = 'exam';
          await runLoadingSequence(`${turnObj.mockTitle} 응시 중...`, [
            '실전 시험지 배부 및 OMR 마킹 진행 중...',
            '표준점수 및 백분위 산출 중...'
          ], 460);
        }

        const report = E.executeNsuTurn(state, actId);
        state.viewportScene = state.nsuAcademy?.isHome ? 'studycafe' : 'lecture';
        if (report) await showReportModal(report);

        // Turn 2 대동제 축제 StudyGram 피드 폭격
        if (turnObj.triggerFestival && state.snsDetoxTurns <= 0) {
          const fc = await openChoiceModal({
            title: '대학 봄 축제(대동제) 시즌 & 1차 슬럼프 위기',
            subtitle: '',
            miniScene: 'festival',
            studygramData: {
              avatar: 'J',
              handle: 'yonsei_freshman_28',
              likes: 142,
              caption: '아카라카 불꽃놀이 미쳤다 🎉 과잠 입고 잔디밭에서 맥주 한 잔! #연세대 #대동제 #28학번',
              dm: '야 너 아직도 공부하냐? ㅋㅋ 오늘 축제 진짜 역대급인데 아쉽네'
            },
            choices: [
              { id: 'burn', label: '분노를 원동력으로 삼고 기출 2회분 추가 풀이', desc: '국·수 스탯 +4, 멘탈 -6, 체력 -10' },
              { id: 'calm', label: '내년 주인공은 나다! 앱 끄고 마인드 컨트롤', desc: '멘탈 +12' }
            ]
          });
          if (fc.id === 'burn') { E.growStat(state, 'kor', 4); E.growStat(state, 'math', 4); state.mental = E.clamp(state.mental - 6, 5, 100); state.stamina = E.clamp(state.stamina - 10, 5, 100); }
          else { state.mental = E.clamp(state.mental + 12, 5, 100); }
        }

        // 집 독학 유혹 이벤트
        if (state.nsuAcademy?.isHome && actId !== 'nsu_rest' && Math.random() < 0.55) {
          const tc = await openChoiceModal({
            title: '집 독학 최대의 적: 침대·유튜브·게임의 유혹!',
            subtitle: '아무도 감시하는 사람이 없는 방 안, 침대와 스마트폰이 손짓하고 있습니다.',
            miniScene: 'temptation',
            choices: [
              { id: 'resist', label: '스마트폰을 거실에 던지고 타이머를 다시 누른다', desc: '멘탈 -5, 스탯 +2.5 방어' },
              { id: 'yield', label: '딱 2시간만 쉬고 밤에 하기로 타협한다', desc: '체력 +10, 스탯 성장 기회 상실' }
            ]
          });
          if (tc.id === 'resist') { state.mental = E.clamp(state.mental - 5, 5, 100); E.growStat(state, 'math', 2.5); }
          else { state.stamina = E.clamp(state.stamina + 10, 5, 100); E.addLog(state, '유튜브 알고리즘에 빠져 하루가 증발했다...'); }
        }

        // Turn 5 (9평 이후): N수생 수시 6장 vs 정시 100% 선택
        if (turnObj.nsuSusiChoice) {
          const sc = await openChoiceModal({
            title: '9월 평가원 모의평가 이후 대입 전략 결정',
            subtitle: 'N수생도 고교 학생부로 수시 6장에 지원할 수 있습니다. 어떻게 하시겠습니까?',
            miniScene: 'counseling',
            choices: [
              { id: 'nsu_susi', label: '수시 6장도 함께 원서 접수한다 (안전장치 + 상향 지원)', desc: '수시 원서 접수 화면으로 이동합니다.' },
              { id: 'nsu_jeongsi', label: '정시 100% 직진! 수시 원서는 쓰지 않는다', desc: '수시 납치 없이 정시 가·나·다군만 노립니다.' }
            ]
          });
          if (sc.id === 'nsu_susi') {
            state.phase = 'susi';
            render();
            return;
          }
        }

        // Turn 7 본수능 종료
        if (turnObj.type === 'csat') {
          await processPostCsatAdmissions();
          return;
        }
        render();
      });
    });
  }

  // 최종 합격 확정 & 금장 합격통지서 모달 호출
  function finalizeAdmission(uni, majorName, recruitType, admissionType) {
    const year = 2028 + state.nsuCount;
    state.finalAdmission = {
      uni,
      majorName,
      recruitType,
      admissionType,
      year,
      examId: state.examId,
      playerName: state.playerName,
      birthDate: state.birthDate,
      issueDate: `${year - 1}년 12월 22일`
    };
    state.phase = 'ended';
    state.viewportScene = 'campus';
    E.addLog(state, `최종 합격: ${uni.name} ${majorName} (${recruitType})`);
    render();
    openCertificateModal();
  }

  // 엔딩 화면 (메인 영역)
  function renderEndedPhase() {
    state.viewportScene = 'campus';
    const adm = state.finalAdmission;
    stageEl.innerHTML = `
      <div class="stage-card" style="text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 10px;">${D.buildUniSvg(adm.uni)}</div>
        <h2 class="section-title">🎉 ${adm.uni.name} ${adm.majorName} 최종 합격!</h2>
        <p class="section-desc">${adm.year}학년도 ${adm.recruitType} (${adm.admissionType}) 합격의 영예를 안았습니다.</p>
        <div class="stack-1col">
          <button type="button" id="btn-open-cert" class="btn-primary">📜 합격통지서 & 수험생 일대기 보기</button>
          <button type="button" id="btn-new-game" class="btn-secondary">↻ 새로운 수험생으로 다시 시작하기</button>
        </div>
      </div>
    `;
    document.getElementById('btn-open-cert').addEventListener('click', openCertificateModal);
    document.getElementById('btn-new-game').addEventListener('click', resetGame);
  }

  // 금장 테두리 합격통지서 & 수험생 일대기 모달 (PNG 다운로드 포함)
  function openCertificateModal() {
    const adm = state.finalAdmission;
    if (!adm) return;
    const modal = document.getElementById('cert-modal');
    const inner = document.getElementById('cert-modal-inner');
    let tab = 'cert';

    const drawModal = () => {
      const chapters = E.generateChronicle(state);
      const shortU = adm.uni.name.replace('대학교', '대');
      inner.innerHTML = `
        <div class="cert-tabs">
          <button type="button" class="cert-tab-btn ${tab === 'cert' ? 'active' : ''}" id="ctab-cert">📜 합격통지서</button>
          <button type="button" class="cert-tab-btn ${tab === 'story' ? 'active' : ''}" id="ctab-story">📖 수험생 일대기(인생 이야기)</button>
        </div>

        ${tab === 'cert' ? `
          <div class="cert-frame-outer">
            <div class="cert-frame-inner">
              <div class="cert-emblem">
                <div style="width:74px;height:74px;">${D.buildUniSvg(adm.uni)}</div>
              </div>
              <div class="cert-heading">합 격 통 지 서</div>
              <table class="cert-info-table">
                <tr><th>모집구분</th><td>${adm.recruitType}</td></tr>
                <tr><th>전형구분</th><td>${adm.admissionType}</td></tr>
                <tr><th>모집단위</th><td><strong>${adm.majorName}</strong></td></tr>
                <tr><th>수험번호</th><td>${adm.examId}</td></tr>
                <tr><th>성 명</th><td><strong>${adm.playerName}</strong></td></tr>
                <tr><th>생년월일</th><td>${adm.birthDate}</td></tr>
              </table>
              <div class="cert-body-msg">
                위 사람은 ${adm.uni.name} ${adm.year}학년도<br>
                신입학 전형에 합격하였기에 이 증서를 드립니다.
              </div>
              <div class="cert-bottom-area">
                <div class="cert-circle-mark">${adm.uni.name}<br>입학처 인증</div>
                <div class="cert-president-block">
                  <div class="cert-date">${adm.issueDate}</div>
                  <div class="cert-pres-sign">
                    <span class="cert-pres-text">${adm.uni.name} 총 장</span>
                    <span class="cert-pres-seal">${shortU}<br>총장<br>지인</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="button" id="btn-dl-png" class="btn-primary">📥 합격통지서 이미지 저장 (PNG 다운로드)</button>
        ` : `
          <div class="chronicle-box">
            ${chapters.map(ch => `
              <div class="chronicle-chapter">
                <h4>${ch.title}</h4>
                <p>${ch.body}</p>
              </div>
            `).join('')}
          </div>
        `}
        <button type="button" id="btn-close-cert" class="btn-secondary" style="margin-top:8px;">닫기</button>
      `;

      document.getElementById('ctab-cert').addEventListener('click', () => { tab = 'cert'; drawModal(); });
      document.getElementById('ctab-story').addEventListener('click', () => { tab = 'story'; drawModal(); });
      document.getElementById('btn-close-cert').addEventListener('click', () => { modal.style.display = 'none'; });
      const dlBtn = document.getElementById('btn-dl-png');
      if (dlBtn) {
        dlBtn.addEventListener('click', () => P.downloadCertificatePng(adm));
      }
    };

    drawModal();
    modal.style.display = 'flex';
  }

  // 상점 모달
  function openShopModal() {
    const modal = document.getElementById('utility-modal');
    const inner = document.getElementById('utility-modal-inner');
    inner.innerHTML = `
      <h3 class="section-title">🛒 수험생 상점 (보유 자금: ${state.money.toLocaleString()}만 원)</h3>
      <p class="section-desc">수험 생활 효율을 극대화하는 필수 아이템을 구매할 수 있습니다.</p>
      <div class="stack-1col">
        ${D.SHOP_ITEMS.map(item => {
          const owned = !item.consumable && state.items[item.id];
          return `
            <button type="button" class="choice-card-btn" data-buy="${item.id}" ${(owned || state.money < item.price) ? 'disabled' : ''}>
              <div class="choice-title">
                <span>${item.name} ${owned ? '(보유 중)' : ''}</span>
                <span class="tag-chip blue">${item.price}만 원</span>
              </div>
              <div class="choice-sub">${item.desc}</div>
            </button>
          `;
        }).join('')}
      </div>
      <button type="button" id="btn-close-util" class="btn-secondary" style="margin-top:12px;">닫기</button>
    `;

    inner.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = D.SHOP_ITEMS.find(x => x.id === btn.dataset.buy);
        if (!item || state.money < item.price) return;
        state.money -= item.price;
        if (item.id === 'energy_drink') {
          state.stamina = E.clamp(state.stamina + 15, 0, 100);
          state.nextExamFocusBonus += 4;
        } else if (item.id === 'headphones') {
          state.items.headphones = true;
        } else if (item.id === 'ipad') {
          state.items.ipad = true;
        } else if (item.id === 'padding') {
          state.mental = E.clamp(state.mental + 35, 0, 100);
        } else if (item.id === 'gongjindan') {
          state.stamina = E.clamp(state.stamina + 45, 0, 100);
          state.mental = E.clamp(state.mental + 30, 0, 100);
        }
        E.addLog(state, `상점 구매: ${item.name} (-${item.price}만 원)`);
        updateStatusBar();
        E.saveState(state);
        openShopModal();
      });
    });
    document.getElementById('btn-close-util').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.style.display = 'flex';
  }

  // 능력치 & 성적 기록 모달
  function openStatsModal() {
    const modal = document.getElementById('utility-modal');
    const inner = document.getElementById('utility-modal-inner');
    const lastMock = state.mockHistory[state.mockHistory.length - 1];
    inner.innerHTML = `
      <h3 class="section-title">📊 수험생 상세 능력치 & 성적 기록</h3>
      <p class="section-desc">${state.playerName} (${state.majorName} 지망 · 집중 과목: ${state.focusSubject.toUpperCase()})</p>
      <div class="stat-mini-bars" style="margin-bottom:14px;">
        <div class="stat-mini-item"><span>국어</span><strong>${state.stats.kor}</strong></div>
        <div class="stat-mini-item"><span>수학</span><strong>${state.stats.math}</strong></div>
        <div class="stat-mini-item"><span>영어</span><strong>${state.stats.eng}</strong></div>
        <div class="stat-mini-item"><span>사회</span><strong>${state.stats.soc}</strong></div>
        <div class="stat-mini-item"><span>과학</span><strong>${state.stats.sci}</strong></div>
      </div>
      <div style="font-size:0.84rem;color:#334155;line-height:1.7;">
        <div>• 누적 내신 등급: <strong>${state.cumulativeGpa ? `${state.cumulativeGpa}등급` : '미산출'}</strong></div>
        <div>• 생기부(세특) 역량: <strong>${state.setuk}점</strong></div>
        <div>• 선행학습도: <strong>${state.advanceStudy}</strong></div>
        <div>• 최근 모의고사/수능: <strong>${lastMock ? `국${lastMock.kor.grade} 수${lastMock.math.grade} 영${lastMock.eng.grade} 사${lastMock.soc.grade} 과${lastMock.sci.grade} (평균 백분위 ${lastMock.avgPct}%)` : '미응시'}</strong></div>
      </div>
      <button type="button" id="btn-close-util" class="btn-secondary" style="margin-top:14px;">닫기</button>
    `;
    document.getElementById('btn-close-util').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.style.display = 'flex';
  }

  function resetGame() {
    E.clearSave();
    state = E.createInitialState();
    render();
  }

  document.getElementById('btn-shop').addEventListener('click', openShopModal);
  document.getElementById('btn-stats').addEventListener('click', openStatsModal);
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('현재 진행 중인 수험 기록을 초기화하고 처음부터 다시 시작할까요?')) {
      resetGame();
    }
  });

  // 초기 렌더링 시작
  render();

  return { render };
})();
