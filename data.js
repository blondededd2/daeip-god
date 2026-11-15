// 《대입의 신》 마스터 데이터 (2028학년도 대입 개편안 & 2022 개정 교육과정 완벽 고증)
window.GameData = (() => {
  const DISTRICTS = [
    {
      id: 'daechi',
      name: '서울 강남·서초 (대치동)',
      shortName: '대치동',
      mapX: 168,
      mapY: 74,
      allowance: 300,
      academyEff: 0.30,
      initAdvance: 24,
      diffLabel: '극악 (내신 킬러 문항 출제 빈번)',
      specialNote: '대치동 단과 S반 레벨테스트(승강제) 활성화, 번아웃·비교 스트레스 이벤트 빈번',
      middleSchools: [
        { name: '대명중', gender: 'all' },
        { name: '단대부중', gender: 'all' },
        { name: '역삼중', gender: 'all' },
        { name: '숙명여중(여)', gender: 'F' },
        { name: '휘문중(남)', gender: 'M' }
      ],
      generalHighs: [
        { id: 'whimoon', name: '휘문고(남)', gender: 'M', gradeDiff: 0.95, mockBonus: 19, hakjongBonus: 0.22, desc: '정시 파이터 명문, 내신 극악 · 학군지 모의고사 보정 최상' },
        { id: 'sookmyung', name: '숙명여고(여)', gender: 'F', gradeDiff: 0.95, mockBonus: 19, hakjongBonus: 0.25, desc: '내신 극악 · 대치권 여고 명문 · 모의고사 보정 최상' },
        { id: 'dandae', name: '단대부고', gender: 'all', gradeDiff: 0.85, mockBonus: 17, hakjongBonus: 0.22, desc: '내신 치열 · 정시/수시 균형 강세 명문고' },
        { id: 'gaepo', name: '개포고', gender: 'all', gradeDiff: 0.45, mockBonus: 13, hakjongBonus: 0.16, desc: '대치권 내 상대적 내신 관리형 일반고' }
      ]
    },
    {
      id: 'dongtan',
      name: '경기 화성·동탄 (신도시)',
      shortName: '화성·동탄',
      mapX: 175,
      mapY: 98,
      allowance: 150,
      academyEff: 0.15,
      initAdvance: 13,
      diffLabel: '중상 (표준 밸런스)',
      specialNote: '비평준화 명문고(화성고) 및 평준화 일반고 루트 모두 유리한 정석 학군',
      middleSchools: [
        { name: '동탄목동중', gender: 'all' },
        { name: '청계중', gender: 'all' },
        { name: '솔빛중', gender: 'all' },
        { name: '예당중', gender: 'all' }
      ],
      generalHighs: [
        { id: 'sema', name: '세마고', gender: 'all', gradeDiff: 0.45, mockBonus: 11, hakjongBonus: 0.22, desc: '자율형 공립 명문, 기숙사·학종 프로그램 우수' },
        { id: 'dt_central', name: '동탄중앙고', gender: 'all', gradeDiff: 0.25, mockBonus: 8, hakjongBonus: 0.15, desc: '수시·정시 밸런스 균형형 신도시 일반고' },
        { id: 'byeongjeom', name: '병점고', gender: 'all', gradeDiff: 0.20, mockBonus: 7, hakjongBonus: 0.12, desc: '안정적인 내신과 지역 거점 분위기' },
        { id: 'naru', name: '나루고', gender: 'all', gradeDiff: 0.15, mockBonus: 6, hakjongBonus: 0.12, desc: '내신 확보에 유리한 동탄 일반고' }
      ]
    },
    {
      id: 'metro',
      name: '지방 광역시 (대구 수성·대전 둔산·부산 해운대)',
      shortName: '지방 광역시',
      mapX: 282,
      mapY: 164,
      allowance: 100,
      academyEff: 0.10,
      initAdvance: 10,
      diffLabel: '중',
      specialNote: '지역 자사고·과학고·명문 일반고(경신고 등) 루트 뚜렷',
      middleSchools: [
        { name: '대구 경신중', gender: 'all' },
        { name: '대전 탄방중', gender: 'all' },
        { name: '부산 해운대중', gender: 'all' }
      ],
      generalHighs: [
        { id: 'kyungshin', name: '대구 경신고', gender: 'all', gradeDiff: 0.80, mockBonus: 16, hakjongBonus: 0.20, desc: '수성구 정시·의대 명문고' },
        { id: 'dunsan', name: '대전 둔산여고', gender: 'all', gradeDiff: 0.40, mockBonus: 10, hakjongBonus: 0.16, desc: '둔산 학원가 기반 내신·수능 균형 명문' },
        { id: 'haeundae', name: '부산 해운대고', gender: 'all', gradeDiff: 0.50, mockBonus: 12, hakjongBonus: 0.20, desc: '해운대 지역 전통의 명문고' },
        { id: 'bomoon', name: '대전 보문고', gender: 'all', gradeDiff: 0.15, mockBonus: 6, hakjongBonus: 0.10, desc: '지역 내신 관리가 수월한 일반고' }
      ]
    },
    {
      id: 'rural',
      name: '지방 읍·면 (농어촌)',
      shortName: '농어촌',
      mapX: 196,
      mapY: 146,
      allowance: 50,
      academyEff: -0.10,
      initAdvance: 2,
      diffLabel: '매우 쉬움 (내신 1.0~1.3등급 독식 용이)',
      specialNote: '농어촌 특별전형 지원 자격 획득, 초기 스탯 및 선행도는 낮음',
      middleSchools: [
        { name: '양평 양수중', gender: 'all' },
        { name: '강화중', gender: 'all' },
        { name: '홍천중', gender: 'all' }
      ],
      generalHighs: [
        { id: 'yangpyeong', name: '양평고', gender: 'all', gradeDiff: -0.60, mockBonus: -4, hakjongBonus: 0.08, isRural: true, desc: '농어촌 전형 지원 가능 · 내신 1등급 확보 매우 용이' },
        { id: 'ganghwa', name: '강화고', gender: 'all', gradeDiff: -0.65, mockBonus: -5, hakjongBonus: 0.08, isRural: true, desc: '농어촌 전형 지원 가능 · 내신 1.00~1.35등급 유리' },
        { id: 'hongcheon', name: '홍천고', gender: 'all', gradeDiff: -0.65, mockBonus: -5, hakjongBonus: 0.08, isRural: true, desc: '농어촌 전형 지원 가능 · 모의고사 성장률은 낮아 자습 중요' }
      ]
    }
  ];

  const INTL_MIDDLE_SCHOOLS = ['대원국제중', '영훈국제중', '청심국제중', '부산국제중'];

  const FIELDS = [
    {
      id: 'med',
      name: '의약학계열',
      track: 'stem',
      desc: '최상위권 의·치·한·약·수 계열 진학 목표',
      majors: ['의예과', '치의예과', '한의예과', '약학과', '수의예과']
    },
    {
      id: 'eng',
      name: '자연·공학계열',
      track: 'stem',
      desc: '대한민국 첨단 공학·이공계 핵심 인재 목표',
      majors: ['전자전기공학부', '항공우주공학과', '기계공학부', '화공생명공학부', '신소재공학부']
    },
    {
      id: 'hum',
      name: '인문·상경계열',
      track: 'hum',
      desc: '경영·경제·정치·미디어 리더 양성 목표',
      majors: ['경영학과', '경제학부', '정치외교학과', '미디어학부']
    },
    {
      id: 'edu',
      name: '사범·교육계열',
      track: 'edu',
      desc: '미래 교육을 선도할 예비 교사 및 교육 전문가',
      majors: ['수학교육과', '국어교육과', '초등교육과']
    }
  ];

  // 특수목적고 · 전국자사고 · 외고/국제고 · 명문 IT 특성화고 · 비평준화 명문고 (개별 선택)
  const SPECIAL_HIGH_SCHOOLS = [
    // 영재·과학고
    {
      id: 'sshs', category: '영재·과학고', name: '서울과학고',
      reqText: '수·과 올 A 필수 + 석차 상위 2.0% 이내 + 영재원/경시 스펙 필수',
      maxPct: 2.0, reqMathSciA: true, minSpec: 65, basePass: 0.56,
      gradeDiff: 1.40, mockBonus: 22, hakjongBonus: 0.65, mathSciGrowth: 0.45,
      medPenalty: true, tuition: 25,
      passiveDesc: '수·과 성장률 +45%, 최상위 학종 보정(+0.65등급) / 내신 극악(gradeDiff +1.4), 의약학 지원 시 불이익'
    },
    {
      id: 'gshs', category: '영재·과학고', name: '경기과학고',
      reqText: '수·과 올 A 필수 + 석차 상위 2.0% 이내 + 영재원/경시 스펙 필수',
      maxPct: 2.0, reqMathSciA: true, minSpec: 62, basePass: 0.60,
      gradeDiff: 1.40, mockBonus: 21, hakjongBonus: 0.65, mathSciGrowth: 0.45,
      medPenalty: true, tuition: 25,
      passiveDesc: '수·과 성장률 +45%, 최상위 학종 보정(+0.65등급) / 내신 극악(gradeDiff +1.4), 의약학 지원 시 불이익'
    },
    {
      id: 'djshs', category: '영재·과학고', name: '대전과학고',
      reqText: '수·과 올 A 필수 + 석차 상위 2.0% 이내 + 영재원/경시 스펙 필수',
      maxPct: 2.0, reqMathSciA: true, minSpec: 60, basePass: 0.62,
      gradeDiff: 1.40, mockBonus: 20, hakjongBonus: 0.65, mathSciGrowth: 0.45,
      medPenalty: true, tuition: 25,
      passiveDesc: '수·과 성장률 +45%, 최상위 학종 보정(+0.65등급) / 내신 극악(gradeDiff +1.4), 의약학 지원 시 불이익'
    },
    // 전국 자사고
    {
      id: 'hafs', category: '전국 자사고', name: '외대부고(용인한국외대부설고)',
      reqText: '전 과목 A 권장 + 석차 상위 3.5% 이내',
      maxPct: 3.5, reqAllA: true, minSpec: 45, basePass: 0.66,
      gradeDiff: 1.20, mockBonus: 20, hakjongBonus: 0.55, mockGrowth: 0.35,
      tuition: 80,
      passiveDesc: '모의고사·수능 성장률 +35%, 학종 서류 보정(+0.55등급) / 내신 경쟁 극악(gradeDiff +1.2), 학비 차감'
    },
    {
      id: 'sangsan', category: '전국 자사고', name: '상산고',
      reqText: '전 과목 A 권장 + 석차 상위 3.5% 이내',
      maxPct: 3.5, reqAllA: true, minSpec: 42, basePass: 0.68,
      gradeDiff: 1.20, mockBonus: 19, hakjongBonus: 0.55, mockGrowth: 0.35,
      tuition: 75,
      passiveDesc: '모의고사·수능 성장률 +35%, 의치한수·정시 강세 / 학종 보정(+0.55등급) · 학비 차감'
    },
    {
      id: 'kmla', category: '전국 자사고', name: '민사고(민족사관고)',
      reqText: '전 과목 A 권장 + 석차 상위 3.5% 이내',
      maxPct: 3.5, reqAllA: true, minSpec: 48, basePass: 0.65,
      gradeDiff: 1.20, mockBonus: 19, hakjongBonus: 0.58, mockGrowth: 0.35,
      tuition: 95,
      passiveDesc: '모의고사·수능 성장률 +35%, 최상위 학종 서류 보정(+0.58등급) / 내신 극악 · 학비 차감'
    },
    // 외고·국제고
    {
      id: 'dwfl', category: '외고·국제고', name: '대원외고',
      reqText: '영·국·사 올 A + 석차 상위 5.0% 이내',
      maxPct: 5.0, reqHumA: true, minSpec: 38, basePass: 0.72,
      gradeDiff: 1.00, mockBonus: 14, hakjongBonus: 0.50, korEngGrowth: 0.35,
      stemPenalty: true, tuition: 60,
      passiveDesc: '어문·인문·상경 학종 보정(+0.50등급), 국·영 성장률 +35% / 자연계 지원 불리'
    },
    {
      id: 'dtghs', category: '외고·국제고', name: '동탄국제고',
      reqText: '영·국·사 올 A + 석차 상위 5.0% 이내',
      maxPct: 5.0, reqHumA: true, minSpec: 35, basePass: 0.75,
      gradeDiff: 1.00, mockBonus: 13, hakjongBonus: 0.50, korEngGrowth: 0.35,
      stemPenalty: true, tuition: 45,
      passiveDesc: '어문·인문·상경 학종 보정(+0.50등급), 국·영 성장률 +35% / 자연계 지원 불리'
    },
    // 명문 IT 특성화고
    {
      id: 'dimigo', category: '명문 IT 특성화고', name: '한국디지털미디어고(디미고)',
      reqText: '석차 상위 18% 이내 + 수·과 B 이상 (교내 IT/스펙 우대)',
      maxPct: 18.0, reqMathSciB: true, minSpec: 35, basePass: 0.76,
      gradeDiff: 0.35, mockBonus: 5, hakjongBonus: 0.45,
      itRestricted: true, tuition: 35,
      passiveDesc: 'SW 특기자·특성화고 특별전형 개방, 전자·공학 학종 강력 / 의약학·인문 교차 불가, 정시 자습 필수'
    },
    {
      id: 'sunrin', category: '명문 IT 특성화고', name: '선린인터넷고',
      reqText: '석차 상위 18% 이내 + 수·과 B 이상 (교내 IT/스펙 우대)',
      maxPct: 18.0, reqMathSciB: true, minSpec: 32, basePass: 0.78,
      gradeDiff: 0.35, mockBonus: 4, hakjongBonus: 0.42,
      itRestricted: true, tuition: 15,
      passiveDesc: 'SW 특기자·특성화고 특별전형 개방, 전자·공학 학종 강력 / 의약학·인문 교차 불가, 정시 자습 필수'
    },
    {
      id: 'dksh', category: '명문 IT 특성화고', name: '단대소고(단국대부속소프트웨어고)',
      reqText: '석차 상위 18% 이내 + 수·과 B 이상 (교내 IT/스펙 우대)',
      maxPct: 18.0, reqMathSciB: true, minSpec: 30, basePass: 0.80,
      gradeDiff: 0.35, mockBonus: 4, hakjongBonus: 0.40,
      itRestricted: true, tuition: 20,
      passiveDesc: 'SW 특기자·특성화고 특별전형 개방, 전자·공학 학종 강력 / 의약학·인문 교차 불가, 정시 자습 필수'
    },
    // 비평준화 명문고
    {
      id: 'hwaseong', category: '비평준화 명문고', name: '화성고',
      reqText: '석차 상위 8% 이내',
      maxPct: 8.0, minSpec: 20, basePass: 0.80,
      gradeDiff: 0.55, mockBonus: 14, hakjongBonus: 0.28, mockGrowth: 0.25,
      tuition: 20,
      passiveDesc: '기숙사 정시·수시 균형 버프(모의고사 성장률 +25%), 적당한 내신 난이도(gradeDiff +0.55)'
    },
    {
      id: 'hanil', category: '비평준화 명문고', name: '한일고(공주)',
      reqText: '석차 상위 8% 이내',
      maxPct: 8.0, minSpec: 22, basePass: 0.78,
      gradeDiff: 0.55, mockBonus: 15, hakjongBonus: 0.28, mockGrowth: 0.25,
      tuition: 25,
      passiveDesc: '전국 단위 기숙사 자율학습 명문(모의고사 성장률 +25%), 정시·수시 균형 강세'
    }
  ];

  // 고등학교 18턴 상세 학사 일정
  const HS_TURNS = [
    // 고1 (6턴)
    { id: 'hs1_1_mid', grade: 1, sem: 1, type: 'mid', label: '고1 1학기 중간고사', season: 'spring', date: '2025.04' },
    { id: 'hs1_1_fin', grade: 1, sem: 1, type: 'fin', label: '고1 1학기 기말고사', season: 'summer', date: '2025.07' },
    { id: 'hs1_1_mock', grade: 1, sem: 1, type: 'mock', mockTitle: '2025학년도 6월 고1 전국연합학력평가', label: '고1 6월 학력평가', season: 'summer', date: '2025.06' },
    { id: 'hs1_2_mid', grade: 1, sem: 2, type: 'mid', label: '고1 2학기 중간고사', season: 'autumn', date: '2025.10' },
    { id: 'hs1_2_fin', grade: 1, sem: 2, type: 'fin', label: '고1 2학기 기말고사', season: 'winter', date: '2025.12' },
    { id: 'hs1_2_mock', grade: 1, sem: 2, type: 'mock', mockTitle: '2025학년도 11월 고1 전국연합학력평가', label: '고1 11월 학력평가', season: 'autumn', date: '2025.11' },
    // 고2 (6턴)
    { id: 'hs2_1_mid', grade: 2, sem: 1, type: 'mid', label: '고2 1학기 중간고사', season: 'spring', date: '2026.04', needCourse2: true },
    { id: 'hs2_1_fin', grade: 2, sem: 1, type: 'fin', label: '고2 1학기 기말고사', season: 'summer', date: '2026.07' },
    { id: 'hs2_1_mock', grade: 2, sem: 1, type: 'mock', mockTitle: '2026학년도 6월 고2 전국연합학력평가', label: '고2 6월 학력평가', season: 'summer', date: '2026.06' },
    { id: 'hs2_2_mid', grade: 2, sem: 2, type: 'mid', label: '고2 2학기 중간고사', season: 'autumn', date: '2026.10' },
    { id: 'hs2_2_fin', grade: 2, sem: 2, type: 'fin', label: '고2 2학기 기말고사', season: 'winter', date: '2026.12' },
    { id: 'hs2_2_mock', grade: 2, sem: 2, type: 'mock', mockTitle: '2026학년도 11월 고2 전국연합학력평가', label: '고2 11월 학력평가', season: 'autumn', date: '2026.11', postCounsel: true },
    // 고3 (6턴)
    { id: 'hs3_1_mid', grade: 3, sem: 1, type: 'mid', label: '고3 1학기 중간고사', season: 'spring', date: '2027.04', needCourse3: true },
    { id: 'hs3_1_fin', grade: 3, sem: 1, type: 'fin', label: '고3 1학기 기말고사 (수시 내신 마감)', season: 'summer', date: '2027.07' },
    { id: 'hs3_1_mock', grade: 3, sem: 1, type: 'mock', isEval: true, mockTitle: '2028학년도 대학수학능력시험 6월 모의평가', label: '고3 6월 평가원 모의평가', season: 'summer', date: '2027.06' },
    { id: 'hs3_2_mock', grade: 3, sem: 2, type: 'mock', isEval: true, mockTitle: '2028학년도 대학수학능력시험 9월 모의평가', label: '고3 여름방학 파이널 & 9월 평가원 모평', season: 'autumn', date: '2027.09', openSusiAfter: true },
    { id: 'hs3_csat', grade: 3, sem: 2, type: 'csat', isEval: true, mockTitle: '2028학년도 대학수학능력시험', label: '2028학년도 대학수학능력시험 (본수능)', season: 'winter', date: '2027.11', openResultsAfter: true },
    { id: 'hs3_final', grade: 3, sem: 2, type: 'admissions', label: '수시 최종 발표 & 정시 원서 접수', season: 'winter', date: '2027.12' }
  ];

  // 2022 개정 교육과정 선택과목 풀
  const ELECTIVES_HS2 = {
    mathSem2: ['미적분Ⅰ', '확률과 통계'],
    stemTamgu: ['물리학', '화학', '생명과학', '지구과학'],
    humTamgu: ['세계시민과 지리', '사회와 문화', '경제', '정치', '법과 사회']
  };

  const ELECTIVES_HS3 = {
    mathPair: [
      { id: 'stem', label: '미적분Ⅱ (1학기) / 기하 (2학기)', sem1: '미적분Ⅱ', sem2: '기하', isStem: true },
      { id: 'hum', label: '확률과 통계 (1학기) / 경제수학 (2학기)', sem1: '확률과 통계', sem2: '경제수학', isStem: false }
    ],
    stemTamgu: ['역학과 에너지', '물질과 에너지', '세포와 물질대사', '생물의 유전'],
    humTamgu: ['사회문제 탐구', '윤리와 사상', '국제 관계의 이해']
  };

  // 대학 SVG 로고 생성기 (고유 컬러, 방패/원형, 이니셜 반영)
  function buildUniSvg(uni) {
    const c1 = uni.color;
    const c2 = uni.accent || '#FFFFFF';
    if (uni.emblemType === 'shield') {
      return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 H54 V32 C54 47 32 58 32 58 C32 58 10 47 10 32 Z" fill="${c1}" stroke="#C5A059" stroke-width="2.5"/>
        <path d="M15 15 H49 V31 C49 42 32 51 32 51 C32 51 15 42 15 31 Z" fill="none" stroke="${c2}" stroke-opacity="0.45" stroke-width="1.5"/>
        <text x="32" y="36" text-anchor="middle" fill="${c2}" font-family="Noto Serif KR, serif" font-weight="900" font-size="${uni.abbr.length > 3 ? 11 : 14}">${uni.abbr}</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="27" fill="${c1}" stroke="#C5A059" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="${c2}" stroke-opacity="0.45" stroke-width="1.5"/>
      <text x="32" y="37" text-anchor="middle" fill="${c2}" font-family="Noto Serif KR, serif" font-weight="900" font-size="${uni.abbr.length > 3 ? 11 : 14}">${uni.abbr}</text>
    </svg>`;
  }

  // 대학 데이터 (명세 9.1 18개 주요 대학 + 초등교육과 실존 대학 서울교대/한국교원대)
  // 각 대학의 실제 개설 모집단위만 매핑
  const UNIVERSITIES = [
    {
      id: 'snu', name: '서울대학교', abbr: 'SNU', color: '#0F3077', accent: '#FFFFFF', emblemType: 'shield',
      tier: 1, jeongsiGroup: '나', jeongsiGpaWeight: true,
      susiMin: { type: 'sum3', limit: 7, desc: '지균 3합 7 (의·치·약·수 3합 5)' },
      medMin: { type: 'sum3', limit: 4, desc: '3합 4' },
      majors: {
        '의예과': '의예과', '치의예과': '치의예과', '약학과': '약학계열', '수의예과': '수의예과',
        '전자전기공학부': '전기·정보공학부', '항공우주공학과': '항공우주공학과', '기계공학부': '기계공학부', '화공생명공학부': '화학생물공학부', '신소재공학부': '재료공학부',
        '경영학과': '경영대학', '경제학부': '경제학부', '정치외교학과': '정치외교학부', '미디어학부': '언론정보학과',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.00, gyokwaOpt: 1.03, hakjongCons: 1.08, hakjongOpt: 1.45, jeongsiPct: 99.4 },
        main: { gyokwaCons: 1.00, gyokwaOpt: 1.08, hakjongCons: 1.15, hakjongOpt: 1.65, jeongsiPct: 98.4 }
      }
    },
    {
      id: 'ysu', name: '연세대학교', abbr: 'YSU', color: '#003876', accent: '#FFFFFF', emblemType: 'circle',
      tier: 1, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 6, desc: '추천형 3합 6 (의·치·약 3합 5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '의예과': '의예과', '치의예과': '치의예과', '약학과': '약학과',
        '전자전기공학부': '전기전자공학부', '기계공학부': '기계공학부', '화공생명공학부': '화공생명공학부', '신소재공학부': '신소재공학부',
        '경영학과': '경영학과', '경제학부': '경제학부', '정치외교학과': '정치외교학과', '미디어학부': '언론홍보영상학부'
      },
      cutoffs: {
        med: { gyokwaCons: 1.00, gyokwaOpt: 1.05, hakjongCons: 1.12, hakjongOpt: 1.50, jeongsiPct: 99.1 },
        main: { gyokwaCons: 1.00, gyokwaOpt: 1.12, hakjongCons: 1.25, hakjongOpt: 1.75, jeongsiPct: 97.6 }
      }
    },
    {
      id: 'ku', name: '고려대학교', abbr: 'KU', color: '#860020', accent: '#FFFFFF', emblemType: 'shield',
      tier: 1, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 6, desc: '학교추천 3합 6 (의대 4합 5)' },
      medMin: { type: 'sum3', limit: 4, desc: '3합 4' },
      majors: {
        '의예과': '의과대학',
        '전자전기공학부': '전기전자공학부', '기계공학부': '기계공학부', '화공생명공학부': '화공생명공학과', '신소재공학부': '신소재공학부',
        '경영학과': '경영대학', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '미디어학부',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.00, gyokwaOpt: 1.06, hakjongCons: 1.15, hakjongOpt: 1.55, jeongsiPct: 99.0 },
        main: { gyokwaCons: 1.00, gyokwaOpt: 1.14, hakjongCons: 1.28, hakjongOpt: 1.80, jeongsiPct: 97.4 }
      }
    },
    {
      id: 'skku', name: '성균관대학교', abbr: 'SKKU', color: '#0B5D3B', accent: '#E8C547', emblemType: 'circle',
      tier: 2, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 6, desc: '학교장추천 3합 6 (의·약 3합 5)' },
      medMin: { type: 'sum3', limit: 4, desc: '3합 4' },
      majors: {
        '의예과': '의예과', '약학과': '약학과',
        '전자전기공학부': '전자전기공학부', '기계공학부': '기계공학부', '화공생명공학부': '화학공학/고분자공학부', '신소재공학부': '신소재공학부',
        '경영학과': '경영학과', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학과',
        '수학교육과': '수학교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.00, gyokwaOpt: 1.06, hakjongCons: 1.15, hakjongOpt: 1.55, jeongsiPct: 99.0 },
        main: { gyokwaCons: 1.08, gyokwaOpt: 1.22, hakjongCons: 1.38, hakjongOpt: 1.88, jeongsiPct: 96.3 }
      }
    },
    {
      id: 'sgu', name: '서강대학교', abbr: 'SGU', color: '#8B0029', accent: '#FFFFFF', emblemType: 'shield',
      tier: 2, jeongsiGroup: '나',
      susiMin: { type: 'sum3', limit: 7, desc: '지역균형 3합 7 / 일반 학종 최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자공학과', '기계공학부': '기계공학과', '화공생명공학부': '화공생명공학과',
        '경영학과': '경영학부', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '지식융합미디어학부'
      },
      cutoffs: {
        main: { gyokwaCons: 1.10, gyokwaOpt: 1.24, hakjongCons: 1.40, hakjongOpt: 1.92, jeongsiPct: 96.1 }
      }
    },
    {
      id: 'hyu', name: '한양대학교', abbr: 'HYU', color: '#0E4A84', accent: '#FFFFFF', emblemType: 'circle',
      tier: 2, jeongsiGroup: '나',
      susiMin: { type: 'none', desc: '교과·학종 수능최저 없음 (의예과 논술/학종 일부 3합 4)' },
      medMin: { type: 'sum3', limit: 4, desc: '의예과 3합 4' },
      majors: {
        '의예과': '의예과',
        '전자전기공학부': '융합전자공학부', '기계공학부': '기계공학부', '화공생명공학부': '화학공학과', '신소재공학부': '신소재공학부',
        '경영학과': '경영학부', '경제학부': '경제금융학부', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학과',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.00, gyokwaOpt: 1.07, hakjongCons: 1.16, hakjongOpt: 1.56, jeongsiPct: 98.9 },
        main: { gyokwaCons: 1.06, gyokwaOpt: 1.22, hakjongCons: 1.42, hakjongOpt: 1.92, jeongsiPct: 96.0 }
      }
    },
    {
      id: 'cau', name: '중앙대학교', abbr: 'CAU', color: '#004F9F', accent: '#FFFFFF', emblemType: 'circle',
      tier: 3, jeongsiGroup: '다',
      susiMin: { type: 'sum3', limit: 7, desc: '지역균형 3합 7 (의·약 3합 5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '의예과': '의학부', '약학과': '약학부',
        '전자전기공학부': '전자전기공학부', '기계공학부': '기계공학부', '화공생명공학부': '화학공학부', '신소재공학부': '첨단소재공학과',
        '경영학과': '경영학부', '경제학부': '경제학부', '정치외교학과': '정치국제학과', '미디어학부': '미디어커뮤니케이션학부'
      },
      cutoffs: {
        med: { gyokwaCons: 1.02, gyokwaOpt: 1.10, hakjongCons: 1.20, hakjongOpt: 1.62, jeongsiPct: 98.5 },
        main: { gyokwaCons: 1.15, gyokwaOpt: 1.32, hakjongCons: 1.48, hakjongOpt: 1.98, jeongsiPct: 94.3 }
      }
    },
    {
      id: 'khu', name: '경희대학교', abbr: 'KHU', color: '#9E1B32', accent: '#D4AF37', emblemType: 'circle',
      tier: 3, jeongsiGroup: '나',
      susiMin: { type: 'sum2', limit: 5, desc: '지역균형 2합 5 (의·치·한·약 3합 4~5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '의예과': '의예과', '치의예과': '치의예과', '한의예과': '한의예과', '약학과': '약학과',
        '전자전기공학부': '전자공학과', '항공우주공학과': '우주과학과', '기계공학부': '기계공학과', '화공생명공학부': '화학공학과', '신소재공학부': '신소재공학과',
        '경영학과': '경영학과', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '미디어학과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.02, gyokwaOpt: 1.12, hakjongCons: 1.22, hakjongOpt: 1.65, jeongsiPct: 98.3 },
        main: { gyokwaCons: 1.16, gyokwaOpt: 1.35, hakjongCons: 1.52, hakjongOpt: 2.02, jeongsiPct: 93.8 }
      }
    },
    {
      id: 'hufs', name: '한국외국어대학교', abbr: 'HUFS', color: '#002D56', accent: '#D1A054', emblemType: 'circle',
      tier: 3, jeongsiGroup: '다',
      susiMin: { type: 'sum2', limit: 4, desc: '학교장추천 2합 4 / 일반 학종 최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자공학과',
        '경영학과': '경영학부', '경제학부': '경제학부', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학부'
      },
      cutoffs: {
        main: { gyokwaCons: 1.20, gyokwaOpt: 1.38, hakjongCons: 1.56, hakjongOpt: 2.06, jeongsiPct: 93.0 }
      }
    },
    {
      id: 'uos', name: '서울시립대학교', abbr: 'UOS', color: '#004C97', accent: '#FFFFFF', emblemType: 'shield',
      tier: 3, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 7, desc: '지역균형 3합 7 / 학종 최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자전기컴퓨터공학부', '기계공학부': '기계정보공학과', '화공생명공학부': '화학공학과', '신소재공학부': '신소재공학과',
        '경영학과': '경영학부', '경제학부': '경제학부'
      },
      cutoffs: {
        main: { gyokwaCons: 1.18, gyokwaOpt: 1.35, hakjongCons: 1.52, hakjongOpt: 2.04, jeongsiPct: 93.5 }
      }
    },
    {
      id: 'kku', name: '건국대학교', abbr: 'KKU', color: '#036B3F', accent: '#FFFFFF', emblemType: 'circle',
      tier: 4, jeongsiGroup: '나',
      susiMin: { type: 'sum2', limit: 5, desc: 'KU지역균형 2합 5 (수의예 3합 5)' },
      medMin: { type: 'sum3', limit: 5, desc: '수의예 3합 5' },
      majors: {
        '수의예과': '수의예과',
        '전자전기공학부': '전기전자공학부', '항공우주공학과': '항공우주·모빌리티공학과', '기계공학부': '기계·로봇·자동차공학부', '화공생명공학부': '화학공학부', '신소재공학부': '재료공학과',
        '경영학과': '경영학과', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.05, gyokwaOpt: 1.15, hakjongCons: 1.28, hakjongOpt: 1.72, jeongsiPct: 97.8 },
        main: { gyokwaCons: 1.24, gyokwaOpt: 1.44, hakjongCons: 1.62, hakjongOpt: 2.12, jeongsiPct: 91.8 }
      }
    },
    {
      id: 'dgu', name: '동국대학교', abbr: 'DGU', color: '#D97724', accent: '#FFFFFF', emblemType: 'circle',
      tier: 4, jeongsiGroup: '가',
      susiMin: { type: 'sum2', limit: 5, desc: '학교장추천 2합 5 (한의·약학 3합 5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '한의예과': '한의예과', '약학과': '약학과',
        '전자전기공학부': '전자전기공학부', '기계공학부': '기계로봇에너지공학과', '화공생명공학부': '화공생물공학과',
        '경영학과': '경영학과', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학전공',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.05, gyokwaOpt: 1.15, hakjongCons: 1.28, hakjongOpt: 1.70, jeongsiPct: 97.8 },
        main: { gyokwaCons: 1.25, gyokwaOpt: 1.46, hakjongCons: 1.64, hakjongOpt: 2.15, jeongsiPct: 91.2 }
      }
    },
    {
      id: 'hiu', name: '홍익대학교', abbr: 'HIU', color: '#1F3A93', accent: '#FFFFFF', emblemType: 'shield',
      tier: 4, jeongsiGroup: '다',
      susiMin: { type: 'sum3', limit: 7, desc: '학교장추천 3합 7' },
      majors: {
        '전자전기공학부': '전자·전기공학부', '기계공학부': '기계·시스템디자인공학과', '화공생명공학부': '화학공학과', '신소재공학부': '신소재공학과',
        '경영학과': '경영학부', '경제학부': '경제학부'
      },
      cutoffs: {
        main: { gyokwaCons: 1.28, gyokwaOpt: 1.50, hakjongCons: 1.68, hakjongOpt: 2.18, jeongsiPct: 90.2 }
      }
    },
    {
      id: 'knu', name: '경북대학교', abbr: 'KNU', color: '#B71C1C', accent: '#FFFFFF', emblemType: 'circle',
      tier: 4, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 7, desc: '교과 2합 6~3합 7 (의·치·약·수 3합 4~5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '의예과': '의예과', '치의예과': '치의예과', '약학과': '약학과', '수의예과': '수의예과',
        '전자전기공학부': '전자공학부', '항공우주공학과': '기계항공공학부(항공우주)', '기계공학부': '기계공학부', '화공생명공학부': '화학공학과', '신소재공학부': '신소재공학부',
        '경영학과': '경영학부', '경제학부': '경제통상학부', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학과',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.02, gyokwaOpt: 1.12, hakjongCons: 1.24, hakjongOpt: 1.66, jeongsiPct: 98.2 },
        main: { gyokwaCons: 1.35, gyokwaOpt: 1.60, hakjongCons: 1.75, hakjongOpt: 2.25, jeongsiPct: 86.5 }
      }
    },
    {
      id: 'pnu', name: '부산대학교', abbr: 'PNU', color: '#004A98', accent: '#FFFFFF', emblemType: 'circle',
      tier: 4, jeongsiGroup: '나',
      susiMin: { type: 'sum2', limit: 5, desc: '교과 2합 5 (의·치·한·약 3합 4~5)' },
      medMin: { type: 'sum3', limit: 5, desc: '3합 5' },
      majors: {
        '의예과': '의예과', '치의예과': '치의예과', '한의예과': '한의예과', '약학과': '약학과',
        '전자전기공학부': '전기전자공학부', '항공우주공학과': '항공우주공학과', '기계공학부': '기계공학부', '화공생명공학부': '화공생명·환경공학부', '신소재공학부': '재료공학부',
        '경영학과': '경영학과', '경제학부': '경제학부', '정치외교학과': '정치외교학과', '미디어학부': '미디어커뮤니케이션학과',
        '수학교육과': '수학교육과', '국어교육과': '국어교육과'
      },
      cutoffs: {
        med: { gyokwaCons: 1.02, gyokwaOpt: 1.12, hakjongCons: 1.24, hakjongOpt: 1.66, jeongsiPct: 98.2 },
        main: { gyokwaCons: 1.35, gyokwaOpt: 1.60, hakjongCons: 1.75, hakjongOpt: 2.25, jeongsiPct: 86.5 }
      }
    },
    {
      id: 'kmu', name: '국민대학교', abbr: 'KMU', color: '#2E3192', accent: '#FFFFFF', emblemType: 'shield',
      tier: 5, jeongsiGroup: '가',
      susiMin: { type: 'none', desc: '교과 2합 6 / 일반 학종 수능최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자공학부', '기계공학부': '기계공학부', '화공생명공학부': '응용화학부', '신소재공학부': '신소재공학부',
        '경영학과': '경영학부', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '언론정보학부'
      },
      cutoffs: {
        main: { gyokwaCons: 1.42, gyokwaOpt: 1.68, hakjongCons: 1.78, hakjongOpt: 2.30, jeongsiPct: 85.0 }
      }
    },
    {
      id: 'ssu', name: '숭실대학교', abbr: 'SSU', color: '#009FE3', accent: '#FFFFFF', emblemType: 'circle',
      tier: 5, jeongsiGroup: '다',
      susiMin: { type: 'none', desc: '학생부우수자 2합 5 / 학종 수능최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자정보공학부', '기계공학부': '기계공학부', '화공생명공학부': '화학공학과', '신소재공학부': '유기신소재·파이버공학과',
        '경영학과': '경영학부', '경제학부': '경제학과', '정치외교학과': '정치외교학과', '미디어학부': '언론홍보학과'
      },
      cutoffs: {
        main: { gyokwaCons: 1.42, gyokwaOpt: 1.68, hakjongCons: 1.80, hakjongOpt: 2.30, jeongsiPct: 84.5 }
      }
    },
    {
      id: 'sju', name: '세종대학교', abbr: 'SJU', color: '#C3002F', accent: '#FFFFFF', emblemType: 'circle',
      tier: 5, jeongsiGroup: '나',
      susiMin: { type: 'sum2', limit: 5, desc: '지역균형 2합 5 / 학종 최저 없음' },
      hakjongNoMin: true,
      majors: {
        '전자전기공학부': '전자정보통신공학과', '항공우주공학과': '우주항공시스템공학부', '기계공학부': '기계공학과', '신소재공학부': '나노신소재공학과',
        '경영학과': '경영학부', '경제학부': '경제학과', '미디어학부': '미디어커뮤니케이션학과'
      },
      cutoffs: {
        main: { gyokwaCons: 1.44, gyokwaOpt: 1.70, hakjongCons: 1.82, hakjongOpt: 2.32, jeongsiPct: 84.0 }
      }
    },
    // 초등교육과 지원자를 위한 교원·교육대 라인업
    {
      id: 'snue', name: '서울교육대학교', abbr: 'SNUE', color: '#1E40AF', accent: '#FFFFFF', emblemType: 'circle',
      tier: 3, jeongsiGroup: '나',
      susiMin: { type: 'sum3', limit: 7, desc: '교직인성우수자 3합 7 (또는 4합 9)' },
      majors: { '초등교육과': '초등교육과' },
      cutoffs: {
        main: { gyokwaCons: 1.15, gyokwaOpt: 1.35, hakjongCons: 1.45, hakjongOpt: 1.95, jeongsiPct: 92.5 }
      }
    },
    {
      id: 'knue', name: '한국교원대학교', abbr: 'KNUE', color: '#0D9488', accent: '#FFFFFF', emblemType: 'shield',
      tier: 3, jeongsiGroup: '가',
      susiMin: { type: 'sum3', limit: 7, desc: '학생부종합/교과 3합 7' },
      majors: { '수학교육과': '수학교육과', '국어교육과': '국어교육과', '초등교육과': '초등교육과' },
      cutoffs: {
        main: { gyokwaCons: 1.15, gyokwaOpt: 1.36, hakjongCons: 1.45, hakjongOpt: 1.98, jeongsiPct: 92.0 }
      }
    }
  ];

  // N수 학원/인강 7개 브랜드
  const NSU_ACADEMY_BRANDS = [
    {
      id: 'sidae', category: '대형 재종', name: '시대인재 (대치 본원)',
      cost: 120, growthBonus: 0.55, reqGrade: 2.5, hasExamTest: true,
      staminaDrain: 18, mentalDrain: 14, selfStudyBlockRate: 0.5,
      desc: '수능 스탯 성장률 +55%, 매주 서바이벌 실전 모의고사 보너스 / 체력·멘탈 소모 극심 (직전 수능 2.5 이내 무시험)'
    },
    {
      id: 'kangdae', category: '대형 재종', name: '강남대성 (강대 본원)',
      cost: 110, growthBonus: 0.50, reqGrade: 2.5, hasExamTest: true,
      staminaDrain: 14, mentalDrain: 12, selfStudyBlockRate: 0.5,
      desc: '수능 스탯 성장률 +50%, 국·수 기출 분석 및 강대K 모의고사 보너스 / 엄격한 생활 통제 (직전 수능 2.5 이내 무시험)'
    },
    {
      id: 'russell', category: '관리형 독재', name: '메가스터디 러셀',
      cost: 65, growthBonus: 0.35, reqGrade: 9.0, hasExamTest: false,
      staminaDrain: 8, mentalDrain: 7, selfStudyBlockRate: 0.55,
      desc: '성장률 +35%, 바른공부 자습전용관 + 단과 선택 시너지'
    },
    {
      id: 'itall', category: '관리형 독재', name: '잇올 스파르타',
      cost: 55, growthBonus: 0.30, reqGrade: 9.0, hasExamTest: false,
      staminaDrain: 9, mentalDrain: 8, selfStudyBlockRate: 0.85,
      desc: '성장률 +30%, 휴대폰 수거·강제 기상으로 나태함/유혹 이벤트 85% 차단'
    },
    {
      id: 'megapass', category: '집 독학 + 인강', name: '메가스터디 (메가패스)',
      cost: 0, initCost: 50, growthBonus: 0.22, reqGrade: 9.0, isHome: true, allowAlba: true,
      staminaDrain: 4, mentalDrain: 5, selfStudyBlockRate: 0.0,
      focusBonus: ['math', 'sci'],
      desc: '초기 패스비 50만 원(이후 턴당 0원, 알바 병행 가능) | 수학·과학탐구 1타 강사 보너스(+22%)'
    },
    {
      id: 'daesung19', category: '집 독학 + 인강', name: '대성마이맥 (19패스)',
      cost: 0, initCost: 40, growthBonus: 0.22, reqGrade: 9.0, isHome: true, allowAlba: true,
      staminaDrain: 4, mentalDrain: 5, selfStudyBlockRate: 0.0,
      focusBonus: ['kor', 'math', 'soc'],
      desc: '초기 패스비 40만 원(이후 턴당 0원, 알바 병행 가능) | 국어·수학·사회탐구 균형 보너스(+22%)'
    },
    {
      id: 'etoos', category: '집 독학 + 인강', name: '이투스 (이투스 패스)',
      cost: 0, initCost: 35, growthBonus: 0.22, reqGrade: 9.0, isHome: true, allowAlba: true,
      staminaDrain: 4, mentalDrain: 5, selfStudyBlockRate: 0.0,
      focusBonus: ['soc', 'sci', 'eng'],
      desc: '초기 패스비 35만 원(이후 턴당 0원, 알바 병행 가능) | 탐구 과목 및 기본기 급상승 보너스(+22%)'
    }
  ];

  // N수 7턴 연간 커리큘럼
  const NSU_TURNS = [
    { turn: 1, label: 'N수 2~3월 (정규반 개강 & 3월 더프 모의고사)', type: 'mock', mockTitle: '3월 더 프리미엄(더프) 모의고사', season: 'spring', date: '03월' },
    { turn: 2, label: 'N수 4~5월 (대학 대동제 시즌 & 1차 슬럼프 위기)', type: 'study', season: 'spring', date: '05월', triggerFestival: true },
    { turn: 3, label: 'N수 6월 (평가원 6월 모의평가 & 반수생 대거 유입)', type: 'mock', isEval: true, mockTitle: '2029학년도 대학수학능력시험 6월 모의평가', season: 'summer', date: '06월' },
    { turn: 4, label: 'N수 7~8월 (혹서기 체력 고갈 & 서바이벌/강대K 실모)', type: 'study', season: 'summer', date: '08월' },
    { turn: 5, label: 'N수 9월 (평가원 9월 모의평가 & 수시 지원 여부 결정)', type: 'mock', isEval: true, mockTitle: '2029학년도 대학수학능력시험 9월 모의평가', season: 'autumn', date: '09월', nsuSusiChoice: true },
    { turn: 6, label: 'N수 10월 (파이널 실전 모의고사 & D-30 극한 멘탈 방어)', type: 'study', season: 'autumn', date: '10월' },
    { turn: 7, label: 'N수 11월 (대학수학능력시험 본수능 & 대입 최종 결판)', type: 'csat', isEval: true, mockTitle: '2029학년도 대학수학능력시험', season: 'winter', date: '11월' }
  ];

  // 수험생 상점 아이템 5종
  const SHOP_ITEMS = [
    {
      id: 'energy_drink', name: '고카페인 에너지드링크', price: 10, consumable: true,
      desc: '체력 +15 즉시 회복, 다음 시험 집중력 소폭 상승 (+4)'
    },
    {
      id: 'headphones', name: '노이즈캔슬링 헤드폰', price: 45, consumable: false,
      desc: '멘탈 회복량 영구 +15%, 독학 효율 상승'
    },
    {
      id: 'ipad', name: '아이패드 프로 & 애플펜슬', price: 120, consumable: false,
      desc: '인강 및 기출 오답 정리 효율 영구 +15%'
    },
    {
      id: 'padding', name: '명품 등골브레이커 패딩', price: 80, consumable: true,
      desc: '멘탈 즉시 +35 회복, 교내 자존감 회복'
    },
    {
      id: 'gongjindan', name: '수험생 황제 공진단', price: 60, consumable: true,
      desc: '체력 +45, 멘탈 +30 즉시 회복 (고3·재수 여름방학 필수템)'
    }
  ];

  return {
    DISTRICTS,
    INTL_MIDDLE_SCHOOLS,
    FIELDS,
    SPECIAL_HIGH_SCHOOLS,
    HS_TURNS,
    ELECTIVES_HS2,
    ELECTIVES_HS3,
    UNIVERSITIES,
    NSU_ACADEMY_BRANDS,
    NSU_TURNS,
    SHOP_ITEMS,
    buildUniSvg
  };
})();
