const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const API_BASE_URL = API_URL;

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
  syncOAuth: (body: { email: string; firstName?: string; lastName?: string; avatarUrl?: string }) =>
    api.post<{ user: any; token: string }>('/auth/sync-oauth', body),
  me: () => api.get<any>('/auth/me'),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  verifyResetOtp: (email: string, otp: string) =>
    api.post<{ message: string }>('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email, otp, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword }),
  updateProfile: (body: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) =>
    api.post<any>('/auth/update-profile', body),
  sendVerificationEmail: () =>
    api.post<{ message: string }>('/auth/send-verification-email'),
  verifyEmail: (email: string, token: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, token }),
};

export const productsApi = {
  list: () => api.get<any[]>('/products'),
  get: (slug: string) => api.get<any>(`/products/${slug}`),
  checkStock: (variantIds: number[]) => api.post<any[]>('/products/stock-check', { variantIds })
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
  listApproved: () => api.get<any[]>('/reviews'),
  listForProduct: (productId: number) => api.get<any[]>(`/products/${productId}/reviews`),
  createForProduct: (productId: number, body: unknown) => api.post<any>(`/products/${productId}/reviews`, body),
  myReviews: () => api.get<any[]>('/reviews/my'),
  updateMyReview: (id: number, body: unknown) => api.put<any>(`/reviews/${id}`, body),
  deleteMyReview: (id: number) => api.delete<any>(`/reviews/${id}`)
};


export const campaignsApi = {
  active: () => api.get<any[]>('/campaigns/active')
};

export const settingsApi = {
  get: (key: string) => api.get<any>(`/settings/${key}`)
};

export const wholesaleInquiryApi = {
  submit: (body: unknown) => api.post<any>('/wholesale-inquiries', body),
  getMyInquiries: () => api.get<any[]>('/wholesale-inquiries/my/inquiries'),
  getMyQuotations: () => api.get<any[]>('/wholesale-inquiries/my/quotations'),
  getMyOrders: () => api.get<any[]>('/wholesale-inquiries/my/orders'),
  getMyInvoices: () => api.get<any[]>('/wholesale-inquiries/my/invoices'),
  getOrderTracking: (orderId: number) => api.get<any[]>(`/wholesale-inquiries/my/orders/${orderId}/tracking`)
};

export const wholesaleCatalogueApi = {
  list: () => api.get<any[]>('/wholesale-inquiries/catalogue')
};

export const couponsApi = {
  available: () => api.get<any[]>('/coupons/available'),
  validate: (code: string, cartTotal: number) => api.post<any>('/coupons/validate', { code, cartTotal })
};

export const ordersApi = {
  list: () => api.get<any[]>('/orders'),
  get: (id: number | string) => api.get<any>(`/orders/${id}`),
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

export const locationApi = {
  reverse: (latitude: number, longitude: number) => api.get<{ street: string }>(`/location/reverse?lat=${latitude}&lon=${longitude}`)
};
