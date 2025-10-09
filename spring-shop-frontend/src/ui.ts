export const $ = (sel: string, root: ParentNode | Document = document) =>
  root.querySelector(sel) as HTMLElement;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, any> = {},
  ...children: (Node | string | null | undefined)[]
) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, String(v));
  });
  for (const c of children) {
    if (c === null || c === undefined) continue;
    node.append(c instanceof Node ? c : document.createTextNode(c));
  }
  return node;
}