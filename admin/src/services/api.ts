import type {
  Product,
  Category,
  Artisan,
  Order,
  CustomsDocument,
  HSCodeMaster,
  HSSuggestionResult,
  CurrencyRates,
  User,
  Profile
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

class AdminApiService {
  private getToken(): string | null {
    return localStorage.getItem('rcg_admin_token') || localStorage.getItem('rcg_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMessage = 'Network request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // --- AUTH ---
  async login(email: string, password: string) {
    const res = await this.request<{ token: string; user: User; profile: Profile; artisan: Artisan | null }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      localStorage.setItem('rcg_admin_token', res.token);
    }
    return res;
  }

  async demoLogin(role: 'admin' = 'admin') {
    const res = await this.request<{ token: string; user: User; profile: Profile; artisan: Artisan | null }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    if (res.token) {
      localStorage.setItem('rcg_admin_token', res.token);
    }
    return res;
  }

  async getMe() {
    return this.request<{ user: User; profile: Profile; artisan: Artisan | null }>('/auth/me');
  }

  logout() {
    localStorage.removeItem('rcg_admin_token');
    localStorage.removeItem('rcg_token');
  }

  // --- ADMIN ANALYTICS ---
  async getAdminAnalytics() {
    return this.request<{
      metrics: {
        total_users: number;
        total_artisans: number;
        total_products: number;
        total_orders: number;
        total_revenue_inr: number;
        total_revenue_usd: number;
        customs_documents_generated: number;
        hs_codes_verified_rate: string;
      };
      charts: {
        revenue_trend: { month: string; revenue_inr: number; revenue_usd: number; orders: number }[];
        orders_by_country: { country: string; orders: number; revenue_usd: number }[];
        category_share: { name: string; value: number; color: string }[];
      };
      recent_orders: Order[];
    }>('/admin/analytics');
  }

  // --- HS CODES MASTER ---
  async getHSCodes(search?: string, category?: string) {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    if (category) q.append('category', category);
    const qs = q.toString();
    return this.request<HSCodeMaster[]>(`/hs-codes${qs ? `?${qs}` : ''}`);
  }

  async createHSCode(data: Partial<HSCodeMaster>) {
    return this.request<HSCodeMaster>('/hs-codes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateHSCode(id: string, data: Partial<HSCodeMaster>) {
    return this.request<HSCodeMaster>(`/hs-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteHSCode(id: string) {
    return this.request<{ success: boolean; message: string }>(`/hs-codes/${id}`, {
      method: 'DELETE'
    });
  }

  async suggestHSCode(data: { name: string; material?: string; description?: string; category_name?: string }) {
    return this.request<HSSuggestionResult>('/products/suggest-hs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- CUSTOMS & INVOICES ---
  async getCustomsDocs() {
    return this.request<CustomsDocument[]>('/customs');
  }

  async getCustomsDoc(id: string) {
    return this.request<CustomsDocument>(`/customs/${id}`);
  }

  async getCustomsByOrder(orderId: string) {
    return this.request<CustomsDocument>(`/customs/by-order/${orderId}`);
  }

  async verifyCustoms(id: string, data: { hs_codes?: Record<number, string>; notes?: string; status?: string }) {
    return this.request<CustomsDocument>(`/customs/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // --- ORDERS ---
  async getOrders() {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: string) {
    return this.request<{ order: Order; customs_document: CustomsDocument | null }>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string, tracking_number?: string) {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tracking_number })
    });
  }

  // --- PRODUCTS ---
  async getProducts(params?: { search?: string; category?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.category) query.append('category', params.category);
      if (params.status) query.append('status', params.status);
    }
    const qStr = query.toString();
    return this.request<{ products: Product[]; total: number }>(`/products${qStr ? `?${qStr}` : ''}`);
  }

  async updateProduct(id: string, productData: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  // --- ARTISANS ---
  async getArtisans() {
    return this.request<Artisan[]>('/artisans');
  }

  async updateArtisan(id: string, data: Partial<Artisan>) {
    return this.request<Artisan>(`/artisans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // --- CATEGORIES ---
  async getCategories() {
    return this.request<Category[]>('/categories');
  }

  // --- CURRENCY ---
  async getCurrencyRates() {
    return this.request<CurrencyRates>('/currency/rates');
  }

  async refreshCurrencyRates() {
    return this.request<{ success: boolean; message: string; data: CurrencyRates }>('/currency/refresh', {
      method: 'POST'
    });
  }
}

export const api = new AdminApiService();
