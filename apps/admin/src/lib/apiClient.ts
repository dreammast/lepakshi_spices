const VITE_API_URL = import.meta.env.VITE_API_URL;

// Production safety: in production, if VITE_API_URL is not set, crash instead of silently
// falling back to localhost which would fail all requests.
if (import.meta.env.PROD && !VITE_API_URL) {
  throw new Error(
    'VITE_API_URL is not set in production. Set VITE_API_URL=https://lepakshi-spices-cpsf.onrender.com/api in .env.production'
  );
}

const API_URL = VITE_API_URL || 'http://localhost:4000/api';

// Development-only debug log to help verify the resolved API base URL
if (import.meta.env.DEV) {
  console.log(`[apiClient] API base URL: ${API_URL}`);
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type CustomerListItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  segment: 'new' | 'regular' | 'vip' | 'wholesale';
  createdAt: string;
  orderCount: number;
  ltv: number;
};

export type CustomerActivity = {
  id: string;
  type: string;
  occurredAt: string;
  label: string;
  detail: string;
};

export type CustomerDetails = CustomerListItem & {
  addresses: Array<{ id: number; label: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; country: string; isDefault: boolean }>;
  orders: any[];
  reviews: any[];
  activity: CustomerActivity[];
};

function getAuthToken(): string | null {
  try {
    const adminRaw = localStorage.getItem('spiceora_admin');
    if (adminRaw) return JSON.parse(adminRaw).token || null;
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
  adminLogin: (username: string, password: string) =>
    api.post<{ user: any; token: string }>('/auth/admin/login', { username, password }),
  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>('/auth/login', { email, password }),
  register: (body: { email: string; password: string; firstName: string; lastName?: string }) =>
    api.post<{ user: any; token: string }>('/auth/register', body),
  me: () => api.get<any>('/auth/me')
  ,adminLogout: () => api.post<null>('/auth/admin/logout')
};

export const productsApi = {
  list: () => api.get<any[]>('/products'),
  create: (body: unknown) => api.post<any>('/products', body),
  update: (id: number, body: unknown) => api.put<any>(`/products/${id}`, body),
  remove: (id: number) => api.delete<any>(`/products/${id}`),
  updateVariantStock: (variantId: number, stock: number, lowStockThreshold?: number) =>
    api.put<any>(`/products/variants/${variantId}/stock`, { stock, lowStockThreshold }),
  checkStock: (variantIds: number[]) => api.post<any[]>('/products/stock-check', { variantIds })
};

export const categoriesApi = {
  list: () => api.get<any[]>('/categories'),
  create: (body: unknown) => api.post<any>('/categories', body),
  update: (id: number, body: unknown) => api.put<any>(`/categories/${id}`, body),
  remove: (id: number) => api.delete<any>(`/categories/${id}`)
};

export const collectionsApi = {
  list: () => api.get<any[]>('/collections'),
  get: (slug: string) => api.get<any>(`/collections/${slug}`),
  create: (body: unknown) => api.post<any>('/collections', body),
  update: (id: number, body: unknown) => api.put<any>(`/collections/${id}`, body),
  remove: (id: number) => api.delete<any>(`/collections/${id}`),
  setProducts: (id: number, productIds: number[]) => api.put<any>(`/collections/${id}/products`, { productIds })
};

export const couponsApi = {
  list: () => api.get<any[]>('/admin/coupons'),
  create: (body: unknown) => api.post<any>('/admin/coupons', body),
  update: (id: number, body: unknown) => api.put<any>(`/admin/coupons/${id}`, body),
  remove: (id: number) => api.delete<any>(`/admin/coupons/${id}`)
};

export const campaignsApi = {
  list: () => api.get<any[]>('/admin/campaigns'),
  create: (body: unknown) => api.post<any>('/admin/campaigns', body),
  update: (id: number, body: unknown) => api.put<any>(`/admin/campaigns/${id}`, body),
  remove: (id: number) => api.delete<any>(`/admin/campaigns/${id}`)
};

export const recipesApi = {
  list: () => api.get<any[]>('/admin/recipes'),
  create: (body: unknown) => api.post<any>('/admin/recipes', body),
  update: (id: number, body: unknown) => api.put<any>(`/admin/recipes/${id}`, body),
  remove: (id: number) => api.delete<any>(`/admin/recipes/${id}`)
};

export const reviewsApi = {
  adminList: () => api.get<any[]>('/admin/reviews'),
  updateStatus: (id: number, status: string) => api.put<any>(`/admin/reviews/${id}/status`, { status }),
  remove: (id: number) => api.delete<any>(`/admin/reviews/${id}`)
};

export const settingsApi = {
  get: (key: string) => api.get<any>(`/settings/${key}`),
  set: (key: string, value: unknown) => api.put<any>(`/admin/settings/${key}`, { value })
};

export const wholesaleApi = {
  listInquiries: () => api.get<any[]>('/admin/wholesale-inquiries'),
  updateInquiry: (id: number, body: unknown) => api.put<any>(`/admin/wholesale-inquiries/${id}`, body),
  updateInquiryStatus: (id: number, status: string) => api.put<any>(`/admin/wholesale-inquiries/${id}/status`, { status }),
  deleteInquiry: (id: number) => api.delete<any>(`/admin/wholesale-inquiries/${id}`),
  listQuotations: () => api.get<any[]>('/admin/quotations'),
  getQuotation: (id: number) => api.get<any>(`/admin/quotations/${id}`),
  createQuotation: (body: unknown) => api.post<any>('/admin/quotations', body),
  updateQuotation: (id: number, body: unknown) => api.put<any>(`/admin/quotations/${id}`, body),
  deleteQuotation: (id: number) => api.delete<any>(`/admin/quotations/${id}`),
  approveAndSend: (id: number, attachPdf = false, sentBy = 'Admin') => api.put<any>(`/admin/quotations/${id}`, { status: 'approved', attachPdf, sentBy }),
  resendQuotation: (id: number, attachPdf = false, sentBy = 'Admin') => api.put<any>(`/admin/quotations/${id}`, { resend: true, attachPdf, sentBy }),
  notifyOrderStatus: (id: number, status: string) => api.post<any>(`/admin/quotations/${id}/notify-order-status`, { status }),
  downloadQuotationPdf: async (id: number): Promise<{ blob: Blob; filename: string }> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/admin/quotations/${id}/pdf`, { headers });
    if (!res.ok) {
      let message = `PDF download failed (${res.status})`;
      try {
        const json = await res.json();
        message = json.message || message;
      } catch { /* not JSON */ }
      throw new Error(message);
    }
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="([^"]+)"/);
    return { blob: await res.blob(), filename: match ? match[1] : `Lepakshi_Spices_Quotation_${id}.pdf` };
  }
};

export const packagingApi = {
  list: (productId: number) => api.get<any[]>(`/products/${productId}/packaging`),
  create: (productId: number, body: unknown) => api.post<any>(`/products/${productId}/packaging`, body),
  update: (id: number, body: unknown) => api.put<any>(`/packaging/${id}`, body),
  remove: (id: number) => api.delete<any>(`/packaging/${id}`)
};

export const customersApi = {
  list: () => api.get<CustomerListItem[]>('/admin/customers'),
  get: (id: number) => api.get<CustomerDetails>(`/admin/customers/${id}`),
  updateRole: (id: number, role: string) => api.put<any>(`/admin/customers/${id}/role`, { role }),
  updateProfile: (id: number, body: unknown) => api.put<any>(`/admin/customers/${id}/profile`, body)
};

export const auditApi = {
  list: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return api.get<any[]>(`/admin/audit-logs${params ? `?${params}` : ''}`);
  },
  createLog: (action: string, details: string) => api.post<any>('/admin/audit-logs', { action, details })
};

export const ordersApi = {
  adminList: () => api.get<any[]>('/admin/orders'),
  updateStatus: (id: number, status: string) =>
    api.put<any>(`/admin/orders/${id}/status`, { status }),
  verifyPayment: (id: number, adminName = 'Admin') =>
    api.put<any>(`/admin/orders/${id}/verify-payment`, { adminName })
};

export const dashboardApi = {
  getStats: () => api.get<any>('/admin/dashboard/stats'),
};
