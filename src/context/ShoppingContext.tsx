import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product, CartItem, Order, ShoppingContextType } from '../types/index';

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

// Mock product data - replace with API calls later
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'AquaPure 5000',
    description: 'Advanced RO technology with 5-stage filtration',
    price: 15999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+5000',
    inventory: 25,
    filtrationCapacity: '100 GPD',
    warranty: '5 years',
  },
  {
    id: '2',
    name: 'AquaPure 8000',
    description: 'Premium RO+UV with advanced minerals addition',
    price: 24999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+8000',
    inventory: 15,
    filtrationCapacity: '150 GPD',
    warranty: '7 years',
  },
  {
    id: '3',
    name: 'AquaPure Basic',
    description: 'Entry-level water purifier with 3-stage filtration',
    price: 8999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+Basic',
    inventory: 40,
    filtrationCapacity: '50 GPD',
    warranty: '3 years',
  },
  {
    id: '4',
    name: 'AquaPure Pro',
    description: 'Commercial grade with smart monitoring',
    price: 32999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+Pro',
    inventory: 8,
    filtrationCapacity: '200 GPD',
    warranty: '10 years',
  },
  {
    id: '5',
    name: 'AquaPure Portable',
    description: 'Compact portable purifier for travel',
    price: 2999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+Portable',
    inventory: 50,
    filtrationCapacity: '5 GPD',
    warranty: '1 year',
  },
  {
    id: '6',
    name: 'AquaPure Ultra',
    description: 'All-in-one water treatment solution',
    price: 45999,
    image: 'https://via.placeholder.com/300x300?text=AquaPure+Ultra',
    inventory: 5,
    filtrationCapacity: '300 GPD',
    warranty: '15 years',
  },
];

export const ShoppingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const submitOrder = (order: Order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
    clearCart();
  };

  const value: ShoppingContextType = {
    products,
    cart,
    orders,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    submitOrder,
    getCartTotal,
  };

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
};

export const useShoppingContext = (): ShoppingContextType => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingContext must be used within a ShoppingProvider');
  }
  return context;
};
