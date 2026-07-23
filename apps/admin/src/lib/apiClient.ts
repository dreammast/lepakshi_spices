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

export const productsApi = {
  list: () => api.get<any[]>('/products'),
  create: (body: unknown) => api.post<any>('/products', body),
  update: (id: number, body: unknown) => api.put<any>(`/products/${id}`, body),
  remove: (id: number) => api.delete<any>(`/products/${id}`)
};

export const categoriesApi = {
  list: () => api.get<any[]>('/categories'),
  create: (body: unknown) => api.post<any>('/categories', body),
  update: (id: number, body: unknown) => api.put<any>(`/categories/${id}`, body),
  remove: (id: number) => api.delete<any>(`/categories/${id}`)
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>('/auth/login', { email, password }),
  register: (body: { email: string; password: string; firstName: string; lastName?: string }) =>
    api.post<{ user: any; token: string }>('/auth/register', body),
  me: () => api.get<any>('/auth/me')
};

export const ordersApi = {
  adminList: () => api.get<any[]>('/admin/orders'),
  updateStatus: (id: number, status: string) =>
    api.put<any>(`/admin/orders/${id}/status`, { status })
};
