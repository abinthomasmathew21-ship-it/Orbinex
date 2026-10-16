import {
  User,
  Auto,
  Bus,
  SecurityContact,
  TransportRequest,
  MedicalRequest,
  FoodDeliveryRequest,
  AdminStats,
  AuditLog,
} from '../types/index.ts';

const TOKEN_KEY = 'orbinex_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (payload: { name: string; email: string; phone: string; college_id: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Autos
  getAutos: () => request<Auto[]>('/autos'),

  createAuto: (payload: { auto_number: string; driver_name: string; driver_phone: string; status?: string }) =>
    request<{ message: string }>('/admin/autos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAuto: (id: number, payload: Partial<Auto>) =>
    request<{ message: string }>(`/admin/autos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteAuto: (id: number) =>
    request<{ message: string }>(`/admin/autos/${id}`, {
      method: 'DELETE',
    }),

  // Buses
  getBuses: () => request<Bus[]>('/buses'),

  createBus: (payload: { bus_number: string; driver_name: string; driver_phone: string; bus_route: string; status?: string }) =>
    request<{ message: string }>('/admin/buses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBus: (id: number, payload: Partial<Bus>) =>
    request<{ message: string }>(`/admin/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteBus: (id: number) =>
    request<{ message: string }>(`/admin/buses/${id}`, {
      method: 'DELETE',
    }),

  // Campus Security
  getSecurity: () => request<SecurityContact[]>('/security'),

  createSecurity: (payload: { name: string; phone: string; status?: string }) =>
    request<{ message: string }>('/admin/security', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateSecurity: (id: number, payload: Partial<SecurityContact>) =>
    request<{ message: string }>(`/admin/security/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteSecurity: (id: number) =>
    request<{ message: string }>(`/admin/security/${id}`, {
      method: 'DELETE',
    }),

  // Transport Requests
  createTransportRequest: (payload: {
    destination: string;
    service_type: string;
    preferred_vehicle?: string;
    additional_note?: string;
  }) =>
    request<{ message: string; request_code: string }>('/transport-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyTransportRequests: () => request<TransportRequest[]>('/transport-requests/my'),

  getAdminTransportRequests: (params?: { status?: string; service?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.service) q.append('service', params.service);
    if (params?.search) q.append('search', params.search);
    return request<TransportRequest[]>(`/admin/transport-requests?${q.toString()}`);
  },

  updateAdminTransportRequest: (id: number, payload: { status?: string; assigned_vehicle?: string }) =>
    request<{ message: string }>(`/admin/transport-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Medical Requests
  createMedicalRequest: (payload: { current_location: string; destination: string; emergency_note: string }) =>
    request<{ message: string; request_code: string }>('/medical-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyMedicalRequests: () => request<MedicalRequest[]>('/medical-requests/my'),

  getAdminMedicalRequests: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<MedicalRequest[]>(`/admin/medical-requests?${q.toString()}`);
  },

  updateAdminMedicalRequest: (id: number, payload: { status?: string; assigned_vehicle?: string }) =>
    request<{ message: string }>(`/admin/medical-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Hostel Food Delivery Requests
  createFoodRequest: (payload: {
    hostel_block: string;
    room_number: string;
    food_request: string;
    delivery_location: string;
    additional_note?: string;
  }) =>
    request<{ message: string; request_code: string }>('/food-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyFoodRequests: () => request<FoodDeliveryRequest[]>('/food-requests/my'),

  getAdminFoodRequests: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<FoodDeliveryRequest[]>(`/admin/food-requests?${q.toString()}`);
  },

  updateAdminFoodRequest: (id: number, payload: { status?: string }) =>
    request<{ message: string }>(`/admin/food-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Admin Dashboard & Audit
  getAdminStats: () => request<AdminStats>('/admin/stats'),

  getAuditLogs: () => request<AuditLog[]>('/admin/audit-logs'),

  getStudents: () => request<User[]>('/admin/students'),
};
