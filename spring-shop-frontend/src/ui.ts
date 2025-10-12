// src/ui.ts

// querySelector 헬퍼
export const $ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelector(sel) as T | null;

// element 생성 헬퍼
export const el = (
  tag: string,
  attrs: Record<string, any> = {},
  ...children: (Node | string)[]
) => {
  const node = document.createElement(tag);

  // 키를 string으로 안전하게 취급
  (Object.entries(attrs) as [string, any][])
    .forEach(([k, v]) => {
      if (k === 'class') {
        node.className = v;
      } else if (k.startsWith('on') && typeof v === 'function') {
        // onClick, onChange ...
        node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      } else if (v != null) {
        node.setAttribute(k, String(v));
      }
    });

  for (const c of children) node.append(c);
  return node;
};