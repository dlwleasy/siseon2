/* === Matching Calendar: multi-select + clean circle === */

// 오늘 기준
const NOW = new Date();
const TODAY = { y: NOW.getFullYear(), m: NOW.getMonth() + 1, d: NOW.getDate() };

// "모든 날짜"에서 사용할 지정 구간 (2025-11-21~23)
const TARGET = { y: 2025, m: 11, start: 21, mid: 22, end: 23 };

// 현재 보이는 달
let view = { y: TODAY.y, m: TODAY.m };

// 다중 선택(YYYY-MM-DD 문자열 Set)
const selectedSet = new Set();

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const modal    = $('#matchModal');
const overlay  = $('.mmodal__overlay', modal);
const backBtn  = $('.mmodal__back', modal);
const calGrid  = $('#calGrid', modal);
const calTitle = $('.cal__title', modal);

const openBtn = $('#openMatch') || document.querySelector('.match-btn');

/* 유틸 */
const pad = n => String(n).padStart(2,'0');
const toKey = ({y,m,d}) => `${y}-${pad(m)}-${pad(d)}`;

/* 열기/닫기 */
function openModal(){
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  view = { y: TODAY.y, m: TODAY.m };   // 오늘 달로 이동
  renderCalendar(view.y, view.m);
  paintSelections();                    // 선택 표시 (있다면)
}
function closeModal(){
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
if (openBtn) openBtn.addEventListener('click', openModal);
overlay.addEventListener('click', closeModal);
backBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

/* 월 네비게이션 */
$$('.cal__nav', modal).forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = parseInt(btn.dataset.dir, 10);
    let m = view.m + dir, y = view.y;
    if (m < 1)  { m = 12; y--; }
    if (m > 12) { m = 1;  y++; }
    view = { y, m };
    renderCalendar(view.y, view.m);
    paintSelections();
  });
});

/* 퀵버튼 */
$$('.qbtn', modal).forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.qbtn', modal).forEach(b => b.classList.remove('qbtn--active'));
    btn.classList.add('qbtn--active');

    const act = btn.dataset.action;

    if (act === 'all') {
      // 2025-11-21~23 표시 (알약 + 원형)
      view = { y: TARGET.y, m: TARGET.m };
      renderCalendar(view.y, view.m);
      // 선택 초기화 후 세 날짜 추가
      selectedSet.clear();
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.start }));
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.mid }));
      selectedSet.add(toKey({ y: TARGET.y, m: TARGET.m, d: TARGET.end }));
      paintSelections(true); // true → 21·22 알약, 23 원형
      return;
    }

    // 오늘/내일/모레는 실제 오늘 기반으로 계산하지만 "반응은 누를 때만"
    let base = new Date(TODAY.y, TODAY.m - 1, TODAY.d);
    if (act === 'tomorrow') base.setDate(base.getDate() + 1);
    if (act === 'dayafter') base.setDate(base.getDate() + 2);

    const pick = { y: base.getFullYear(), m: base.getMonth() + 1, d: base.getDate() };
    view = { y: pick.y, m: pick.m };
    renderCalendar(view.y, view.m);

    // 다중 선택 토글
    toggleSelect(pick);
    paintSelections();
  });
});

/* 날짜 클릭: 다중 선택 토글 */
calGrid.addEventListener('click', e => {
  const cell = e.target.closest('.cal__day');
  if (!cell || cell.classList.contains('cal__day--muted')) return;
  const day = parseInt(cell.textContent, 10);
  toggleSelect({ y: view.y, m: view.m, d: day });
  paintSelections();
});

/* --- 선택 토글 & 표시 --- */
function toggleSelect(date){
  const key = toKey(date);
  if (selectedSet.has(key)) selectedSet.delete(key);
  else                      selectedSet.add(key);
}

function paintSelections(allMode=false){
  // 전체 초기화
  $$('.cal__day', calGrid).forEach(c =>
    c.classList.remove('cal__day--selected','cal__day--pill','cal__day--hover')
  );

  // 일반 다중 선택 표시
  $$('.cal__day', calGrid).forEach((cell, idx) => {
    const dayText = cell.textContent.trim();
    const day = Number(dayText);
    if (!day || cell.classList.contains('cal__day--muted')) return;

    const key = toKey({ y: view.y, m: view.m, d: day });
    if (selectedSet.has(key)) {
      cell.classList.add('cal__day--selected');
    }
  });

  // "모든 날짜" 모드일 경우 21/22를 pill로 덮고, 23은 원형 유지
  if (allMode || (view.y===TARGET.y && view.m===TARGET.m &&
      selectedSet.has(toKey({y:TARGET.y,m:TARGET.m,d:TARGET.start})) &&
      selectedSet.has(toKey({y:TARGET.y,m:TARGET.m,d:TARGET.mid})) &&
      selectedSet.has(toKey({y:TARGET.y,m:TARGET.m,d:TARGET.end}))
  )){
    const idx = indexOfDay(TARGET.y, TARGET.m, TARGET.start);
    const c21 = calGrid.children[idx];
    const c22 = calGrid.children[idx+1];
    if (c21) { c21.classList.remove('cal__day--selected'); c21.classList.add('cal__day--pill'); }
    if (c22) { c22.classList.remove('cal__day--selected'); c22.classList.add('cal__day--pill'); }
    // 23(끝)은 selected 그대로 두어 원형
  }
}

/* --- 렌더링 --- */
function renderCalendar(y, m){
  calTitle.textContent = `${y}년 ${m}월`;
  calGrid.innerHTML = '';

  const first = new Date(y, m - 1, 1);
  const last  = new Date(y, m, 0);
  const prevLast = new Date(y, m - 1, 0);

  const startDay = first.getDay();
  const daysInMonth = last.getDate();
  const prevDays = prevLast.getDate();

  // 앞쪽 muted
  for (let i=startDay-1; i>=0; i--) calGrid.appendChild(dayCell(prevDays - i, true));
  // 현재 달
  for (let d=1; d<=daysInMonth; d++) calGrid.appendChild(dayCell(d, false));
  // 뒤쪽 muted → 총 42칸 맞춤
  while (calGrid.children.length < 42) {
    const n = calGrid.children.length - (startDay + daysInMonth) + 1;
    calGrid.appendChild(dayCell(n, true));
  }
}

function dayCell(d, muted){
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'cal__day' + (muted ? ' cal__day--muted' : '');
  el.textContent = d;
  return el;
}

function indexOfDay(y, m, d){
  const first = new Date(y, m - 1, 1).getDay();
  return first + (d - 1);
}

/* 초기 1회 렌더 (선택 없음) */
renderCalendar(view.y, view.m);
