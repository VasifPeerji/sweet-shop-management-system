import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, cartAPI, wishlistAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sweetshop_user');
    const accessToken = localStorage.getItem('access_token');
    
    if (savedUser && accessToken) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      // Load cart and wishlist from API
      loadUserData();
    }
    setIsInitialized(true);
  }, []);

  const loadUserData = async () => {
    try {
      // Load cart
      const cartResponse = await cartAPI.getCart();
      setCart(cartResponse.data.items || []);
      
      // Load wishlist
      const wishlistResponse = await wishlistAPI.getWishlist();
      setWishlist(wishlistResponse.data.items || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData } = response.data;
      
      // Store auth data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('sweetshop_user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Load user data
      await loadUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { access_token, user: newUser } = response.data;
      
      // Store auth data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('sweetshop_user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Load user data
      await loadUserData();
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider, socialData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.socialLogin({
        provider,
        ...socialData
      });
      const { access_token, user: userData } = response.data;
      
      // Store auth data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('sweetshop_user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Load user data
      await loadUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Social login failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (response) => {
    return await socialLogin('google', {
      name: response.name,
      email: response.email,
      avatar: response.picture
    });
  };

  const facebookLogin = async (response) => {
    return await socialLogin('facebook', {
      name: response.name,
      email: response.email,
      avatar: response.picture?.data?.url
    });
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('sweetshop_user');
    
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    setWishlist([]);
  };

  const addToCart = async (sweet, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to add items to cart' };
    }
    
    try {
      const response = await cartAPI.addToCart(sweet.id, quantity);
      setCart(response.data.items || []);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add to cart';
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCart = async (sweetId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await cartAPI.removeFromCart(sweetId);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (sweetId, quantity) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await cartAPI.updateCartItem(sweetId, quantity);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const addToWishlist = async (sweet) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to add items to wishlist' };
    }
    
    try {
      const response = await wishlistAPI.addToWishlist(sweet.id);
      setWishlist(response.data.items || []);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add to wishlist';
      return { success: false, error: errorMessage };
    }
  };

  const removeFromWishlist = async (sweetId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await wishlistAPI.removeFromWishlist(sweetId);
      setWishlist(response.data.items || []);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    user,
    isAuthenticated,
    cart,
    wishlist,
    isLoading,
    isInitialized,
    login,
    register,
    googleLogin,
    facebookLogin,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    getCartTotal,
    getCartItemCount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};