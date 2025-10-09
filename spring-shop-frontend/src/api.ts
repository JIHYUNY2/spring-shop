// API 호출 래퍼 (스프링 응답 규격 {success, data, error} 처리)

export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
};

type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
};

const BASE_URL = 'http://localhost:8080';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  // 스프링은 4xx/5xx에도 JSON 바디를 주므로 우선 파싱 시도
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    const msg =
      body?.error?.message ||
      body?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return (body as ApiResponse<T>).data;
}

// API들
export const ProductApi = {
  list: (page = 0, size = 10, sort = 'id,desc') =>
    request<Page<Product>>(`/api/v1/products?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`),

  create: (p: Pick<Product, 'name' | 'price' | 'description'>) =>
    request<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(p),
    }),

  update: (id: number, patch: Partial<Pick<Product, 'name' | 'price' | 'description'>>) =>
    request<Product>(`/api/v1/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  remove: (id: number) =>
    fetch(`${BASE_URL}/api/v1/products/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok && r.status !== 204) throw new Error(`${r.status} ${r.statusText}`);
    }),
};