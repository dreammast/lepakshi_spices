const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('spiceora_user') || sessionStorage.getItem('spiceora_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T> & { message?: string };

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }

  return json.data;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' })
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>('/auth/login', { email, password }),
  register: (body: { email: string; password: string; firstName: string; lastName?: string; phone?: string }) =>
    api.post<{ user: any; token: string }>('/auth/register', body),
  me: () => api.get<any>('/auth/me')
};

export const productsApi = {
  list: () => api.get<any[]>('/products'),
  get: (slug: string) => api.get<any>(`/products/${slug}`)
};

export const categoriesApi = {
  list: () => api.get<any[]>('/categories'),
  get: (slug: string) => api.get<any>(`/categories/${slug}`)
};

export const collectionsApi = {
  list: () => api.get<any[]>('/collections'),
  get: (slug: string) => api.get<any>(`/collections/${slug}`)
};

export const recipesApi = {
  list: () => api.get<any[]>('/recipes'),
  get: (slug: string) => api.get<any>(`/recipes/${slug}`)
};

export const reviewsApi = {
  listForProduct: (productId: number) => api.get<any[]>(`/products/${productId}/reviews`),
  createForProduct: (productId: number, body: unknown) => api.post<any>(`/products/${productId}/reviews`, body)
};

export const campaignsApi = {
  active: () => api.get<any[]>('/campaigns/active')
};

export const settingsApi = {
  get: (key: string) => api.get<any>(`/settings/${key}`)
};

export const wholesaleInquiryApi = {
  submit: (body: unknown) => api.post<any>('/wholesale-inquiries', body)
};

export const couponsApi = {
  validate: (code: string, cartTotal: number) => api.post<any>('/coupons/validate', { code, cartTotal })
};

export const ordersApi = {
  list: () => api.get<any[]>('/orders'),
  create: (body: unknown) => api.post<any>('/orders', body)
};

export const cartApi = {
  get: () => api.get<any>('/cart'),
  setItem: (body: { productVariantId: number; quantity: number; price: number | string }) =>
    api.put<any>('/cart/items', body),
  clear: () => api.delete<any>('/cart')
};

export const wishlistApi = {
  get: () => api.get<any>('/wishlist'),
  toggle: (productId: number) => api.post<any>('/wishlist/toggle', { productId })
};

export const addressesApi = {
  list: () => api.get<any[]>('/addresses'),
  create: (body: unknown) => api.post<any>('/addresses', body),
  update: (id: number, body: unknown) => api.put<any>(`/addresses/${id}`, body),
  remove: (id: number) => api.delete<any>(`/addresses/${id}`)
};
