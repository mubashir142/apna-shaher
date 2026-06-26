const BASE_URL = "/api";

let token = "";

export const api = {
  setToken(t: string) {
    token = t;
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  },

  // Auth
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string, role?: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async getMe() {
    return this.request("/auth/me");
  },

  // Shops
  async getShops(filters?: { area?: string; city?: string }) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/shops${params ? `?${params}` : ""}`);
  },

  async getShopById(id: string) {
    return this.request(`/shops/${id}`);
  },

  async createShop(data: any) {
    return this.request("/shops", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateShop(data: any) {
    return this.request("/shops/my", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getMyShop() {
    return this.request("/shops/my");
  },

  // Products
  async getProducts(filters?: {
    category?: string;
    area?: string;
    city?: string;
    search?: string;
    shopId?: string;
  }) {
    const params = new URLSearchParams(filters as any).toString();
    return this.request(`/products${params ? `?${params}` : ""}`);
  },

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  },

  async createProduct(data: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  async getMyProducts() {
    return this.request("/products/my");
  },

  // Orders
  async createOrder(data: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyOrders() {
    return this.request("/orders/my");
  },

  async getSellerOrders() {
    return this.request("/orders/seller");
  },

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || "Upload failed");
    }
    return response.json();
  },

  async getAdminStats() {
    return this.request("/admin/stats");
  },

  async getAdminShops() {
    return this.request("/admin/shops");
  },

  async verifyShop(id: string) {
    return this.request(`/admin/shops/${id}/verify`, { method: "PUT" });
  },

  async getAdminOrders() {
    return this.request("/admin/orders");
  },
};
