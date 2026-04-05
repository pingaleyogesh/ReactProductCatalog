// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inventory: number;
  filtrationCapacity: string;
  warranty: string;
}

// Cart Item Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Payment Types
export type PaymentMethod = 'UPI' | 'COD' | 'NET_BANKING' | 'WALLET';

// Order Types
export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerDetails: CustomerDetails;
  orderDate: string;
  estimatedDelivery: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
}

// Shopping Context Types
export interface ShoppingContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  submitOrder: (order: Order) => void;
  getCartTotal: () => number;
}
