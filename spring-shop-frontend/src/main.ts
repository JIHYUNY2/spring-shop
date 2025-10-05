import './styles.css';
import { api } from './api';
import { qs, el, fmtPrice, loading, toast } from './ui';

const PAGE = { number: 0, size: 20, sort: 'id,desc', totalPages: 0 };

// 테마 초기화/토글
const THEME_KEY = 'shop_theme';
(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
    document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }
})();
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', cur);
  localStorage.setItem(THEME_KEY, cur);
}

// 목록 로드
async function loadList() {
  loading(true);
  try {
    const page = await api.listProducts(PAGE.number, PAGE.size, PAGE.sort);
    const items = (page as any).content ?? (page as any);
    PAGE.totalPages = (page as any).totalPages ?? 1;
    renderList(Array.isArray(items) ? items : [], page as any);
  } catch (e: any) {
    console.error(e);
    renderList([], { number: 0, totalPages: 0 });
    toast('목록 로드 실패: ' + e.message, 'error');
  } finally {
    loading(false);
  }
}

function renderList(items: any[], meta: { number?: number; totalPages?: number }) {
  const list = qs('#list')!;
  list.innerHTML = '';
  const empty = qs('#empty') as HTMLElement;
  empty.style.display = items.length ? 'none' : 'block';

  items.forEach((p: any) => {
    const card = el('div', { className: 'product' }, [
      el('h3', {}, [p.name]),
      el('div', { className: 'price' }, [fmtPrice(p.price)]),
      el('div', { className: 'muted' }, [p.description || '']),
      el('div', { style: 'display:flex; gap:8px; margin-top:10px' }, [
        el('button', { className: 'ghost', onclick: () => openDetail(p.id) }, ['상세']),
      ])
    ]);
    list.append(card);
  });

  const cur = (meta.number ?? PAGE.number) + 1;
  const total = meta.totalPages ?? PAGE.totalPages ?? 1;
  setPageInfo(cur, total);
}

function setPageInfo(cur: number, total: number) {
  (qs('#pageInfo') as HTMLElement).textContent = `${cur} / ${total}`;
  (qs<HTMLButtonElement>('#prev')!).disabled = cur <= 1;
  (qs<HTMLButtonElement>('#next')!).disabled = cur >= total;
}

// 상세/삭제
async function openDetail(id: number) {
  loading(true);
  try {
    const p = await api.getProduct(id);
    const body = qs('#detailBody')!;
    body.innerHTML = '';
    body.append(
      el('div', { style: 'display:grid; gap:8px' }, [
        el('div', {}, [el('div', { className: 'muted' }, ['상품명']), el('div', { style: 'font-weight:700' }, [p.name])]),
        el('div', {}, [el('div', { className: 'muted' }, ['가격']), el('div', { className: 'price' }, [fmtPrice(p.price)])]),
        el('div', {}, [el('div', { className: 'muted' }, ['설명']), el('div', {}, [p.description || '—'])]),
        el('div', {}, [el('div', { className: 'muted' }, ['생성일']), el('div', {}, [new Date(p.createdAt || Date.now()).toLocaleString('ko-KR')])]),
      ])
    );
    (qs<HTMLButtonElement>('#deleteBtn')!).onclick = () => onDelete(id);
    (qs<HTMLDialogElement>('#detailModal')!).showModal();
  } catch (e: any) {
    toast('상세 조회 실패: ' + e.message, 'error');
  } finally {
    loading(false);
  }
}

async function onDelete(id: number) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  loading(true);
  try {
    await api.deleteProduct(id);
    toast('삭제되었습니다.');
    (qs<HTMLDialogElement>('#detailModal')!).close();
    loadList();
  } catch (e: any) {
    toast('삭제 실패: ' + e.message, 'error');
  } finally {
    loading(false);
  }
}

// 등록
async function onCreate(ev: Event) {
  ev.preventDefault();
  const form = ev.currentTarget as HTMLFormElement;
  const fd = new FormData(form);
  const payload = {
    name: String(fd.get('name') || '').trim(),
    price: Number(fd.get('price') || 0),
    description: String(fd.get('description') || '').trim()
  };
  if (!payload.name || !payload.price) {
    toast('이름/가격은 필수입니다.', 'error');
    return;
  }
  loading(true);
  try {
    await api.createProduct(payload);
    form.reset();
    PAGE.number = 0;
    toast('상품이 등록되었습니다.');
    loadList();
  } catch (e: any) {
    toast('등록 실패: ' + e.message, 'error');
  } finally {
    loading(false);
  }
}

// 바인딩 & 초기화
function bindControls() {
  (qs<HTMLButtonElement>('#prev')!).onclick = () => { if (PAGE.number > 0) { PAGE.number--; loadList(); } };
  (qs<HTMLButtonElement>('#next')!).onclick = () => { if (PAGE.number + 1 < PAGE.totalPages) { PAGE.number++; loadList(); } };
  (qs<HTMLSelectElement>('#size')!).onchange = (e: any) => { PAGE.size = Number(e.target.value); PAGE.number = 0; loadList(); };
  (qs<HTMLSelectElement>('#sort')!).onchange = (e: any) => { PAGE.sort = String(e.target.value); PAGE.number = 0; loadList(); };
  (qs<HTMLButtonElement>('#openCreate')!).onclick = () => { (qs<HTMLInputElement>('input[name="name"]')!).focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  (qs<HTMLButtonElement>('#closeModal')!).onclick = () => (qs<HTMLDialogElement>('#detailModal')!).close();
  (qs<HTMLButtonElement>('#closeModal2')!).onclick = () => (qs<HTMLDialogElement>('#detailModal')!).close();
  (qs<HTMLFormElement>('#createForm')!).addEventListener('submit', onCreate);
  (qs<HTMLButtonElement>('#themeToggle')!).addEventListener('click', toggleTheme);
}

function init() {
  bindControls();
  loadList();
}
init();