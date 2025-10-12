import { ProductApi, Product, StockApi, loadConfig } from './api';
import { $, el } from './ui';

/** ================== Theme Toggle ================== */
const themeBtn = $('#themeToggle') as HTMLButtonElement;
type Theme = 'light' | 'dark';
function applyTheme(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = t === 'light' ? '🌙 다크' : '☀︎ 라이트';
  localStorage.setItem('theme', t);
}
(function initTheme() {
  const saved = (localStorage.getItem('theme') as Theme) || 'light';
  applyTheme(saved);
  themeBtn?.addEventListener('click', () => {
    const next: Theme =
      (document.documentElement.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
    applyTheme(next);
  });
})();

/** ================== Toast / Loading ================== */
const toastEl = $('#toast')!;
function showToast(msg: string, type: 'ok'|'error'='ok', ms=1800) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.className = type === 'error' ? 'error' : '';
  toastEl.classList.add('show');
  setTimeout(()=> toastEl.classList.remove('show'), ms);
}
const spinner = $('#globalSpinner')!;
function setGlobalLoading(v: boolean) {
  spinner?.toggleAttribute('hidden', !v);
}

/** ================== Form & List Refs ================== */
const createForm = $('#createForm') as HTMLFormElement;
const nameInput = $('#name') as HTMLInputElement;
const priceInput = $('#price') as HTMLInputElement;
const descInput = $('#description') as HTMLTextAreaElement;
const initStockInput = $('#initStock') as HTMLInputElement;
const createBtn = $('#createBtn') as HTMLButtonElement;
const createMsg = $('#createMsg') as HTMLElement;

const pageInput = $('#page') as HTMLInputElement;
const sizeInput = $('#size') as HTMLInputElement;
const sortSelect = $('#sort') as HTMLSelectElement;
const refreshBtn = $('#refreshBtn') as HTMLButtonElement;

const listBody = $('#listBody') as HTMLTableSectionElement;
const pageInfo = $('#pageInfo') as HTMLElement;
const prevBtn = $('#prevBtn') as HTMLButtonElement;
const nextBtn = $('#nextBtn') as HTMLButtonElement;
const listMsg = $('#listMsg') as HTMLElement;

let page = 0;
let size = 10;
let sort = 'id,desc';

function parseIntOrZero(v: string) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

/** ================== 목록 로딩 ================== */
async function load() {
  try {
    setGlobalLoading(true);
    listMsg.textContent = '';
    const data = await ProductApi.list(page, size, sort);

    // 각 상품의 재고를 함께 조회
    listBody.innerHTML = '';
    for (const item of data.content) {
      let qty = 0;
      try {
        const st = await StockApi.get(item.id);
        qty = st.quantity ?? 0;
      } catch {
        qty = 0;
      }

      const tr = el('tr', {},
        el('td', {}, String(item.id)),
        el('td', {}, item.name),
        el('td', {}, item.price.toLocaleString()),
        el('td', {}, item.description ?? ''),
        el('td', {}, String(qty)),
        el('td', {}, el('div', { class: 'actions' },
          el('button', { class: 'btn btn-outline', onClick: () => onEdit(item) }, '수정'),
          el('button', { class: 'btn btn-danger', onClick: () => onDelete(item.id) }, '삭제')
        ))
      );
      listBody.appendChild(tr);
    }

    pageInfo.textContent = `페이지 ${data.number + 1} / ${Math.max(1, data.totalPages)} · 총 ${data.totalElements}개`;
    prevBtn.disabled = data.number <= 0;
    nextBtn.disabled = data.number + 1 >= data.totalPages;
  } catch (e: any) {
    listMsg.innerHTML = `<span class="bad">목록 로드 실패: ${e.message}</span>`;
    showToast('목록 로드 실패: ' + e.message, 'error');
  } finally {
    setGlobalLoading(false);
  }
}

/** ================== 등록/수정/삭제 ================== */
function validateForm(): string[] {
  const errs: string[] = [];
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const initQty = Number(initStockInput.value || '0');

  if (!name) errs.push('이름을 입력하세요.');
  if (name.length > 100) errs.push('이름은 100자 이하입니다.');
  if (!Number.isFinite(price) || price <= 0) errs.push('가격은 1원 이상 정수입니다.');
  if (!Number.isFinite(initQty) || initQty < 0) errs.push('초기 재고는 0 이상 정수입니다.');
  if ((descInput.value ?? '').length > 1000) errs.push('설명은 1000자 이하입니다.');
  return errs;
}

async function onCreate(ev: SubmitEvent) {
  ev.preventDefault();
  const errs = validateForm();
  if (errs.length) { showToast(errs[0], 'error'); return; }

  try {
    createMsg.textContent = '';
    createBtn.disabled = true;

    const prod = await ProductApi.create({
      name: nameInput.value.trim(),
      price: Number(priceInput.value),
      description: descInput.value.trim(),
    });

    // 초기 재고 생성
    const initQty = Number(initStockInput.value || '0');
    if (initQty > 0) {
      await StockApi.create(prod.id, initQty);
    }

    showToast(`등록 완료: #${prod.id}`);
    createForm.reset();
    await load();
  } catch (e: any) {
    createMsg.innerHTML = `<span class="bad">등록 실패: ${e.message}</span>`;
    showToast('등록 실패: ' + e.message, 'error');
  } finally {
    createBtn.disabled = false;
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

  setGlobalLoading(true);
  ProductApi.update(item.id, patch)
    .then(() => { showToast('수정 완료'); load(); })
    .catch((e) => { showToast('수정 실패: ' + e.message, 'error'); })
    .finally(()=> setGlobalLoading(false));
}

function onDelete(id: number) {
  if (!confirm(`#${id} 삭제할까요?`)) return;
  setGlobalLoading(true);
  ProductApi.remove(id)
    .then(() => { showToast('삭제 완료'); load(); })
    .catch((e) => { showToast('삭제 실패: ' + e.message, 'error'); })
    .finally(()=> setGlobalLoading(false));
}

/** ================== 이벤트 바인딩 & 초기화 ================== */
createForm.addEventListener('submit', onCreate);

refreshBtn.addEventListener('click', () => {
  page = parseIntOrZero(pageInput.value);
  size = parseIntOrZero(sizeInput.value) || 10;
  sort = sortSelect.value || 'id,desc';
  load();
});

prevBtn.addEventListener('click', () => {
  if (page > 0) { page--; pageInput.value = String(page); load(); }
});
nextBtn.addEventListener('click', () => {
  page++; pageInput.value = String(page); load();
});

(async function init() {
  try {
    await loadConfig();        // ✅ 반드시 먼저
    await load();              // 목록 로드
  } catch (e:any) {
    alert('초기화 실패: ' + e.message);
  }
})();