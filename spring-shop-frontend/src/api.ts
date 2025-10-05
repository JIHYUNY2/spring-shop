// ---- api.ts ----

// 백엔드 주소 (없으면 MOCK 모드)
const BASE = (process?.env?.API_BASE_URL || '').replace(/\/+$/, '');
const USE_MOCK = !BASE;

// --------------------
// 타입 정의
// --------------------
export type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt?: string;
};

type Page<T> = {
  content: T[];
  totalPages: number;
  number: number;
};

// RequestInit의 body/headers를 오버라이드해서 객체 body 허용
type JsonInit = Omit<RequestInit, 'body' | 'headers'> & {
  body?: any;
  headers?: Record<string, string>;
};

// --------------------
// 공통 request 함수
// --------------------
async function request<T>(path: string, init: JsonInit = {}): Promise<T> {
  const url = BASE + path;

  const _body = init.body;
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {})
  };

  const opt: RequestInit = {
    ...init,
    headers,
    body: _body && typeof _body !== 'string' ? JSON.stringify(_body) : _body
  };

  const res = await fetch(url, opt);
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : (await res.text() as any);

  if (!res.ok) {
    const msg = isJson ? (data?.error?.message || JSON.stringify(data)) : res.statusText;
    throw new Error(msg);
  }

  // Spring에서 ApiResponse 래핑 시 data 필드 추출
  return (data && typeof data === 'object' && 'data' in data)
    ? data.data
    : data;
}

// --------------------
// MOCK 데이터 (백엔드 없이 UI 확인용)
// --------------------
let mockSeq = 3;
let mockData: Product[] = [
  { id: 1, name: 'Basic T-Shirt', price: 19900, description: '베이직 티셔츠', createdAt: new Date().toISOString() },
  { id: 2, name: 'Hoodie',       price: 39900, description: '후디',         createdAt: new Date().toISOString() },
  { id: 3, name: 'Jeans',        price: 49900, description: '데님',         createdAt: new Date().toISOString() },
];

function mockPage(page = 0, size = 20, sort = 'id,desc'): Page<Product> {
  const [key, dir] = sort.split(',');
  const sorted = [...mockData].sort((a: any, b: any) =>
    dir === 'desc' ? (a[key] < b[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1)
  );
  const start = page * size;
  const content = sorted.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  return { content, totalPages, number: page };
}

// --------------------
// API Export (Mock + Real 공통 인터페이스)
// --------------------
export const api = {
  // 상품 목록
  listProducts: (page: number, size: number, sort: string) =>
    USE_MOCK
      ? Promise.resolve(mockPage(page, size, sort))
      : request<Page<Product>>(`/api/v1/products?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`),

  // 상품 상세
  getProduct: (id: number) =>
    USE_MOCK
      ? Promise.resolve(mockData.find(p => p.id === id)!)
      : request<Product>(`/api/v1/products/${id}`),

  // 상품 등록
  createProduct: (p: Pick<Product, 'name' | 'price' | 'description'>) => {
    if (USE_MOCK) {
      const item: Product = { id: ++mockSeq, createdAt: new Date().toISOString(), ...p };
      mockData.unshift(item);
      return Promise.resolve(item);
    }
    return request<Product>('/api/v1/products', {
      method: 'POST',
      body: p // ← 객체 그대로 전달해도 OK (request()에서 JSON 처리)
    });
  },

  // 상품 삭제
  deleteProduct: (id: number) => {
    if (USE_MOCK) {
      mockData = mockData.filter(p => p.id !== id);
      return Promise.resolve();
    }
    return request<void>(`/api/v1/products/${id}`, { method: 'DELETE' });
  }
};