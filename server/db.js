const path = require('path');
const { LowSync } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');

const dbPath = path.join(__dirname, 'data.json');
const adapter = new JSONFileSync(dbPath);
const db = new LowSync(adapter, { defaultData: { products: [], orders: [] } });

db.read();

const initialProducts = [
  {
    id: '1',
    name: 'Purosis AQUAPURO 9 L RO + UV + UF + Alkaline Water Purifier',
    description: 'Advanced RO technology with 5-stage filtration',
    price: 10999,
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
    price: 11500,
    image: '/Fighter P & A 7 L RO + UV + UF Water Purifier.jpg',
    inventory: 20,
    filtrationCapacity: '100 GPD',
    warranty: '2 years',
  },
  {
    id: '4',
    name: 'aquayash-smart-water-purifier smart plus',
    description: 'RO + UV + UF + Alkaline Water Purifier',
    price: 10500,
    image: '/aquayash water purifier smart plus.jpg',
    inventory: 8,
    filtrationCapacity: '800 GPD',
    warranty: '1 years',
  },
  {
    id: '5',
    name: 'Annual Service and Maintenance',
    description: 'Service and maintenance for 1 year',
    price: 2999,
    image: '/RO-AMC.jpg',
    inventory: 50,
    filtrationCapacity: 'N/A',
    warranty: '1 year',
  },
  {
    id: '6',
    name: 'UTC P&A Fighter 7 L RO + UV + UF Water Purifier',
    description: 'All-in-one water treatment solution',
    price: 12900,
    image: '/UTC P&A Fighter.jpg',
    inventory: 5,
    filtrationCapacity: '500 GPD',
    warranty: '1 years',
  },
];

const init = () => {
  if (!Array.isArray(db.data.products)) {
    db.data.products = [];
  }
  if (!Array.isArray(db.data.orders)) {
    db.data.orders = [];
  }

  if (db.data.products.length === 0) {
    db.data.products = initialProducts;
    db.write();
  }
};

const getProducts = () => db.data.products;

const getProductById = (id) => db.data.products.find((product) => product.id === id) || null;

const getOrderById = (orderId) => db.data.orders.find((order) => order.orderId === orderId) || null;

const getOrderBySessionId = (sessionId) =>
  db.data.orders.find((order) => order.stripeSessionId === sessionId) || null;

const createOrder = (order, stripeSessionId = null) => {
  if (getOrderById(order.orderId)) {
    throw new Error(`Order already exists: ${order.orderId}`);
  }

  order.items.forEach((item) => {
    const product = getProductById(item.product.id);
    if (!product) {
      throw new Error(`Product not found: ${item.product.id}`);
    }
    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient inventory for ${product.name}`);
    }
  });

  order.items.forEach((item) => {
    const product = getProductById(item.product.id);
    product.inventory -= item.quantity;
  });

  const storedOrder = {
    ...order,
    status: order.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
    emailSent: false,
    stripeSessionId,
  };

  db.data.orders.push(storedOrder);
  db.write();

  return storedOrder;
};

const updateOrderStatus = (orderId, status, emailSent = false) => {
  const order = getOrderById(orderId);
  if (!order) {
    return null;
  }
  order.status = status;
  order.emailSent = emailSent;
  db.write();
  return order;
};

const updateOrderEmailSent = (orderId, emailSent = true) => {
  const order = getOrderById(orderId);
  if (!order) {
    return null;
  }
  order.emailSent = emailSent;
  db.write();
  return order;
};

init();

module.exports = {
  getProducts,
  getProductById,
  getOrderById,
  getOrderBySessionId,
  createOrder,
  updateOrderStatus,
  updateOrderEmailSent,
};
