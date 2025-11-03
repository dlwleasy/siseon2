/* === Matching Calendar + modal step flow (수정본) === */

/* --- 상수 및 초기값 --- */
const NOW = new Date();
const TODAY = { y: NOW.getFullYear(), m: NOW.getMonth() + 1, d: NOW.getDate() };

// TARGET (모든 날짜 예시)
const TARGET = { y: 2025, m: 11, start: 21, mid: 22, end: 23 };

let view = { y: TODAY.y, m: TODAY.m };
const selectedSet = new Set();
let activeStep = 1; // 1,2,3

/* --- 유틸 --- */
const pad = n => String(n).padStart(2, '0');
const toKey = ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* --- DOM --- */
const modal = $('#matchModal');
const overlay = $('.mmodal__overlay', modal);
const backBtns = $$('.mmodal__back', modal);
const calGrid = $('#calGrid', modal);
const calTitle = $('.cal__title', modal);
const openBtn = document.querySelector('#openMatch') || document.querySelector('.match-btn');

const matchNext = $('#matchNext', modal);
const timeNext = $('#timeNext', modal);

/* --- 캘린더 렌더링 함수들 (기존 로직 유지) --- */
function dayCell(d, muted) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'cal__day' + (muted ? ' cal__day--muted' : '');
  el.textContent = d;
  return el;
}

function renderCalendar(y, m) {
  calTitle.textContent = `${y}년 ${m}월`;
  calGrid.innerHTML = '';

  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const prevLast = new Date(y, m - 1, 0);

  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const prevDays = prevLast.getDate();

  // 앞쪽 muted
  for (let i = startDay - 1; i >= 0; i--) calGrid.appendChild(dayCell(prevDays - i, true));
  // 현재 달
  for (let d = 1; d <= daysInMonth; d++) calGrid.appendChild(dayCell(d, false));
  // 뒤쪽 muted → 총 42칸 맞춤
  while (calGrid.children.length < 42) {
    const n = calGrid.children.length - (startDay + daysInMonth) + 1;
    calGrid.appendChild(dayCell(n, true));
  }
}

function indexOfDay(y, m, d) {
  const first = new Date(y, m - 1, 1).getDay();
  return first + (d - 1);
}

/* --- 선택 토글 / 표시 --- */
function toggleSelect(date) {
  const key = toKey(date);
  if (selectedSet.has(key)) selectedSet.delete(key);
  else selectedSet.add(key);
}

function paintSelections(allMode = false) {
  // 초기화
  $$('.cal__day', calGrid).forEach(c =>
    c.classList.remove('cal__day--selected', 'cal__day--pill', 'cal__day--hover')
  );

  // 일반 표시
  $$('.cal__day', calGrid).forEach((cell) => {
    const dayText = cell.textContent.trim();
    const day = Number(dayText);
    if (!day || cell.classList.contains('cal__day--muted')) return;

    const key = toKey({ y: view.y, m: view.m, d: day });
    if (selectedSet.has(key)) {
      cell.classList.add('cal__day--selected');
    }
  });

  // "모든 날짜" 모드에서 21·22 pill 처리, 23은 selected 유지
  if (allMode || (view.y === TARGET.y && view.m === TARGET.m &&
    selectedSet.has(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.start })) &&
    selectedSet.has(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.mid })) &&
    selectedSet.has(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.end })))
  ) {
    const idx21 = indexOfDay(TARGET.y, TARGET.m, TARGET.start);
    const c21 = calGrid.children[idx21];
    const c22 = calGrid.children[idx21 + 1];
    if (c21) { c21.classList.remove('cal__day--selected'); c21.classList.add('cal__day--pill'); }
    if (c22) { c22.classList.remove('cal__day--selected'); c22.classList.add('cal__day--pill'); }
    // 23은 selected로 두기
  }
}

/* --- 초기 렌더 (페이지 로드 시) --- */
renderCalendar(view.y, view.m);

/* --- 모달 열기 / 닫기 --- */
function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // step 초기화
  activeStep = 1;
  showStep(activeStep);
  // 캘린더는 오늘 달로 초기화
  view = { y: TODAY.y, m: TODAY.m };
  renderCalendar(view.y, view.m);
  paintSelections();
  updateDots();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* --- 단계 표시/전환 --- */
function showStep(n) {
  // 모든 스텝 숨기고 필요한 스텝만 보이게
  $$('.mmodal__step', modal).forEach(s => s.style.display = 'none');
  const target = modal.querySelector(`.mmodal__step[data-step="${n}"]`);
  if (target) target.style.display = 'block';
  updateDots();
}

function updateDots() {
  const dotWraps = $$('.mmodal__step', modal).map(s => $('.dot-wrap', s));
  // 각 스텝의 dot-wrap 내부 dot들 스타일 갱신
  $$('.mmodal__step', modal).forEach(s => {
    const idx = Number(s.dataset.step);
    const dots = $$('.dot', s);
    dots.forEach((d, i) => d.classList.toggle('dot--on', (i === idx - 1)));
  });
}

/* --- 이벤트 바인딩 --- */

// 오버레이 클릭으로 닫기
overlay.addEventListener('click', closeModal);

// 전역 ESC로 닫기
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

// 열기 버튼
if (openBtn) openBtn.addEventListener('click', openModal);

// 뒤로가기(상단 화살표) - 여러개이므로 각 버튼에 동일 로직
backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (activeStep <= 1) { closeModal(); return; }
    activeStep = Math.max(1, activeStep - 1);
    showStep(activeStep);
  });
});

// 월 네비게이션
$$('.cal__nav', modal).forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = parseInt(btn.dataset.dir, 10);
    let m = view.m + dir, y = view.y;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    view = { y, m };
    renderCalendar(view.y, view.m);
    paintSelections();
  });
});

// 퀵버튼(오늘/내일/모레/모든 날짜)
$$('.qbtn', modal).forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.qbtn', modal).forEach(b => b.classList.remove('qbtn--active'));
    btn.classList.add('qbtn--active');
    const act = btn.dataset.action;

    if (act === 'all') {
      view = { y: TARGET.y, m: TARGET.m };
      renderCalendar(view.y, view.m);
      selectedSet.clear();
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.start }));
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.mid }));
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.end }));
      paintSelections(true);
      return;
    }

    // today / tomorrow / dayafter
    let base = new Date(TODAY.y, TODAY.m - 1, TODAY.d);
    if (act === 'tomorrow') base.setDate(base.getDate() + 1);
    if (act === 'dayafter') base.setDate(base.getDate() + 2);
    const pick = { y: base.getFullYear(), m: base.getMonth() + 1, d: base.getDate() };
    view = { y: pick.y, m: pick.m };
    renderCalendar(view.y, view.m);
    toggleSelect(pick);
    paintSelections();
  });
});

// 캘린더 셀 클릭: 다중 선택 토글
calGrid.addEventListener('click', e => {
  const cell = e.target.closest('.cal__day');
  if (!cell || cell.classList.contains('cal__day--muted')) return;
  const day = parseInt(cell.textContent, 10);
  toggleSelect({ y: view.y, m: view.m, d: day });
  paintSelections();
});

/* --- '다음' 버튼들 핸들러 --- */
// 1단계 '다음' -> 2단계
if (matchNext) {
  matchNext.addEventListener('click', () => {
    // 최소 한 날짜 선택 확인(원하면 필수화)
    if (selectedSet.size === 0) {
      alert('하나 이상의 날짜를 선택해 주세요.'); // 필요시 개선
      return;
    }
    activeStep = 2;
    showStep(activeStep);
  });
}

if (timeNext) {
  timeNext.addEventListener('click', async () => {
    // 시간 선택(간단히 현재 active time-card 찾기)
    const selTime = modal.querySelector('.time-card--active') || modal.querySelector('.time-card');
    if (!selTime) {
      alert('시간을 선택해 주세요.');
      return;
    }

    // 선택된 날짜 목록(예: ['2025-11-21', '2025-11-22'])을 서버에 보낼 수 있게 직렬화
    const selectedDates = Array.from(selectedSet);
    // 선택된 시간(데이터 속성 또는 text 사용)
    const selectedTime = selTime.dataset.time || selTime.querySelector('.time-range')?.textContent?.trim() || selTime.textContent.trim();

    // 1) UI: 3단계(로더)로 전환
    activeStep = 3;
    showStep(activeStep);

    // 2) 서버 호출 여부 설정 (true이면 실제 API 호출)
    const USE_API = false; // ===> 실제 배포시 true로 변경하고 아래 URL 수정
    if (USE_API) {
      try {
        // 예시: POST /api/match 로 매칭 요청을 보냄 (서버 구현에 따라 수정)
        const resp = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dates: selectedDates,
            time: selectedTime,
            // 필요시 추가 데이터(사용자ID, 모임ID 등) 포함
          })
        });

        if (!resp.ok) throw new Error('서버 응답 오류: ' + resp.status);

        const data = await resp.json();
        // 서버는 { ok: true, roomId: '12345', roomUrl: '/culture_chat.html?roomId=12345' } 형식 리턴을 권장
        if (data && data.ok && (data.roomUrl || data.roomId)) {
          const url = data.roomUrl || `/culture_chat.html?roomId=${encodeURIComponent(data.roomId)}`;
          // 선택: 같은 창에서 이동
          window.location.href = url;
          // 또는 새 탭으로 열려면: window.open(url, '_blank');
        } else {
          throw new Error(data && data.message ? data.message : '매칭 실패 응답');
        }
      } catch (err) {
        console.error('매칭 요청 실패:', err);
        alert('매칭 중 오류가 발생했습니다. 다시 시도해 주세요.');
        // 실패 시 1단계 또는 2단계로 복귀시킬 수 있음
        activeStep = 2;
        showStep(activeStep);
      }
      return;
    }

    // 3) API 미구현(개발/테스트) 시: 시뮬레이션 대기 -> culture_chat.html 로 이동
    // (실제 환경에서는 setTimeout 대신 API 호출을 사용하라)
    setTimeout(() => {
      // 샘플 roomId 생성(실제 서버에서 받은 값으로 교체)
      const fakeRoomId = 'room-' + Date.now();
      // culture_chat.html에 roomId를 쿼리로 전달하여 로드
      const chatUrl = `/culture_chat.html?roomId=${encodeURIComponent(fakeRoomId)}`;

      // 모달 닫기(선택)
      closeModal();

      // 같은 탭에서 이동
      window.location.href = chatUrl;

      // 또는 새 탭으로 열려면 아래 주석 해제
      // window.open(chatUrl, '_blank');
    }, 1800); // UX: 1.8초 대기 후 이동
  });
}
/* --- 초기화: 페이지 로드 시 (모달 닫힌 상태에서 캘린더 초기화) --- */
(function init() {
  // 이미 렌더했으므로 캘린더 초기 상태만 유지하면 됨
  // 만약 모달이 열릴 때마다 초기화 필요하면 openModal 내부에서 처리
})();
