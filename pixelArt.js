// 《대입의 신》 픽셀 아트 뷰포트 & 미니 캔버스 & 합격통지서 PNG 익스포터
window.PixelArt = (() => {
  // 논리 해상도 240x135 (480x270 캔버스에 2x 스케일로 정밀 도트 렌더링)
  const LW = 240;
  const LH = 135;

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // 계절별 디더링 창밖 풍경 헬퍼
  function drawSeasonalWindow(ctx, x, y, w, h, season, tick) {
    const skyColors = {
      spring: ['#7DD3FC', '#BAE6FD'],
      summer: ['#38BDF8', '#7DD3FC'],
      autumn: ['#FDBA74', '#FED7AA'],
      winter: ['#94A3B8', '#CBD5E1']
    };
    const [topC, botC] = skyColors[season] || skyColors.spring;
    px(ctx, x, y, w, h, topC);
    // 디더링 수평 밴드
    for (let dy = Math.floor(h * 0.45); dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (dy > h * 0.65 || (dx + dy) % 2 === 0) {
          px(ctx, x + dx, y + dy, 1, 1, botC);
        }
      }
    }
    // 나무 실루엣 & 계절 입자
    const treeC = season === 'spring' ? '#F9A8D4'
      : season === 'summer' ? '#16A34A'
      : season === 'autumn' ? '#EA580C'
      : '#E2E8F0';
    px(ctx, x + 6, y + h - 8, 3, 8, '#78350F');
    px(ctx, x + 2, y + h - 16, 11, 9, treeC);
    px(ctx, x + w - 12, y + h - 7, 3, 7, '#78350F');
    px(ctx, x + w - 16, y + h - 14, 11, 8, treeC);

    // 떨어지는 벚꽃/단풍/눈 애니메이션
    if (season === 'spring' || season === 'autumn' || season === 'winter') {
      const pColor = season === 'spring' ? '#FDF2F8' : season === 'autumn' ? '#DC2626' : '#FFFFFF';
      for (let i = 0; i < 7; i++) {
        const pxX = x + ((i * 11 + Math.floor(tick * 0.4)) % (w - 2));
        const pxY = y + ((i * 7 + Math.floor(tick * 0.7)) % (h - 2));
        px(ctx, pxX, pxY, 1, 1, pColor);
      }
    }
    // 창틀
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    px(ctx, x + w / 2, y, 1, h, '#94A3B8');
    px(ctx, x, y + h / 2, w, 1, '#94A3B8');
  }

  // 학생 도트 캐릭터 (앉은 모습)
  function drawStudentAtDesk(ctx, x, y, state, tick, isExam) {
    const gender = state?.gender || 'M';
    const stamina = state?.stamina ?? 80;
    const mental = state?.mental ?? 80;
    const hasHeadphones = state?.items?.headphones;
    const uniformColor = state?.schoolTier === 'special' ? '#1E293B' : '#334155';
    const tieColor = gender === 'F' ? '#DC2626' : '#2563EB';
    const bob = Math.sin(tick * 0.12) > 0.6 ? 1 : 0;

    // 의자 등받이
    px(ctx, x + 3, y + 14, 10, 12, '#475569');
    // 몸통 (교복)
    px(ctx, x + 2, y + 12 + bob, 12, 12, uniformColor);
    // 넥타이/리본
    px(ctx, x + 7, y + 13 + bob, 2, 5, tieColor);
    // 머리
    px(ctx, x + 3, y + 2 + bob, 10, 10, '#FDBA74');
    // 머리카락
    px(ctx, x + 2, y + 1 + bob, 12, 4, '#1E293B');
    if (gender === 'F') {
      px(ctx, x + 2, y + 4 + bob, 2, 7, '#1E293B');
      px(ctx, x + 12, y + 4 + bob, 2, 7, '#1E293B');
    } else {
      px(ctx, x + 2, y + 4 + bob, 1, 3, '#1E293B');
      px(ctx, x + 13, y + 4 + bob, 1, 3, '#1E293B');
    }
    // 안경 + 눈
    px(ctx, x + 4, y + 6 + bob, 3, 2, '#0F172A');
    px(ctx, x + 9, y + 6 + bob, 3, 2, '#0F172A');
    px(ctx, x + 7, y + 6 + bob, 2, 1, '#334155');
    // 노이즈캔슬링 헤드폰 착용 시
    if (hasHeadphones && !isExam) {
      px(ctx, x + 1, y + 4 + bob, 2, 5, '#64748B');
      px(ctx, x + 13, y + 4 + bob, 2, 5, '#64748B');
      px(ctx, x + 3, y, 10, 1, '#64748B');
    }

    // 땀방울 (체력/멘탈 낮거나 시험 중)
    if (stamina < 45 || mental < 45 || isExam) {
      const sweatY = y + 3 + ((tick >> 3) % 4);
      px(ctx, x + 14, sweatY, 1, 2, '#38BDF8');
    }

    // 졸음 Zzz
    if (stamina < 30 && !isExam) {
      const zOff = (tick >> 4) % 6;
      ctx.fillStyle = '#93C5FD';
      ctx.font = 'bold 6px monospace';
      ctx.fillText('Z', x + 15, y - zOff);
    }

    // 책상 & 문제집
    px(ctx, x - 6, y + 21, 28, 3, '#B45309');
    px(ctx, x - 4, y + 24, 2, 10, '#78350F');
    px(ctx, x + 18, y + 24, 2, 10, '#78350F');
    // 책상 위 문제집 / OMR
    px(ctx, x + 1, y + 19, 9, 2, '#FFFFFF');
    px(ctx, x + 12, y + 19, 5, 2, isExam ? '#FEF08A' : '#3B82F6');
  }

  // 학군 핀 좌표 (240x135 논리 좌표계)
  const MAP_PINS = [
    { id: 'daechi', x: 98, y: 42, label: '대치동', color: '#EF4444' },
    { id: 'dongtan', x: 106, y: 56, label: '화성·동탄', color: '#3B82F6' },
    { id: 'metro', x: 146, y: 82, label: '대구·대전·부산', color: '#10B981' },
    { id: 'rural', x: 122, y: 69, label: '농어촌 읍·면', color: '#F59E0B' }
  ];

  function getDistrictPinAt(normX, normY) {
    const lx = normX * LW;
    const ly = normY * LH;
    let best = null;
    let bestDist = 18;
    for (const p of MAP_PINS) {
      const d = Math.hypot(lx - p.x, ly - p.y);
      if (d < bestDist) {
        bestDist = d;
        best = p.id;
      }
    }
    return best;
  }

  // 1. 메인 16:9 뷰포트 렌더러
  function drawMainViewport(canvas, state, tick) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);

    const scene = state?.viewportScene || 'map';

    if (scene === 'map') {
      drawKoreaMapScene(ctx, state, tick);
    } else if (scene === 'studycafe') {
      drawStudyCafeScene(ctx, state, tick);
    } else if (scene === 'lecture') {
      drawLectureHallScene(ctx, state, tick);
    } else if (scene === 'exam') {
      drawExamHallScene(ctx, state, tick);
    } else if (scene === 'campus') {
      drawCampusVictoryScene(ctx, state, tick);
    } else {
      drawClassroomScene(ctx, state, tick);
    }

    ctx.restore();
  }

  function drawKoreaMapScene(ctx, state, tick) {
    const selectedId = state?.selectedDistrictId;
    const selPin = MAP_PINS.find(p => p.id === selectedId);

    // 줌인 효과
    ctx.save();
    if (selPin) {
      const zoom = 1.24;
      const cx = selPin.x;
      const cy = selPin.y;
      ctx.translate(LW / 2, LH / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
    }

    // 바다 배경 + 디더링 격자
    px(ctx, -40, -40, LW + 80, LH + 80, '#0F2942');
    for (let y = 0; y < LH; y += 6) {
      for (let x = 0; x < LW; x += 12) {
        const wave = ((x + tick) % 24) < 6;
        if (wave) px(ctx, x, y, 3, 1, '#1E4976');
      }
    }

    // 한반도 도트 실루엣 (남한 + 휴전선 북쪽 살짝)
    const landPolys = [
      [88, 20, 44, 14], // 경기 북부·강원 북부
      [82, 34, 58, 18], // 서울·경기·강원
      [86, 52, 62, 20], // 충청·경북 북부
      [82, 72, 74, 24], // 전라·경남·대구·부산
      [84, 96, 50, 12], // 남해안
      [86, 118, 22, 8]  // 제주도
    ];
    for (const [rx, ry, rw, rh] of landPolys) {
      px(ctx, rx + 2, ry + 2, rw, rh, '#0B1D30'); // 그림자
      px(ctx, rx, ry, rw, rh, '#4ADE80');
      px(ctx, rx + 3, ry + 3, rw - 6, rh - 6, '#22C55E');
    }
    // 태백산맥 도트 음영
    px(ctx, 134, 28, 10, 56, '#15803D');
    // 울릉도/독도
    px(ctx, 178, 44, 4, 4, '#22C55E');
    px(ctx, 188, 48, 2, 2, '#22C55E');

    // 4대 학군지 핀 마커 + 반짝임 효과
    MAP_PINS.forEach((p, idx) => {
      const isSel = p.id === selectedId;
      const pulse = Math.sin(tick * 0.14 + idx * 1.5);
      // 하이라이트 링
      if (isSel || pulse > 0.3) {
        ctx.strokeStyle = isSel ? '#FEF08A' : 'rgba(255,255,255,0.65)';
        ctx.lineWidth = isSel ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSel ? 9 + (pulse * 2) : 6 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 핀 그림자 & 몸체
      px(ctx, p.x - 1, p.y + 1, 2, 3, '#0F172A');
      px(ctx, p.x - 3, p.y - 6, 6, 6, p.color);
      px(ctx, p.x - 1, p.y - 4, 2, 2, '#FFFFFF');
      // 라벨
      ctx.fillStyle = isSel ? '#FEF08A' : '#FFFFFF';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText(p.label, p.x + 6, p.y + 2);
    });

    ctx.restore();

    // 상단 미니 HUD
    px(ctx, 6, 6, 98, 13, 'rgba(15,23,42,0.72)');
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('대한민국 4대 학군지 선택', 10, 15);
  }

  function drawClassroomScene(ctx, state, tick) {
    const season = state?.season || 'spring';
    // 벽 & 바닥
    px(ctx, 0, 0, LW, 98, '#F1F5F9');
    px(ctx, 0, 98, LW, 37, '#CBD5E1');
    px(ctx, 0, 96, LW, 2, '#94A3B8');

    // 창문 2개 (계절 디더링)
    drawSeasonalWindow(ctx, 14, 14, 48, 42, season, tick);
    drawSeasonalWindow(ctx, 178, 14, 48, 42, season, tick);

    // 칠판
    px(ctx, 70, 14, 100, 48, '#78350F');
    px(ctx, 73, 17, 94, 42, '#14532D');
    // 칠판 판서 (수식)
    ctx.fillStyle = '#ECFDF5';
    ctx.font = '6px monospace';
    ctx.fillText('f(x)=x^3-3x', 80, 29);
    ctx.fillText('내신 5등급제', 80, 40);
    px(ctx, 134, 24, 24, 18, 'rgba(255,255,255,0.12)');
    ctx.fillStyle = '#FDE047';
    ctx.fillText('D-DAY', 136, 36);

    // 벽시계
    px(ctx, 114, 3, 12, 9, '#FFFFFF');
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(114.5, 3.5, 11, 8);
    px(ctx, 119, 5, 1, 3, '#0F172A');
    px(ctx, 119, 7, 3, 1, '#DC2626');

    // 사물함 (좌측 하단)
    for (let i = 0; i < 3; i++) {
      px(ctx, 8 + i * 13, 66, 12, 30, '#94A3B8');
      px(ctx, 9 + i * 13, 68, 10, 26, '#E2E8F0');
      px(ctx, 16 + i * 13, 78, 1, 4, '#475569');
    }

    // 책상 위 캐릭터
    drawStudentAtDesk(ctx, 112, 74, state, tick, false);
  }

  function drawStudyCafeScene(ctx, state, tick) {
    // 어두운 독서실 배경
    px(ctx, 0, 0, LW, LH, '#0F172A');
    px(ctx, 0, 96, LW, 39, '#1E293B');

    // 칸막이 좌석
    px(ctx, 48, 22, 144, 80, '#1E293B');
    px(ctx, 54, 28, 132, 68, '#334155');
    // 스탠드
    px(ctx, 148, 42, 4, 34, '#94A3B8');
    px(ctx, 134, 38, 18, 5, '#E2E8F0');
    // 스탠드 불빛 콘(Cone) 효과
    ctx.fillStyle = 'rgba(254, 240, 138, 0.16)';
    ctx.beginPath();
    ctx.moveTo(136, 43);
    ctx.lineTo(150, 43);
    ctx.lineTo(175, 95);
    ctx.lineTo(75, 95);
    ctx.closePath();
    ctx.fill();

    // 타이머 & 커피캔
    px(ctx, 72, 68, 22, 10, '#020617');
    ctx.fillStyle = '#22D3EE';
    ctx.font = 'bold 5px monospace';
    ctx.fillText('11:42', 75, 75);
    px(ctx, 160, 74, 7, 11, '#3B82F6');
    px(ctx, 160, 74, 7, 2, '#E2E8F0');

    // 캐릭터
    drawStudentAtDesk(ctx, 112, 68, state, tick, false);
  }

  function drawLectureHallScene(ctx, state, tick) {
    // 대형 강의실 (시대인재 / 강대 / 대치 단과)
    px(ctx, 0, 0, LW, 92, '#E2E8F0');
    px(ctx, 0, 92, LW, 43, '#475569');

    // 대형 칠판
    px(ctx, 18, 10, 204, 52, '#064E3B');
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 10, 204, 52);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('[KILLER 22번] 미분가능성 & 극한', 28, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('lim (f(x+h)-f(x))/h = 0', 28, 36);
    ctx.fillStyle = '#FDE047';
    ctx.fillText('SURVIVAL 100점 목표', 138, 48);

    // 마이크 찬 1타 강사 도트
    const lx = 112 + Math.round(Math.sin(tick * 0.08) * 6);
    px(ctx, lx, 52, 12, 22, '#0F172A'); // 정장
    px(ctx, lx + 2, 42, 8, 9, '#FDBA74'); // 얼굴
    px(ctx, lx + 2, 41, 8, 3, '#1E293B'); // 머리
    px(ctx, lx + 1, 46, 3, 1, '#EF4444'); // 헤드셋 마이크

    // 빼곡히 앉은 학생들 뒷모습 (2열)
    for (let row = 0; row < 2; row++) {
      const sy = 84 + row * 18;
      for (let sx = 14; sx < 224; sx += 22) {
        const isPlayer = row === 1 && sx === 102;
        px(ctx, sx, sy, 14, 14, isPlayer ? '#2563EB' : '#1E293B');
        px(ctx, sx + 3, sy - 6, 8, 7, isPlayer ? '#0F172A' : '#334155');
        if (isPlayer) {
          px(ctx, sx + 5, sy - 9, 4, 2, '#FACC15'); // 플레이어 표시
        }
      }
    }
  }

  function drawExamHallScene(ctx, state, tick) {
    px(ctx, 0, 0, LW, 96, '#F8FAFC');
    px(ctx, 0, 96, LW, 39, '#CBD5E1');

    // 칠판 & 시험 시간표
    px(ctx, 56, 12, 128, 46, '#14532D');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.fillText('1교시 국어  08:40~10:00', 64, 24);
    ctx.fillText('2교시 수학  10:30~12:10', 64, 33);
    ctx.fillText('3교시 영어  13:10~14:20', 64, 42);
    ctx.fillText('4교시 한국사·통합사/과', 64, 51);

    // 시계 + 초침 회전 애니메이션
    const cx = 206, cy = 24;
    px(ctx, cx - 9, cy - 9, 18, 18, '#FFFFFF');
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 9, cy - 9, 18, 18);
    const angle = (tick * 0.12) % (Math.PI * 2);
    ctx.strokeStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
    ctx.stroke();

    // 감독관 NPC
    const pxGuard = 34 + Math.round(Math.sin(tick * 0.05) * 10);
    px(ctx, pxGuard, 58, 10, 22, '#334155');
    px(ctx, pxGuard + 1, 49, 8, 9, '#FDBA74');
    px(ctx, pxGuard + 1, 48, 8, 3, '#1E293B');

    // 수험생 OMR 마킹 연출
    drawStudentAtDesk(ctx, 112, 74, state, tick, true);
    // OMR 펜 움직임 점멸
    if (tick % 16 < 8) {
      px(ctx, 125, 92, 2, 2, '#DC2626');
    }
  }

  function drawCampusVictoryScene(ctx, state, tick) {
    // 맑은 하늘 & 캠퍼스 정문
    px(ctx, 0, 0, LW, 95, '#60A5FA');
    px(ctx, 0, 45, LW, 50, '#93C5FD');
    px(ctx, 0, 95, LW, 40, '#E2E8F0');

    // 대학 본관 건물
    px(ctx, 45, 36, 150, 59, '#CBD5E1');
    px(ctx, 60, 26, 120, 14, '#94A3B8');
    // 기둥
    for (let x = 66; x <= 166; x += 20) {
      px(ctx, x, 42, 8, 53, '#F8FAFC');
    }

    // 축 합격 현수막
    px(ctx, 56, 12, 128, 14, '#DC2626');
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('★ 축 합 격 · 명문대 입성 ★', 72, 21);

    // 꽃다발 들고 환호하는 캐릭터
    const jump = Math.abs(Math.sin(tick * 0.14)) * 4;
    const cx = 112, cy = 82 - jump;
    px(ctx, cx + 2, cy + 12, 12, 16, '#1E293B'); // 정장/코트
    px(ctx, cx + 3, cy + 2, 10, 10, '#FDBA74');
    px(ctx, cx + 2, cy + 1, 12, 4, '#0F172A');
    // 만세 팔 & 꽃다발
    px(ctx, cx - 2, cy + 6, 4, 8, '#1E293B');
    px(ctx, cx + 14, cy + 4, 4, 8, '#1E293B');
    px(ctx, cx + 14, cy - 2, 7, 7, '#F472B6');
    px(ctx, cx + 16, cy - 1, 3, 3, '#FEF08A');

    // 흩날리는 폭죽 컨페티
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
    for (let i = 0; i < 16; i++) {
      const fx = (i * 19 + tick) % LW;
      const fy = (i * 13 + tick * 1.3) % 110;
      px(ctx, fx, fy, 2, 2, colors[i % colors.length]);
    }
  }

  // 2. 이벤트/팝업 전용 미니 픽셀 캔버스 렌더러
  function drawEventMiniCanvas(canvas, sceneType, tick) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);

    if (sceneType === 'studygram') {
      // 스톱워치 11:42:58 + 아이스 아메리카노 + 빨간 동그라미 만점 시대인재 서바이벌 시험지
      px(ctx, 0, 0, LW, LH, '#78350F');
      px(ctx, 8, 8, LW - 16, LH - 16, '#92400E');
      // 시대인재 서바이벌 모의고사 시험지
      px(ctx, 74, 16, 98, 106, '#FFFFFF');
      px(ctx, 80, 22, 86, 8, '#0F172A');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('SURVIVAL 모의고사', 88, 28);
      // 문제 텍스트 라인
      for (let i = 0; i < 6; i++) {
        px(ctx, 82, 38 + i * 12, 36, 2, '#94A3B8');
        px(ctx, 124, 38 + i * 12, 36, 2, '#94A3B8');
      }
      // 빨간 동그라미 & 100점 채점
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(148, 38, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('100', 139, 42);

      // 스톱워치 (11:42:58)
      px(ctx, 16, 48, 48, 34, '#0F172A');
      px(ctx, 20, 54, 40, 16, '#1E293B');
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('11:42:58', 22, 65);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '5px sans-serif';
      ctx.fillText('STOPWATCH', 24, 77);

      // 아이스 아메리카노
      px(ctx, 186, 46, 28, 46, 'rgba(255,255,255,0.28)');
      px(ctx, 188, 56, 24, 34, '#3B1E08');
      px(ctx, 190, 58, 5, 5, '#BAE6FD'); // 얼음
      px(ctx, 202, 60, 5, 5, '#BAE6FD');
      px(ctx, 200, 26, 3, 30, '#10B981'); // 빨대
    } else if (sceneType === 'killer_rumor') {
      px(ctx, 0, 0, LW, LH, '#1E293B');
      px(ctx, 24, 14, 192, 82, '#14532D');
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('기말고사 킬러 2문항 예고', 44, 46);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('프린트 외부 변형 출제!', 68, 68);
      if (tick % 20 < 10) px(ctx, 18, 14, 4, 82, '#EF4444');
    } else if (sceneType === 'level_test') {
      px(ctx, 0, 0, LW, LH, '#F1F5F9');
      px(ctx, 30, 14, 180, 96, '#FFFFFF');
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(30, 14, 180, 96);
      px(ctx, 30, 14, 180, 20, '#1E3A8A');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('대치동 단과 S반 승강고사 안내', 58, 27);
      px(ctx, 44, 46, 68, 48, '#DBEAFE');
      ctx.fillStyle = '#1D4ED8';
      ctx.fillText('S반 (상위 5%)', 52, 72);
      px(ctx, 128, 46, 68, 48, '#FEE2E2');
      ctx.fillStyle = '#B91C1C';
      ctx.fillText('A반 강등 위기', 136, 72);
    } else if (sceneType === 'omr_panic') {
      px(ctx, 0, 0, LW, LH, '#FEF2F2');
      // OMR 카드
      px(ctx, 64, 16, 112, 102, '#FFFFFF');
      ctx.strokeStyle = '#DC2626';
      ctx.strokeRect(64, 16, 112, 102);
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 7px sans-serif';
      ctx.fillText('OMR 마킹 밀림 발견! (3분 전)', 68, 30);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 5; c++) {
          const filled = (r + 1) % 5 === c;
          px(ctx, 84 + c * 16, 42 + r * 12, 6, 6, filled ? '#0F172A' : '#E2E8F0');
        }
      }
      // 경고 타이머
      px(ctx, 14, 24, 38, 22, '#0F172A');
      ctx.fillStyle = tick % 12 < 6 ? '#EF4444' : '#FCA5A5';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('03:00', 18, 38);
    } else if (sceneType === 'counseling') {
      px(ctx, 0, 0, LW, LH, '#F8FAFC');
      px(ctx, 0, 88, LW, 47, '#E2E8F0');
      drawSeasonalWindow(ctx, 16, 12, 52, 42, 'autumn', tick);
      // 책상 & 담임선생님
      px(ctx, 80, 74, 80, 14, '#B45309');
      px(ctx, 132, 44, 16, 30, '#334155');
      px(ctx, 134, 30, 12, 12, '#FDBA74');
      // 학생
      px(ctx, 90, 48, 16, 26, '#1E293B');
      px(ctx, 92, 36, 12, 12, '#FDBA74');
      // 상담 차트
      px(ctx, 112, 66, 18, 8, '#FFFFFF');
      px(ctx, 114, 68, 6, 4, '#2563EB');
      px(ctx, 122, 68, 6, 4, '#DC2626');
    } else if (sceneType === 'interview') {
      px(ctx, 0, 0, LW, LH, '#E2E8F0');
      px(ctx, 0, 96, LW, 39, '#94A3B8');
      // 면접관 3명
      px(ctx, 40, 56, 160, 14, '#78350F');
      [64, 112, 160].forEach(ix => {
        px(ctx, ix, 34, 16, 22, '#0F172A');
        px(ctx, ix + 3, 22, 10, 10, '#FDBA74');
      });
      // 지원자 뒷모습
      px(ctx, 112, 84, 18, 22, '#1E3A8A');
      px(ctx, 115, 72, 12, 12, '#1E293B');
    } else if (sceneType === 'festival') {
      px(ctx, 0, 0, LW, LH, '#0F172A');
      px(ctx, 0, 92, LW, 43, '#1E293B');
      // 불꽃놀이
      const fwColors = ['#F472B6', '#38BDF8', '#FACC15', '#34D399'];
      for (let b = 0; b < 3; b++) {
        const bx = 46 + b * 70;
        const by = 32 + (b % 2) * 14;
        const r = 6 + ((tick >> 2) + b * 4) % 14;
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          px(ctx, bx + Math.cos(ang) * r, by + Math.sin(ang) * r, 2, 2, fwColors[(b + a) % 4]);
        }
      }
      // 대학 과잠 입은 친구들
      [70, 115, 160].forEach((fx, i) => {
        px(ctx, fx, 78, 12, 16, i === 1 ? '#9E1B32' : '#0F3077');
        px(ctx, fx + 2, 68, 8, 9, '#FDBA74');
      });
    } else if (sceneType === 'temptation') {
      px(ctx, 0, 0, LW, LH, '#1E293B');
      // 침대
      px(ctx, 18, 66, 84, 34, '#3B82F6');
      px(ctx, 20, 58, 24, 10, '#FFFFFF');
      // 스마트폰 유튜브/게임 불빛
      px(ctx, 148, 38, 48, 72, '#0F172A');
      px(ctx, 152, 44, 40, 56, '#EF4444');
      px(ctx, 168, 66, 10, 10, '#FFFFFF');
    } else {
      drawClassroomScene(ctx, null, tick);
    }

    ctx.restore();
  }

  // 3. 합격통지서 고해상도 PNG 익스포터
  function downloadCertificatePng(cert) {
    const W = 1200;
    const H = 1600;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');

    // 배경
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, W, H);

    // 이중 금장 테두리
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 18;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.lineWidth = 5;
    ctx.strokeRect(68, 68, W - 136, H - 136);

    // 상단 중앙 대학 엠블럼
    const cx = W / 2;
    const cy = 205;
    ctx.fillStyle = cert.uni.color;
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 6;
    if (cert.uni.emblemType === 'shield') {
      ctx.beginPath();
      ctx.moveTo(cx - 58, cy - 58);
      ctx.lineTo(cx + 58, cy - 58);
      ctx.lineTo(cx + 58, cy + 5);
      ctx.quadraticCurveTo(cx, cy + 70, cx, cy + 70);
      ctx.quadraticCurveTo(cx, cy + 70, cx - 58, cy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = cert.uni.accent || '#FFFFFF';
    ctx.font = `900 ${cert.uni.abbr.length > 3 ? 28 : 34}px "Noto Serif KR", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cert.uni.abbr, cx, cy + 2);

    // 타이틀
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 66px "Noto Serif KR", serif';
    ctx.fillText('합   격   통   지   서', cx, 355);

    // 인적사항 & 전형 표
    const rows = [
      ['모집구분', cert.recruitType],
      ['전형구분', cert.admissionType],
      ['모집단위', cert.majorName],
      ['수험번호', cert.examId],
      ['성    명', cert.playerName],
      ['생년월일', cert.birthDate]
    ];
    const tx = 140;
    let ty = 440;
    const tw = W - 280;
    const rowH = 74;
    ctx.textBaseline = 'middle';
    rows.forEach(([k, v]) => {
      ctx.fillStyle = '#FAF5E8';
      ctx.fillRect(tx, ty, 240, rowH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(tx + 240, ty, tw - 240, rowH);
      ctx.strokeStyle = '#D6C39B';
      ctx.lineWidth = 2;
      ctx.strokeRect(tx, ty, tw, rowH);
      ctx.beginPath();
      ctx.moveTo(tx + 240, ty);
      ctx.lineTo(tx + 240, ty + rowH);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = '700 28px "Noto Serif KR", serif';
      ctx.textAlign = 'center';
      ctx.fillText(k, tx + 120, ty + rowH / 2);

      ctx.fillStyle = '#0F172A';
      ctx.font = '700 30px "Noto Serif KR", serif';
      ctx.textAlign = 'left';
      ctx.fillText(v, tx + 272, ty + rowH / 2);
      ty += rowH;
    });

    // 본문 문구
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 35px "Noto Serif KR", serif';
    ctx.fillText(`위 사람은 ${cert.uni.name} ${cert.year}학년도`, cx, 1005);
    ctx.fillText('신입학 전형에 합격하였기에 이 증서를 드립니다.', cx, 1065);

    // 좌측 하단 대학 원형 공식 마크
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(235, 1340, 78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#9A7B38';
    ctx.font = '700 20px "Noto Serif KR", serif';
    ctx.fillText(cert.uni.name, 235, 1328);
    ctx.fillText('입학처 인증', 235, 1358);

    // 우측 하단 날짜 + 총장 + 붉은 사각 직인 겹침
    ctx.textAlign = 'right';
    ctx.fillStyle = '#334155';
    ctx.font = '600 30px "Noto Serif KR", serif';
    ctx.fillText(cert.issueDate, 995, 1265);

    const signText = `${cert.uni.name} 총 장`;
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 44px "Noto Serif KR", serif';
    ctx.fillText(signText, 995, 1355);

    // '장' 글자 위에 반투명 붉은 직인 겹침
    const sealX = 955;
    const sealY = 1295;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 6;
    ctx.strokeRect(sealX, sealY, 116, 116);
    ctx.fillStyle = '#B91C1C';
    ctx.textAlign = 'center';
    ctx.font = '900 22px "Noto Serif KR", serif';
    const shortU = cert.uni.name.replace('대학교', '대');
    ctx.fillText(shortU, sealX + 58, sealY + 34);
    ctx.fillText('총장', sealX + 58, sealY + 64);
    ctx.fillText('지인', sealX + 58, sealY + 94);
    ctx.restore();

    const link = document.createElement('a');
    link.download = `합격통지서_${cert.uni.name}_${cert.majorName}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }

  return {
    drawMainViewport,
    drawEventMiniCanvas,
    getDistrictPinAt,
    downloadCertificatePng
  };
})();
