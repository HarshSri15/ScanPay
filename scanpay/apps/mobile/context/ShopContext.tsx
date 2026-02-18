import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { initDB } from '../db/database';
import {
  upsertProducts,
  getLastSyncTimestamp,
  setLastSyncTimestamp,
} from '../db/products';
import {
  loadCart,
  addOrUpdateCartItem,
  updateCartItemQty,
  removeCartItemById,
  clearAllCart,
} from '../db/cart';
import { CartItem, Product, User } from '../types';

// Simple UUID for cart item IDs
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface ShopContextType {
  cart: CartItem[];
  user: User | null;
  isOnline: boolean;
  isLoadingUser: boolean;
  addToCart: (product: Product, variant: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  sendOtp: (phone: string, name: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  syncCatalog: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | null>(null);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    // Initialize SQLite
    initDB();

    // Load persisted cart
    const savedCart = loadCart();
    setCart(savedCart);

    // Load persisted user
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch {}

    setIsLoadingUser(false);

    // Attempt catalog sync on startup
    await syncCatalog();
  };

  const syncCatalog = useCallback(async (): Promise<void> => {
    try {
      const since = getLastSyncTimestamp();
      const res = await apiClient.get(`/products/catalog?since=${since}`);
      upsertProducts(res.data.products);
      setLastSyncTimestamp(res.data.syncedAt);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  const addToCart = (product: Product, variant: string): void => {
    const newItem = {
      sku: product.sku,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      selectedVariant: variant,
      shop: product.shop,
    };
    const id = generateId();
    addOrUpdateCartItem(newItem, id);
    // Reload from SQLite to get accurate state
    setCart(loadCart());
  };

  const removeFromCart = (id: string): void => {
    removeCartItemById(id);
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number): void => {
    if (quantity < 1) return;
    updateCartItemQty(id, quantity);
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = (): void => {
    clearAllCart();
    setCart([]);
  };

  const sendOtp = async (phone: string, name: string): Promise<void> => {
    await apiClient.post('/auth/send-otp', { phone, name });
  };

  const login = async (phone: string, otp: string): Promise<void> => {
    const res = await apiClient.post('/auth/verify-otp', { phone, otp });
    const { accessToken, user: userData } = res.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.multiRemove(['accessToken', 'user']);
    setUser(null);
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        user,
        isOnline,
        isLoadingUser,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        sendOtp,
        login,
        logout,
        syncCatalog,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};
