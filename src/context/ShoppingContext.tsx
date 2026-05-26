import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product, CartItem, Order, ShoppingContextType } from '../types/index';

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

// Mock product data - replace with API calls later
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Purosis AQUAPURO 9 L RO + UV + UF + Alkaline Water Purifier',
    description: 'Advanced RO technology with 5-stage filtration',
    price: 10500,
    image: '/Purosis AQUAPURO 9 L RO + UV + UF + Alkaline Water Purifier.jpg',
    inventory: 25,
    filtrationCapacity: '100 GPD',
    warranty: '2 years',
  },
  {
    id: '2',
    name: 'Aquadfresh Ro water Purifier with copper Technology 12 L RO + UV + UF + TDS Control Water Purifier',
    description: 'Premium RO+UV with advanced minerals addition',
    price: 6900,
    image: '/Aquadfresh Ro water Purifier with copper Technology 12 L RO + UV + UF + TDS Control Water Purifier.webp',
    inventory: 15,
    filtrationCapacity: '150 GPD',
    warranty: '2 years',
  },
  {
    id: '3',
    name: 'Fighter P & A 7 L RO + UV + UF Water Purifier',
    description: 'Entry-level water purifier with 3-stage filtration',
    price: 12999,
    image: '/Fighter P & A 7 L RO + UV + UF Water Purifier.jpg',
    inventory: 20,
    filtrationCapacity: '100 GPD',
    warranty: '2 years',
  },
  {
    id: '4',
    name: 'aquayash-smart-water-purifier smart plus ',
    description: 'RO + UV + UF + Alkaline Water Purifier',
    price: 11500,
    image: '/aquayash-smart-water-purifier smart plus 1.jpg',
    inventory: 8,
    filtrationCapacity: '800 GPD',
    warranty: '1 years',
  },
  {
    id: '5',
    name: 'Annual Service and Maintenance',
    description: 'Service and maintenance for 1 year',
    price: 3999,
    image: '/RO-AMC.jpg',
    inventory: 50,
    filtrationCapacity: 'N/A',
    warranty: '1 year',
  },
  {
    id: '6',
    name: 'UTC P&A Fighter 7 L RO + UV + UF Water Purifier',
    description: 'All-in-one water treatment solution',
    price: 15000,
    image: '/UTC P&A Fighter.jpg',
    inventory: 5,
    filtrationCapacity: '500 GPD',
    warranty: '1 years',
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
