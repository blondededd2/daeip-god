// 《대입의 신》 핵심 게임 엔진 · 수식 · 저장 · 일대기 생성기
window.GameEngine = (() => {
  const SAVE_KEY = 'daeip_god_save_v1';

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const round2 = (v) => Math.round(v * 100) / 100;

  function createInitialState() {
    return {
      phase: 'char_district', // char_district -> char_profile -> char_stats -> ms -> hs_apply -> hs -> susi -> nsu_apply -> nsu -> jeongsi -> ended
      viewportScene: 'map',
      season: 'spring',
      selectedDistrictId: 'daechi',
      playerName: '김수험',
      gender: 'M',
      birthDate: '2009.05.12',
      examId: '2810' + randInt(1000, 9999),
      fieldId: 'eng',
      majorName: '전자전기공학부',
      middleSchool: '',
      isIntlMiddle: false,
      district: null,
      school: null, // { id, name, category, gradeDiff, mockBonus, hakjongBonus, ... }
      schoolTier: 'normal',
      commutePenalty: 0,

      // 핵심 자원 및 스탯
      money: 150,
      stamina: 85,
      mental: 85,
      setuk: 25,
      advanceStudy: 10, // 선행학습도 (히든/보조)
      msSpec: 15,       // 중등 비교과/영재원/대회 스펙
      focusSubject: 'math',
      stats: { kor: 80, math: 80, eng: 80, soc: 80, sci: 80 },
      rerollLeft: 3,
      candidates: [],

      // 학사 진행 상태
      msTurn: 0, // 0..3
      hsTurn: 0, // 0..17
      nsuTurn: 0, // 0..6
      nsuCount: 0, // 0: 현역, 1: 재수, 2: 삼수...
      isBansu: false,
      bansuHoldAdmission: null, // { uniId, uniName, majorName, admissionType }

      // 수강신청 과목
      hs2Courses: { mathSem2: '미적분Ⅰ', tamgu: ['물리학', '화학'] },
      hs3Courses: { mathPairId: 'stem', tamgu: ['역학과 에너지', '물질과 에너지'] },
      hs2CourseDone: false,
      hs3CourseDone: false,
      routeChoice: 'balanced', // 'susi' | 'jeongsi' | 'balanced'

      // 성적 및 이력
      msReports: [],
      msAvgRaw: 88,
      msPercentile: 10.0,
      hsReports: [],
      gpaHistory: [], // 모든 학기 과목 등급 배열
      cumulativeGpa: null,
      mockHistory: [],
      lastCsat: null,
      lastMockStatsBonus: 0,

      // 상점 & 버프
      items: { headphones: false, ipad: false },
      nextExamFocusBonus: 0,
      snsDetoxTurns: 0,
      daechiClass: 'S', // 'S' | 'A'
      killerPrepBonus: 0,
      tuitionDiscountRate: 0,

      // N수 학원 상태
      nsuAcademy: null,
      nsuSusiOpted: false,

      // 대입 원서 및 결과
      susiApps: [], // [{ uniId, track: 'gyokwa'|'hakjong', majorName }]
      susiResults: [],
      jeongsiApps: { ga: null, na: null, da: null },
      jeongsiResults: [],
      finalAdmission: null,

      // 일대기 로그 & 이벤트 큐
      logs: [],
      chronicleEvents: [],
      pendingAfterReport: null,
      consecutiveRestTurns: 0
    };
  }

  function addLog(state, text) {
    state.logs.unshift(text);
    if (state.logs.length > 30) state.logs.pop();
  }

  function addChronicle(state, chapter, text) {
    state.chronicleEvents.push({ chapter, text });
  }

  function saveState(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore storage errors */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) { /* ignore */ }
  }

  // 동일한 합계를 가지는 3명의 후보 능력치 생성
  function generateCandidates(districtId) {
    const d = GameData.DISTRICTS.find(x => x.id === districtId) || GameData.DISTRICTS[0];
    const targetSum = 390 + d.initAdvance;
    const keys = ['kor', 'math', 'eng', 'soc', 'sci'];
    const labels = ['국·영 언어 집중형', '수·과 이공계 집중형', '전 과목 육각형 밸런스형'];
    const biases = [
      { kor: 8, eng: 8, math: -6, sci: -6, soc: -4 },
      { math: 9, sci: 9, kor: -6, eng: -4, soc: -8 },
      { kor: 0, math: 0, eng: 0, soc: 0, sci: 0 }
    ];

    return biases.map((b, idx) => {
      const s = {};
      let sum = 0;
      keys.forEach((k) => {
        s[k] = Math.round(targetSum / 5) + b[k] + randInt(-3, 3);
        sum += s[k];
      });
      // 합계 정확히 일치 보정
      let diff = targetSum - sum;
      let ki = 0;
      while (diff !== 0) {
        const k = keys[ki % 5];
        if (diff > 0) { s[k]++; diff--; }
        else { s[k]--; diff++; }
        ki++;
      }
      return { id: idx, title: labels[idx], stats: s, total: targetSum };
    });
  }

  // 중학교 자동 추첨 배정 (5% 히든 국제중 포함)
  function assignMiddleSchool(district, gender) {
    if (Math.random() < 0.05) {
      const intl = GameData.INTL_MIDDLE_SCHOOLS[randInt(0, GameData.INTL_MIDDLE_SCHOOLS.length - 1)];
      return { name: intl, isIntl: true };
    }
    const pool = district.middleSchools.filter(m => m.gender === 'all' || m.gender === gender);
    const chosen = pool[randInt(0, pool.length - 1)];
    return { name: chosen.name, isIntl: false };
  }

  // 스탯 성장 헬퍼
  function growStat(state, key, amount) {
    let mult = 1.0;
    if (state.focusSubject === key) mult += 0.15;
    if (state.items?.ipad) mult += 0.15;
    if (state.school) {
      if (state.school.mathSciGrowth && (key === 'math' || key === 'sci')) mult += state.school.mathSciGrowth;
      if (state.school.korEngGrowth && (key === 'kor' || key === 'eng')) mult += state.school.korEngGrowth;
    }
    const delta = Math.round(amount * mult * 10) / 10;
    state.stats[key] = clamp(round2(state.stats[key] + delta), 30, 155);
  }

  // 중3 1턴 진행 & 내신 성적 산출
  function executeMiddleTurn(state, actionId) {
    const turnNames = ['중3 1학기 중간고사', '중3 1학기 기말고사', '중3 2학기 중간고사', '중3 2학기 기말고사'];
    const turnName = turnNames[state.msTurn];
    let rawBonus = 0;

    // 용돈 지급
    state.money += state.district.allowance;

    if (actionId === 'academy') {
      const cost = 45;
      if (state.money >= cost) state.money -= cost;
      const eff = 1 + state.district.academyEff;
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.4 * eff));
      rawBonus = 6 + Math.round(state.district.academyEff * 8);
      state.stamina = clamp(state.stamina - 10, 5, 100);
      addLog(state, `${turnName}: 단과·종합학원 집중반 수강 (자금 -${cost}만)`);
    } else if (actionId === 'self') {
      const headBonus = state.items.headphones ? 1.15 : 1.0;
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.0 * headBonus));
      rawBonus = 4;
      state.mental = clamp(state.mental - 8, 5, 100);
      addLog(state, `${turnName}: 자기주도 독학 & 기출 풀이 완료`);
    } else if (actionId === 'advance') {
      growStat(state, 'math', 3.4);
      growStat(state, 'sci', 3.2);
      state.advanceStudy += 14;
      rawBonus = 1;
      state.stamina = clamp(state.stamina - 8, 5, 100);
      addLog(state, `${turnName}: 고등 심화 선행학습 집중 (선행도 +14)`);
    } else if (actionId === 'spec') {
      state.msSpec += 18;
      state.setuk += 8;
      ['kor', 'eng'].forEach(k => growStat(state, k, 1.4));
      rawBonus = 2;
      state.stamina = clamp(state.stamina - 6, 5, 100);
      state.mental = clamp(state.mental - 4, 5, 100);
      addLog(state, `${turnName}: 교내 대회·학생회·영재원 스펙 축적`);
    }

    // 완화된 중학교 내신 산출
    const subjMap = [
      { key: 'kor', label: '국어' },
      { key: 'math', label: '수학' },
      { key: 'eng', label: '영어' },
      { key: 'soc', label: '사회' },
      { key: 'sci', label: '과학' }
    ];
    const rows = subjMap.map(s => {
      const statVal = state.stats[s.key];
      const raw = clamp(Math.round(82 + (statVal - 75) * 0.36 + rawBonus + randInt(-2, 4)), 76, 100);
      const ach = raw >= 90 ? 'A' : raw >= 80 ? 'B' : raw >= 70 ? 'C' : raw >= 60 ? 'D' : 'E';
      return { name: s.label, key: s.key, score: raw, achievement: ach };
    });

    const avgRaw = round2(rows.reduce((a, b) => a + b.score, 0) / rows.length);
    state.msAvgRaw = avgRaw;

    // 고입 석차백분율 (상위 0.3% ~ 25.0%): 교과 70% + 비교과 20% + 수행 10%
    const academicScore = clamp((avgRaw - 75) / 25, 0, 1) * 70;
    const specScore = clamp(state.msSpec / 85, 0, 1) * 20;
    const perfScore = clamp((state.stamina + state.mental) / 200, 0.3, 1) * 10;
    const composite = academicScore + specScore + perfScore; // ~20..100
    state.msPercentile = round2(clamp(25.0 - (composite - 30) * 0.36, 0.3, 25.0));

    const report = { kind: 'ms', title: `${turnName} 성적통지표`, rows, avgRaw, percentile: state.msPercentile };
    state.msReports.push(report);

    // 약간의 턴간 회복
    state.stamina = clamp(state.stamina + 6, 10, 100);
    state.mental = clamp(state.mental + 5, 10, 100);

    state.msTurn++;
    return report;
  }

  // 특목·자사·IT·비평준화 고입 합격 판정
  function evaluateSpecialHighSchool(state, hs, interviewScoreBonus) {
    const lastReport = state.msReports[state.msReports.length - 1];
    const mathA = lastReport?.rows.find(r => r.key === 'math')?.achievement === 'A';
    const sciA = lastReport?.rows.find(r => r.key === 'sci')?.achievement === 'A';
    const korA = lastReport?.rows.find(r => r.key === 'kor')?.achievement === 'A';
    const engA = lastReport?.rows.find(r => r.key === 'eng')?.achievement === 'A';
    const socA = lastReport?.rows.find(r => r.key === 'soc')?.achievement === 'A';
    const mathB = ['A', 'B'].includes(lastReport?.rows.find(r => r.key === 'math')?.achievement);
    const sciB = ['A', 'B'].includes(lastReport?.rows.find(r => r.key === 'sci')?.achievement);

    let chance = hs.basePass;
    if (state.msPercentile > hs.maxPct) {
      chance -= (state.msPercentile - hs.maxPct) * 0.14;
    } else {
      chance += (hs.maxPct - state.msPercentile) * 0.04;
    }
    if (hs.reqMathSciA && !(mathA && sciA)) chance -= 0.45;
    if (hs.reqHumA && !(korA && engA && socA)) chance -= 0.35;
    if (hs.reqMathSciB && !(mathB && sciB)) chance -= 0.30;
    if (state.msSpec < hs.minSpec) chance -= 0.20;
    else chance += 0.08;
    chance += (state.advanceStudy / 100) * 0.15 + interviewScoreBonus;

    chance = clamp(chance, 0.05, 0.96);
    const passed = Math.random() < chance;
    return { passed, chance };
  }

  // 학기별 이수 과목 목록 반환 (2022 개정 교육과정 엄격 분리)
  function getSemesterSubjects(state, grade, sem) {
    if (grade === 1) {
      return [
        { name: '공통국어', statKey: 'kor', isCoreStem: false, isCoreHum: true },
        { name: '공통수학', statKey: 'math', isCoreStem: true, isCoreHum: false },
        { name: '공통영어', statKey: 'eng', isCoreStem: false, isCoreHum: true },
        { name: '통합사회', statKey: 'soc', isCoreStem: false, isCoreHum: true },
        { name: '통합과학', statKey: 'sci', isCoreStem: true, isCoreHum: false },
        { name: '한국사', statKey: 'soc', isCoreStem: false, isCoreHum: true }
      ];
    }
    if (grade === 2) {
      const korName = sem === 1 ? '문학' : '독서와 작문';
      const mathName = sem === 1 ? '대수' : state.hs2Courses.mathSem2;
      const engName = sem === 1 ? '영어Ⅰ' : '영어Ⅱ';
      const t = state.hs2Courses.tamgu;
      const isStemT = (n) => ['물리학', '화학', '생명과학', '지구과학'].includes(n);
      return [
        { name: korName, statKey: 'kor', isCoreStem: false, isCoreHum: true },
        { name: mathName, statKey: 'math', isCoreStem: true, isCoreHum: mathName === '확률과 통계' },
        { name: engName, statKey: 'eng', isCoreStem: false, isCoreHum: true },
        { name: t[0], statKey: isStemT(t[0]) ? 'sci' : 'soc', isCoreStem: isStemT(t[0]), isCoreHum: !isStemT(t[0]) },
        { name: t[1], statKey: isStemT(t[1]) ? 'sci' : 'soc', isCoreStem: isStemT(t[1]), isCoreHum: !isStemT(t[1]) }
      ];
    }
    // 고3
    const pair = GameData.ELECTIVES_HS3.mathPair.find(p => p.id === state.hs3Courses.mathPairId) || GameData.ELECTIVES_HS3.mathPair[0];
    const korName = sem === 1 ? '화법과 언어' : '주제탐구 독서';
    const mathName = sem === 1 ? pair.sem1 : pair.sem2;
    const engName = sem === 1 ? '영어 독해와 작문' : '심화 영어';
    const t = state.hs3Courses.tamgu;
    const isStemT = (n) => GameData.ELECTIVES_HS3.stemTamgu.includes(n);
    return [
      { name: korName, statKey: 'kor', isCoreStem: false, isCoreHum: true },
      { name: mathName, statKey: 'math', isCoreStem: pair.isStem, isCoreHum: !pair.isStem },
      { name: engName, statKey: 'eng', isCoreStem: false, isCoreHum: true },
      { name: t[0], statKey: isStemT(t[0]) ? 'sci' : 'soc', isCoreStem: isStemT(t[0]), isCoreHum: !isStemT(t[0]) },
      { name: t[1], statKey: isStemT(t[1]) ? 'sci' : 'soc', isCoreStem: isStemT(t[1]), isCoreHum: !isStemT(t[1]) }
    ];
  }

  // 학군지/명문고 내신 ↔ 모의고사/수능 연동 보정 (getHakgunjiNationalFloor)
  function getHakgunjiNationalFloor(state) {
    const sc = state.school;
    if (!sc) return 0;
    const gpa = state.cumulativeGpa || 2.5;
    // 아무 공부도 안 하고 휴식만 하거나 내신이 3점대 후반~4등급으로 무너진 경우 예외
    if (state.consecutiveRestTurns >= 2 || gpa > 3.65) return 0;

    if (sc.mockBonus >= 12 && gpa <= 2.95) {
      // 휘문고·외대부고 등에서 2.0~2.4등급 유지 시 전국 백분위 93~98% 보장
      const baseFloor = 98.8 - Math.max(0, gpa - 1.0) * 3.2 + (sc.mockBonus - 15) * 0.25;
      return clamp(round2(baseFloor), 84, 99.0);
    }
    return 0;
  }

  // 백분위 -> 표준점수 & 9등급제 환산
  function pctToGrade9(pct) {
    if (pct >= 96) return 1;
    if (pct >= 89) return 2;
    if (pct >= 77) return 3;
    if (pct >= 60) return 4;
    if (pct >= 40) return 5;
    if (pct >= 23) return 6;
    if (pct >= 11) return 7;
    if (pct >= 4) return 8;
    return 9;
  }

  // 고등 턴 실행 (내신 시험 또는 모의고사/본수능)
  function executeHighSchoolTurn(state, actionId) {
    const turnObj = GameData.HS_TURNS[state.hsTurn];
    state.season = turnObj.season;
    state.money += state.district.allowance;
    if (state.school?.tuition) {
      state.money = Math.max(0, state.money - Math.round(state.school.tuition / 6));
    }
    if (state.commutePenalty > 0) {
      state.stamina = clamp(state.stamina - state.commutePenalty, 5, 100);
    }
    if (state.snsDetoxTurns > 0) state.snsDetoxTurns--;

    const eff = 1 + state.district.academyEff + (state.daechiClass === 'S' && state.district.id === 'daechi' ? 0.08 : 0);
    const mockMult = 1 + (state.school?.mockGrowth || 0);
    const fieldObj = GameData.FIELDS.find(f => f.id === state.fieldId);
    const isStem = fieldObj?.track === 'stem' || state.majorName === '수학교육과';

    // 내신(중간/기말) 턴
    if (turnObj.type === 'mid' || turnObj.type === 'fin') {
      state.consecutiveRestTurns = 0;
      const subjects = getSemesterSubjects(state, turnObj.grade, turnObj.sem);
      let stratBonusAll = 0;
      let coreBonus = 0;
      let nonCorePenalty = 0;
      let gambleNote = '';

      if (actionId === 'killer_gamble') {
        const successRate = clamp(0.45 + (state.mental - 50) * 0.003 + state.killerPrepBonus, 0.25, 0.80);
        const ok = Math.random() < successRate;
        if (ok) {
          stratBonusAll = 12;
          gambleNote = '킬러 문항 도박 대성공! (+12점)';
        } else {
          stratBonusAll = -8;
          gambleNote = '킬러 문항 도박 실패 및 기본 문항 실수 (-8점)';
        }
        ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.2 * eff));
        state.stamina = clamp(state.stamina - 10, 5, 100);
        state.mental = clamp(state.mental + (ok ? 6 : -8), 5, 100);
      } else if (actionId === 'core_focus') {
        coreBonus = 10;
        nonCorePenalty = -5;
        state.setuk = clamp(state.setuk + 7, 0, 100);
        ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => {
          const boost = (isStem ? (k === 'math' || k === 'sci') : (k === 'kor' || k === 'soc')) ? 2.9 : 1.4;
          growStat(state, k, boost * eff);
        });
        state.stamina = clamp(state.stamina - 8, 5, 100);
        gambleNote = '권장과목 선택과 집중 (핵심 +10점, 세특 +7)';
      } else if (actionId === 'past_defense') {
        stratBonusAll = 5;
        ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.5 * eff));
        state.stamina = clamp(state.stamina - 7, 5, 100);
        gambleNote = '기출·족보 완벽 분석 안정 방어 (+5점)';
      } else if (actionId === 'setuk_soul') {
        stratBonusAll = -3;
        state.setuk = clamp(state.setuk + 15, 0, 100);
        ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 1.8 * eff));
        state.stamina = clamp(state.stamina - 18, 5, 100);
        state.mental = clamp(state.mental - 4, 5, 100);
        gambleNote = '수행평가·세특 심화 보고서 투혼 (세특 +15, 지필 -3점)';
      } else if (actionId === 'jeongsi_fighter') {
        stratBonusAll = -18;
        state.lastMockStatsBonus += 7;
        ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 3.6 * eff * mockMult));
        state.stamina = clamp(state.stamina - 11, 5, 100);
        state.mental = clamp(state.mental - 4, 5, 100);
        gambleNote = '수능·모의고사 기출 집중 (정시 스탯 대폭 상승, 지필 -18점)';
      }

      state.killerPrepBonus = 0;

      // 5등급제 내신 산출
      const gDiff = state.school?.gradeDiff ?? 0.25;
      const isRural = gDiff < 0;
      const focusItemBonus = state.nextExamFocusBonus;
      state.nextExamFocusBonus = 0;

      const rows = subjects.map(subj => {
        const isCore = isStem ? subj.isCoreStem : subj.isCoreHum;
        const sb = stratBonusAll + (isCore ? coreBonus : nonCorePenalty) + focusItemBonus;
        const perf = state.stats[subj.statKey] * 0.72 + sb - (gDiff * 14) + randInt(-6, 6);
        let grade5, ach;
        if (isRural) {
          if (perf >= 78) { grade5 = 1; ach = 'A'; }
          else if (perf >= 65) { grade5 = 2; ach = 'B'; }
          else if (perf >= 52) { grade5 = 3; ach = 'C'; }
          else if (perf >= 40) { grade5 = 4; ach = 'D'; }
          else { grade5 = 5; ach = 'E'; }
        } else {
          if (perf >= 93) { grade5 = 1; ach = 'A'; }
          else if (perf >= 80) { grade5 = 2; ach = 'B'; }
          else if (perf >= 66) { grade5 = 3; ach = 'C'; }
          else if (perf >= 52) { grade5 = 4; ach = 'D'; }
          else { grade5 = 5; ach = 'E'; }
        }
        return { name: subj.name, grade: grade5, achievement: ach, perf: Math.round(perf) };
      });

      const semAvg = round2(rows.reduce((a, b) => a + b.grade, 0) / rows.length);
      rows.forEach(r => state.gpaHistory.push(r.grade));
      state.cumulativeGpa = round2(state.gpaHistory.reduce((a, b) => a + b, 0) / state.gpaHistory.length);

      let rewardMsg = '';
      if (semAvg <= 1.35) {
        state.money += 100;
        rewardMsg = '교내 최상위 1등급대 성적 달성! 부모님 특별 포상금 +100만 원 지급!';
        addLog(state, rewardMsg);
      }

      const report = {
        kind: 'hs_school',
        title: `${turnObj.label} 성적표`,
        schoolName: state.school.name,
        rows,
        semAvg,
        cumulativeGpa: state.cumulativeGpa,
        note: gambleNote,
        rewardMsg
      };
      state.hsReports.push(report);
      addLog(state, `${turnObj.label} 평균 ${semAvg}등급 (누적 ${state.cumulativeGpa}등급)`);

      // 자연 회복
      const mRec = state.items.headphones ? 6 : 4;
      state.stamina = clamp(state.stamina + 6, 10, 100);
      state.mental = clamp(state.mental + mRec, 10, 100);
      state.hsTurn++;
      return report;
    }

    // 모의고사 / 본수능 턴
    if (actionId === 'rest_condition') {
      state.consecutiveRestTurns++;
      state.stamina = clamp(state.stamina + 25, 10, 100);
      state.mental = clamp(state.mental + (state.items.headphones ? 28 : 22), 10, 100);
    } else {
      state.consecutiveRestTurns = 0;
      const mult = actionId === 'real_mock' ? 3.2 : actionId === 'past_analysis' ? 2.8 : 2.5;
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, mult * eff * mockMult));
      state.stamina = clamp(state.stamina - 9, 5, 100);
      state.mental = clamp(state.mental - 4, 5, 100);
    }

    const kiceReport = generateKiceReport(state, turnObj.mockTitle, turnObj.type === 'csat');
    state.hsTurn++;
    return kiceReport;
  }

  // KICE 공식 모의고사 / 수능 성적통지표 산출
  function generateKiceReport(state, title, isCsat, nsuBonus = 0) {
    const floor = getHakgunjiNationalFloor(state);
    const schoolMockB = state.school?.mockBonus || 0;
    const advB = Math.min(12, state.advanceStudy * 0.14);
    const focusB = state.nextExamFocusBonus;
    state.nextExamFocusBonus = 0;
    const condFactor = ((state.stamina + state.mental) / 200 - 0.5) * 8;

    const calcSubj = (statKey, isMain150) => {
      const base = state.stats[statKey];
      const rawScore = base + schoolMockB * 0.55 + advB + state.lastMockStatsBonus * 0.65 + nsuBonus + focusB + condFactor + randInt(-4, 5);
      let pct = clamp(Math.round(35 + (rawScore - 78) * 0.73), 10, 100);
      if (floor > 0) {
        pct = Math.max(pct, Math.round(clamp(floor + randInt(-3, 2), 82, 99)));
      }
      const grade = pctToGrade9(pct);
      const std = isMain150
        ? Math.round(72 + pct * 0.74)
        : Math.round(40 + pct * 0.34);
      return { pct, grade, std };
    };

    const kor = calcSubj('kor', true);
    const math = calcSubj('math', true);
    const soc = calcSubj('soc', false);
    const sci = calcSubj('sci', false);

    // 영어 & 한국사 절대평가
    const engRaw = state.stats.eng + schoolMockB * 0.45 + nsuBonus + randInt(-3, 4);
    const engScore = clamp(Math.round(52 + (engRaw - 75) * 0.68), 35, 100);
    const engGrade = engScore >= 90 ? 1 : engScore >= 80 ? 2 : engScore >= 70 ? 3 : engScore >= 60 ? 4 : engScore >= 50 ? 5 : 6;

    const histScore = clamp(Math.round(28 + (state.stats.soc - 75) * 0.38 + randInt(0, 5)), 15, 50);
    const histGrade = histScore >= 40 ? 1 : histScore >= 35 ? 2 : histScore >= 30 ? 3 : 4;

    const avgPct = round2((kor.pct + math.pct + (soc.pct + sci.pct) / 2) / 3);
    const avgGrade = round2((kor.grade + math.grade + engGrade + (soc.grade + sci.grade) / 2) / 4);

    let rewardMsg = '';
    if (kor.grade === 1 && math.grade === 1 && engGrade === 1 && soc.grade === 1 && sci.grade === 1) {
      state.money += 100;
      rewardMsg = '전 영역 올 1등급 달성! 부모님 특별 포상금 +100만 원 지급!';
      addLog(state, rewardMsg);
    }

    const reportYear = 2027 + (state.nsuCount || 0);
    const report = {
      kind: 'kice',
      title: `${title} 성적통지표`,
      isCsat,
      date: isCsat ? `${reportYear}년 12월 8일` : `${reportYear}년 성적 통지`,
      hist: { grade: histGrade },
      kor,
      math,
      eng: { grade: engGrade },
      soc,
      sci,
      avgPct,
      avgGrade,
      rewardMsg
    };

    state.mockHistory.push(report);
    if (isCsat) state.lastCsat = report;
    addLog(state, `${title}: 국${kor.grade} 수${math.grade} 영${engGrade} 사${soc.grade} 과${sci.grade} (평균 백분위 ${avgPct}%)`);
    return report;
  }

  // 권장과목 이수 보정 계산
  function getRecommendedCourseEffect(state) {
    const fieldObj = GameData.FIELDS.find(f => f.id === state.fieldId);
    const isStem = fieldObj?.track === 'stem' || state.majorName === '수학교육과';
    const hs2 = state.hs2Courses;
    const hs3 = state.hs3Courses;

    if (isStem) {
      const hasCalc1 = hs2.mathSem2 === '미적분Ⅰ';
      const hasStem2 = hs2.tamgu.filter(t => GameData.ELECTIVES_HS2.stemTamgu.includes(t)).length >= 2;
      const hasCalc2 = hs3.mathPairId === 'stem';
      const hasStem3 = hs3.tamgu.filter(t => GameData.ELECTIVES_HS3.stemTamgu.includes(t)).length >= 2;
      const score = (hasCalc1 ? 1 : 0) + (hasStem2 ? 1 : 0) + (hasCalc2 ? 1 : 0) + (hasStem3 ? 1 : 0);
      if (score >= 4) return { delta: -0.15, label: '전공 권장과목 완벽 이수 (+가산)' };
      if (score >= 2) return { delta: 0.0, label: '권장과목 보통 이수' };
      return { delta: +0.35, label: '이공/의약학 권장과목 미이수 감점' };
    } else {
      const hasHum2 = hs2.tamgu.filter(t => GameData.ELECTIVES_HS2.humTamgu.includes(t)).length >= 1;
      const hasHum3 = hs3.tamgu.filter(t => GameData.ELECTIVES_HS3.humTamgu.includes(t)).length >= 1;
      if (hasHum2 && hasHum3) return { delta: -0.10, label: '인문·상경 권장과목 충실 이수 (+가산)' };
      return { delta: 0.0, label: '권장과목 무난 이수' };
    }
  }

  // 수능 최저학력기준 충족 여부 판정
  function checkCsatMinimum(csat, minRule) {
    if (!minRule || minRule.type === 'none') return { ok: true, text: '최저 없음' };
    const tamAvg = (csat.soc.grade + csat.sci.grade) / 2;
    const grades = [csat.kor.grade, csat.math.grade, csat.eng.grade, tamAvg].sort((a, b) => a - b);
    if (minRule.type === 'sum3') {
      const s = grades[0] + grades[1] + grades[2];
      return { ok: s <= minRule.limit, text: `3합 ${s.toFixed(1)} / 기준 ${minRule.limit} 이내` };
    }
    if (minRule.type === 'sum2') {
      const s = grades[0] + grades[1];
      return { ok: s <= minRule.limit, text: `2합 ${s.toFixed(1)} / 기준 ${minRule.limit} 이내` };
    }
    return { ok: true, text: '충족' };
  }

  // 수시 6장 합불 판정
  function evaluateSusiApplications(state) {
    const csat = state.lastCsat;
    const gpa = state.cumulativeGpa || 2.5;
    const setukBonus = ((state.setuk - 40) / 60) * 0.35; // 세특 우수 시 최대 0.35등급 상향 보정
    const schoolBonus = state.school?.hakjongBonus || 0.1;
    const recCourse = getRecommendedCourseEffect(state);
    const ruralBonus = state.district?.id === 'rural' ? 0.15 : 0;

    return state.susiApps.map(app => {
      const uni = GameData.UNIVERSITIES.find(u => u.id === app.uniId);
      const isMed = GameData.FIELDS[0].majors.includes(state.majorName);
      const cutSet = (isMed && uni.cutoffs.med) ? uni.cutoffs.med : uni.cutoffs.main;
      const majorDisplay = uni.majors[state.majorName] || state.majorName;

      // 수능최저 결정
      let minRule = uni.susiMin;
      if (isMed && uni.medMin) minRule = uni.medMin;
      if (app.track === 'hakjong' && uni.hakjongNoMin) minRule = { type: 'none', desc: '수능최저 없음' };
      const minCheck = checkCsatMinimum(csat, minRule);

      if (!minCheck.ok) {
        return {
          ...app, uni, majorDisplay, passed: false,
          reason: `수능최저 미충족 (${minCheck.text})`
        };
      }

      // 학종 vs 교과 판정
      let effectiveGpa = gpa - (app.track === 'gyokwa' ? ruralBonus : (schoolBonus + setukBonus + ruralBonus));
      if (app.track === 'hakjong') {
        effectiveGpa += recCourse.delta;
        if (state.school?.medPenalty && isMed) effectiveGpa += 0.55;
        if (state.school?.stemPenalty && (state.fieldId === 'med' || state.fieldId === 'eng')) effectiveGpa += 0.45;
      }

      const cons = app.track === 'gyokwa' ? cutSet.gyokwaCons : cutSet.hakjongCons;
      const opt = app.track === 'gyokwa' ? cutSet.gyokwaOpt : cutSet.hakjongOpt;

      let passProb = 0;
      if (effectiveGpa <= cons) passProb = 0.94;
      else if (effectiveGpa <= opt) passProb = 0.68 - ((effectiveGpa - cons) / Math.max(0.05, opt - cons)) * 0.38;
      else if (effectiveGpa <= opt + 0.25) passProb = 0.18;
      else passProb = 0.02;

      const passed = Math.random() < passProb;
      return {
        ...app, uni, majorDisplay, passed,
        effectiveGpa: round2(effectiveGpa),
        reason: passed
          ? `최종 합격 (환산 ${round2(effectiveGpa)}등급 · ${minCheck.text})`
          : `아쉽게 불합격 (환산 ${round2(effectiveGpa)}등급 / 적정 ${opt}등급)`
      };
    });
  }

  // 수시 자동 6장 추천 생성
  function buildAutoSusiRecommendations(state) {
    const gpa = state.cumulativeGpa || 2.5;
    const isItRestricted = state.school?.itRestricted;
    const available = GameData.UNIVERSITIES.filter(u => {
      if (!u.majors[state.majorName]) return false;
      if (isItRestricted && state.fieldId !== 'eng') return false;
      return true;
    });

    const pool = available.length > 0 ? available : GameData.UNIVERSITIES.filter(u => u.majors[state.majorName]);
    const scored = pool.map(u => {
      const isMed = GameData.FIELDS[0].majors.includes(state.majorName);
      const cut = (isMed && u.cutoffs.med) ? u.cutoffs.med : u.cutoffs.main;
      const track = (state.school?.hakjongBonus >= 0.35 || state.setuk >= 55) ? 'hakjong' : 'gyokwa';
      const target = track === 'hakjong' ? cut.hakjongOpt : cut.gyokwaOpt;
      const eff = gpa - (track === 'hakjong' ? (state.school?.hakjongBonus || 0.1) + (state.setuk - 40) * 0.005 : 0);
      return { uniId: u.id, track, majorName: state.majorName, diff: Math.abs(eff - target) };
    }).sort((a, b) => a.diff - b.diff);

    return scored.slice(0, 6).map(({ uniId, track, majorName }) => ({ uniId, track, majorName }));
  }

  // 정시 가·나·다군 판정 (서울대 나군 단독 + 교과역량평가 내신 반영)
  function evaluateJeongsiApplications(state) {
    const csat = state.lastCsat;
    const myPct = csat.avgPct;
    const gpa = state.cumulativeGpa || 2.5;
    const results = [];

    ['ga', 'na', 'da'].forEach(groupKey => {
      const app = state.jeongsiApps[groupKey];
      if (!app) return;
      const uni = GameData.UNIVERSITIES.find(u => u.id === app.uniId);
      const isMed = GameData.FIELDS[0].majors.includes(state.majorName);
      const cutSet = (isMed && uni.cutoffs.med) ? uni.cutoffs.med : uni.cutoffs.main;
      const majorDisplay = uni.majors[state.majorName] || state.majorName;

      // 서울대 교과역량평가 (내신 3~4등급 이하 소폭 감점)
      let adjPct = myPct;
      let gpaNote = '';
      if (uni.jeongsiGpaWeight && gpa >= 3.0) {
        const pen = round2((gpa - 2.8) * 0.7);
        adjPct -= pen;
        gpaNote = ` (교과역량평가 내신 ${gpa}등급 -${pen}%p 반영)`;
      }

      const targetPct = cutSet.jeongsiPct;
      const diff = adjPct - targetPct;
      let prob = 0;
      if (diff >= 1.5) prob = 0.96;
      else if (diff >= 0) prob = 0.78;
      else if (diff >= -1.5) prob = 0.45;
      else if (diff >= -3.5) prob = 0.15;
      else prob = 0.02;

      const passed = Math.random() < prob;
      results.push({
        group: groupKey === 'ga' ? '가군' : groupKey === 'na' ? '나군' : '다군',
        uni, majorDisplay, passed,
        reason: passed
          ? `정시 최초/추가 합격 (내 백분위 ${round2(adjPct)}% vs 컷 ${targetPct}%)${gpaNote}`
          : `정시 불합격 (내 백분위 ${round2(adjPct)}% / 컷 ${targetPct}%)${gpaNote}`
      });
    });

    return results;
  }

  // N수 1턴 진행
  function executeNsuTurn(state, actionId) {
    const turnObj = GameData.NSU_TURNS[state.nsuTurn];
    state.season = turnObj.season;
    state.money += Math.round(state.district.allowance * 0.8);

    // 학원비 결제 및 잔고 부족 강제 전환 페널티
    let acad = state.nsuAcademy;
    if (acad && acad.cost > 0) {
      const netCost = Math.round(acad.cost * (1 - state.tuitionDiscountRate));
      if (state.money >= netCost) {
        state.money -= netCost;
      } else {
        // 잔고 부족 시 독재 또는 집 독학으로 강제 전환
        const fallback = state.money >= 55
          ? GameData.NSU_ACADEMY_BRANDS.find(b => b.id === 'itall')
          : GameData.NSU_ACADEMY_BRANDS.find(b => b.id === 'etoos');
        state.nsuAcademy = fallback;
        acad = fallback;
        addLog(state, `학원비 부족! ${fallback.name}(으)로 강제 전환되었습니다.`);
      }
    }

    const growth = 1 + (acad?.growthBonus || 0.2);

    if (actionId === 'alba_conv') {
      state.money += 80;
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.2 * growth));
      state.stamina = clamp(state.stamina - 14, 5, 100);
      addLog(state, `${turnObj.label}: 편의점 주말 알바 병행 (+80만 원)`);
    } else if (actionId === 'alba_tutor') {
      state.money += 160;
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => growStat(state, k, 2.8 * growth));
      state.stamina = clamp(state.stamina - 12, 5, 100);
      addLog(state, `${turnObj.label}: 대치동 조교·과외 알바 (+160만 원)`);
    } else if (actionId === 'nsu_rest') {
      state.stamina = clamp(state.stamina + 28, 10, 100);
      state.mental = clamp(state.mental + (state.items.headphones ? 30 : 24), 10, 100);
      addLog(state, `${turnObj.label}: 체력·멘탈 재정비 휴식`);
    } else {
      // 집중 학습
      ['kor', 'math', 'eng', 'soc', 'sci'].forEach(k => {
        let extra = 1.0;
        if (acad?.focusBonus?.includes(k)) extra += 0.22;
        growStat(state, k, 5.2 * growth * extra);
      });
      state.stamina = clamp(state.stamina - (acad?.staminaDrain || 8), 5, 100);
      state.mental = clamp(state.mental - (acad?.mentalDrain || 6), 5, 100);
      addLog(state, `${turnObj.label}: ${acad?.name || '독학'} 집중 커리큘럼 소화`);
    }

    state.nsuTurn++;

    if (turnObj.type === 'mock' || turnObj.type === 'csat') {
      const bonus = (acad?.growthBonus || 0.2) * 14 + state.nsuCount * 3;
      const report = generateKiceReport(state, turnObj.mockTitle, turnObj.type === 'csat', bonus);
      // 6평 장학금 갱신 체크
      if (turnObj.turn === 3 && report.avgGrade <= 1.6) {
        state.tuitionDiscountRate = 0.5;
        addLog(state, '6월 평가원 모평 우수 성적! 재수 학원비 50% 장학 감면 획득!');
      }
      return report;
    }
    return null;
  }

  // 수험생 일대기 자동 스토리 생성
  function generateChronicle(state) {
    const chapters = [];
    chapters.push({
      title: '1장. 출발선 — 중학교 시절과 고입의 갈림길',
      body: `${state.playerName} 학생은 ${state.district.name}에서 학업을 시작했다. ${state.middleSchool}${state.isIntlMiddle ? '(특별전형 합격)' : ''}에서 내신 평균 ${state.msAvgRaw}점(고입 석차 상위 ${state.msPercentile}%)을 기록하며 ${state.majorName} 진학의 꿈을 키웠다.`
    });

    const hsDesc = state.commutePenalty > 0
      ? `고입 전형에서 고배를 마셔 원거리 일반고로 추가 배정되었으나 통학의 어려움을 견디며 ${state.school.name}에서 재도약을 노렸다.`
      : `치열한 경쟁 끝에 ${state.school.name}에 진학하여 본격적인 고교 3년 레이스에 돌입했다.`;

    const firstMock = state.mockHistory[0];
    const lastHsMock = state.mockHistory.find(m => m.isCsat) || state.mockHistory[state.mockHistory.length - 1];
    chapters.push({
      title: '2장. 고교 3년 — 5등급제 내신과 2028 수능의 사투',
      body: `${hsDesc} 고교 누적 내신 ${state.cumulativeGpa || '-'}등급, 생기부(세특) 역량 ${state.setuk}점을 쌓았으며, ${firstMock ? `첫 모의고사 평균 백분위 ${firstMock.avgPct}%에서` : ''} ${lastHsMock ? `본수능 평균 백분위 ${lastHsMock.avgPct}%까지` : ''} 쉼 없이 달렸다.`
    });

    if (state.nsuCount > 0) {
      chapters.push({
        title: `3장. ${state.nsuCount + 1}수의 결단 — 고독한 재도전`,
        body: `${state.isBansu ? `합격한 대학(${state.bansuHoldAdmission?.uniName || ''})에 적을 두고 반수를 결심해` : '더 높은 목표를 향해 과감히 재수를 선택해'} ${state.nsuAcademy?.name || '독학'}에서 땀을 흘렸다. 축제의 불꽃놀이와 수많은 유혹을 이겨내고 다시 수능 시험장에 들어섰다.`
      });
    }

    const adm = state.finalAdmission;
    chapters.push({
      title: '최종장. 합격의 영광',
      body: adm
        ? `마침내 ${adm.year}학년도 ${adm.recruitType}(${adm.admissionType}) 전형으로 ${adm.uni.name} ${adm.majorName}에 당당히 최종 합격하며 기나긴 수험생 일대기에 찬란한 마침표를 찍었다.`
        : `긴 수험 여정을 마무리하고 새로운 미래를 향해 나아갔다.`
    });

    return chapters;
  }

  return {
    createInitialState,
    saveState,
    loadState,
    clearSave,
    addLog,
    addChronicle,
    generateCandidates,
    assignMiddleSchool,
    growStat,
    executeMiddleTurn,
    evaluateSpecialHighSchool,
    getSemesterSubjects,
    getHakgunjiNationalFloor,
    generateKiceReport,
    executeHighSchoolTurn,
    evaluateSusiApplications,
    buildAutoSusiRecommendations,
    evaluateJeongsiApplications,
    executeNsuTurn,
    generateChronicle,
    clamp,
    round2,
    randInt
  };
})();
