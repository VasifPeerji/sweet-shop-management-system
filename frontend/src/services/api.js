import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
console.log("Using API base URL:", API_BASE_URL);
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('access_token');
      localStorage.removeItem('sweetshop_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  socialLogin: (socialData) => 
    api.post('/auth/social-login', socialData),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  logout: () => 
    api.post('/auth/logout'),
};

// Sweets API
export const sweetsAPI = {
  getSweets: (params = {}) => 
    api.get('/sweets/', { params }),
  
  getSweet: (id) => 
    api.get(`/sweets/${id}`),
  
  createSweet: (sweetData) => 
    api.post('/sweets/', sweetData),
  
  updateSweet: (id, sweetData) => 
    api.put(`/sweets/${id}`, sweetData),
  
  deleteSweet: (id) => 
    api.delete(`/sweets/${id}`),
  
  updateStock: (id, stock) => 
    api.patch(`/sweets/${id}/stock`, null, { params: { stock } }),
  
  toggleFeatured: (id, featured) => 
    api.patch(`/sweets/${id}/featured`, null, { params: { featured } }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => 
    api.get('/categories/'),
  
  refreshCounts: () => 
    api.post('/categories/refresh-counts'),
};

// Cart API
export const cartAPI = {
  getCart: () => 
    api.get('/cart/'),
  
  addToCart: (sweetId, quantity = 1) => 
    api.post('/cart/add', { sweet_id: sweetId, quantity }),
  
  updateCartItem: (sweetId, quantity) => 
    api.put(`/cart/item/${sweetId}`, { quantity }),
  
  removeFromCart: (sweetId) => 
    api.delete(`/cart/item/${sweetId}`),
  
  clearCart: () => 
    api.delete('/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => 
    api.get('/wishlist/'),
  
  addToWishlist: (sweetId) => 
    api.post(`/wishlist/add/${sweetId}`),
  
  removeFromWishlist: (sweetId) => 
    api.delete(`/wishlist/remove/${sweetId}`),
  
  clearWishlist: () => 
    api.delete('/wishlist/clear'),
};

// Orders API
export const ordersAPI = {
  getOrders: () => 
    api.get('/orders/'),
  
  createOrder: (orderData) => 
    api.post('/orders/', orderData),
  
  getOrder: (id) => 
    api.get(`/orders/${id}`),
  
  cancelOrder: (id) => 
    api.patch(`/orders/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getStats: () => 
    api.get('/admin/stats'),
  
  getUsers: () => 
    api.get('/admin/users'),
  
  getAllOrders: () => 
    api.get('/admin/orders'),
  
  updateOrderStatus: (orderId, status) => 
    api.patch(`/admin/order/${orderId}/status`, null, { params: { status } }),
  
  getDashboardData: () => 
    api.get('/admin/dashboard-data'),
};

export default api;