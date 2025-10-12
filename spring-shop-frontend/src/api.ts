// src/api.ts

// ---------- 공개 타입 ----------
export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  pageable: { pageNumber: number; pageSize: number; sort: { empty: boolean; sorted: boolean; unsorted: boolean } };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  empty: boolean;
};

export type ProductStock = {
  productId: number;
  quantity: number;
  version?: number;
};

// 서버 표준 응답(envelope)
type ApiEnvelope<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data?: undefined; error: { code: string; message: string } };

// ---------- config ----------
let API_BASE = '';

export async function loadConfig() {
  const r = await fetch('/config.json');
  const cfg = await r.json();
  if (!cfg.API_BASE) throw new Error('config.json에 API_BASE 없음');
  API_BASE = String(cfg.API_BASE).replace(/\/$/, '');
}

// ---------- 내부 유틸 (핵심) ----------

// 공통 요청 + envelope 해제
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }
  const payload = (await res.json()) as ApiEnvelope<T>;
  if (!payload.success) {
    throw new Error(payload.error?.message ?? 'API 호출 실패');
  }
  return payload.data;
}

// JSON 바디를 안전히 설정하는 빌더
function buildJsonInit(body: unknown, method: 'POST' | 'PUT' | 'PATCH'): RequestInit {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  return {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

// 사용하기 쉬운 HTTP 헬퍼
const http = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) => request<T>(url, buildJsonInit(body, 'POST')),
  put:  <T>(url: string, body?: unknown) => request<T>(url, buildJsonInit(body, 'PUT')),
  patch:<T>(url: string, body?: unknown) => request<T>(url, buildJsonInit(body, 'PATCH')),
  del:  <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// ---------- Product API ----------
export const ProductApi = {
  list: (page = 0, size = 10, sort = 'id,desc') =>
    http.get<Page<Product>>(`/products?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`),

  get: (id: number) =>
    http.get<Product>(`/products/${id}`),

  create: (p: Pick<Product, 'name' | 'price' | 'description'>) =>
    http.post<Product>(`/products`, p),

  update: (id: number, patch: Partial<Pick<Product, 'name' | 'price' | 'description'>>) =>
    http.patch<Product>(`/products/${id}`, patch),

  remove: (id: number) =>
    http.del<null>(`/products/${id}`),
};

// ---------- Stock API ----------
export const StockApi = {
  create: (productId: number, quantity: number) =>
    http.post<ProductStock>(`/stocks/${productId}`, { quantity }),

  get: (productId: number) =>
    http.get<ProductStock>(`/stocks/${productId}`),

  set: (productId: number, quantity: number) =>
    http.put<ProductStock>(`/stocks/${productId}`, { quantity }),

  adjust: (productId: number, delta: number) =>
    http.patch<ProductStock>(`/stocks/${productId}/adjust`, { delta }),
};