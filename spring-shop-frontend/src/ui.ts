export const qs = <T extends Element = Element>(s: string) =>
  document.querySelector(s) as T | null;

export const el = (tag: string, attrs: Record<string, any> = {}, children: (Node | string)[] = []) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k in n ? (n as any)[k] = v : n.setAttribute(k, v)));
  children.forEach(c => n.append(c instanceof Node ? c : document.createTextNode(String(c))));
  return n;
};

export const fmtPrice = (n: number) => `${Number(n).toLocaleString('ko-KR')}원`;

export const loading = (on: boolean) => qs('#loader')?.classList.toggle('show', !!on);

export const toast = (msg: string, type: 'ok' | 'error' = 'ok') => {
  const box = qs('#toast');
  if (!box) return;
  const t = el('div', { className: `toast ${type === 'error' ? 'error' : ''}` }, [msg]);
  box.appendChild(t);
  setTimeout(() => t.remove(), 2600);
};