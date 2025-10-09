import { ProductApi, Product } from './api';
import { $, el } from './ui';

/** ================== Theme Toggle ================== */
const themeBtn = $('#themeToggle') as HTMLButtonElement;

type Theme = 'light' | 'dark';
function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  // 버튼 라벨/아이콘 전환
  if (themeBtn) themeBtn.textContent = t === 'light' ? '🌙 다크' : '☀︎ 라이트';
  localStorage.setItem('theme', t);
}
(function initTheme() {
  const saved = (localStorage.getItem('theme') as Theme) || 'dark';
  applyTheme(saved);
  themeBtn?.addEventListener('click', () => {
    const next: Theme = (document.documentElement.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
    applyTheme(next);
  });
})();

/** ================== Products UI ================== */

// 요소 캐시
const createForm = $('#createForm') as HTMLFormElement;
const nameInput = $('#name') as HTMLInputElement;
const priceInput = $('#price') as HTMLInputElement;
const descInput = $('#description') as HTMLTextAreaElement;
const createMsg = $('#createMsg');

const pageInput = $('#page') as HTMLInputElement;
const sizeInput = $('#size') as HTMLInputElement;
const sortSelect = $('#sort') as HTMLSelectElement;
const refreshBtn = $('#refreshBtn') as HTMLButtonElement;

const listBody = $('#listBody') as HTMLTableSectionElement;
const pageInfo = $('#pageInfo');
const prevBtn = $('#prevBtn') as HTMLButtonElement;
const nextBtn = $('#nextBtn') as HTMLButtonElement;
const listMsg = $('#listMsg');

let page = 0;
let size = 10;
let sort = 'id,desc';

async function load() {
  try {
    listMsg!.textContent = '';
    const data = await ProductApi.list(page, size, sort);
    renderList(data);
  } catch (e: any) {
    listMsg!.innerHTML = `<span class="bad">목록 로드 실패: ${e.message}</span>`;
  }
}

function renderList(p: { content: Product[]; number: number; size: number; totalElements: number; totalPages: number; }) {
  listBody.innerHTML = '';
  for (const item of p.content) {
    const tr = el('tr', {},
      el('td', {}, String(item.id)),
      el('td', {}, item.name),
      el('td', {}, item.price.toLocaleString()),
      el('td', {}, item.description ?? ''),
      el('td', {}, el('div', { class: 'actions' },
        el('button', { class: 'btn btn-outline', onClick: () => onEdit(item) }, '수정'),
        el('button', { class: 'btn btn-danger', onClick: () => onDelete(item.id) }, '삭제')
      ))
    );
    listBody.appendChild(tr);
  }
  pageInfo!.textContent = `페이지 ${p.number + 1} / ${Math.max(1, p.totalPages)} · 총 ${p.totalElements}개`;
  prevBtn.disabled = p.number <= 0;
  nextBtn.disabled = p.number + 1 >= p.totalPages;
}

async function onCreate(ev: SubmitEvent) {
  ev.preventDefault();
  try {
    createMsg!.textContent = '';
    const p = await ProductApi.create({
      name: nameInput.value.trim(),
      price: Number(priceInput.value),
      description: descInput.value.trim(),
    });
    createMsg!.innerHTML = `<span class="good">등록 완료: #${p.id}</span>`;
    createForm.reset();
    await load();
  } catch (e: any) {
    createMsg!.innerHTML = `<span class="bad">등록 실패: ${e.message}</span>`;
  }
}

function onEdit(item: Product) {
  const nextName = prompt('이름 수정 (엔터=유지)', item.name) ?? item.name;
  const nextPriceStr = prompt('가격 수정 (엔터=유지)', String(item.price)) ?? String(item.price);
  const nextDesc = prompt('설명 수정 (엔터=유지)', item.description ?? '') ?? (item.description ?? '');
  const patch: any = {};
  if (nextName !== item.name) patch.name = nextName.trim();
  if (Number(nextPriceStr) !== item.price) patch.price = Number(nextPriceStr);
  if (nextDesc !== (item.description ?? '')) patch.description = nextDesc.trim();
  if (Object.keys(patch).length === 0) return;
  ProductApi.update(item.id, patch)
    .then(() => load())
    .catch((e) => alert('수정 실패: ' + e.message));
}

function onDelete(id: number) {
  if (!confirm(`#${id} 삭제할까요?`)) return;
  ProductApi.remove(id)
    .then(() => load())
    .catch((e) => alert('삭제 실패: ' + e.message));
}

// 이벤트 바인딩
createForm.addEventListener('submit', onCreate);
refreshBtn.addEventListener('click', () => {
  page = Number(pageInput.value) || 0;
  size = Number(sizeInput.value) || 10;
  sort = sortSelect.value || 'id,desc';
  load();
});
prevBtn.addEventListener('click', () => { if (page > 0) { page--; pageInput.value = String(page); load(); } });
nextBtn.addEventListener('click', () => { page++; pageInput.value = String(page); load(); });

load();