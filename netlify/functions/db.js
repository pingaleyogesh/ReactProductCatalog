const path = require('path');
const fs = require('fs');

// Use /tmp for serverless functions (Netlify runtime)
// Fall back to data.json in project root if running locally
const getDbPath = () => {
  // In Netlify Functions, use /tmp
  if (process.env.NETLIFY) {
    return path.join('/tmp', 'orders.json');
  }
  // Local development
  return path.join(__dirname, '../../server/data.json');
};

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

let db = { products: initialProducts, orders: [] };

const loadDb = () => {
  try {
    const dbPath = getDbPath();
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(data);
    } else {
      db = { products: initialProducts, orders: [] };
      saveDb();
    }
  } catch (error) {
    console.error('Error loading db:', error);
    db = { products: initialProducts, orders: [] };
  }
};

const saveDb = () => {
  try {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving db:', error);
  }
};

loadDb();

module.exports = {
  getProducts: () => {
    loadDb();
    return db.products;
  },
  getProductById: (id) => {
    loadDb();
    return db.products.find((product) => product.id === id) || null;
  },
  getOrderById: (orderId) => {
    loadDb();
    return db.orders.find((order) => order.orderId === orderId) || null;
  },
  getOrderBySessionId: (sessionId) => {
    loadDb();
    return db.orders.find((order) => order.stripeSessionId === sessionId) || null;
  },
  createOrder: (order, stripeSessionId = null) => {
    loadDb();
    
    if (module.exports.getOrderById(order.orderId)) {
      throw new Error(`Order already exists: ${order.orderId}`);
    }

    order.items.forEach((item) => {
      const product = module.exports.getProductById(item.product.id);
      if (!product) {
        throw new Error(`Product not found: ${item.product.id}`);
      }
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }
    });

    order.items.forEach((item) => {
      const product = module.exports.getProductById(item.product.id);
      product.inventory -= item.quantity;
    });

    const storedOrder = {
      ...order,
      status: order.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
      emailSent: true,
      stripeSessionId,
    };

    db.orders.push(storedOrder);
    saveDb();

    return storedOrder;
  },
  updateOrderStatus: (orderId, status, emailSent = false) => {
    loadDb();
    const order = module.exports.getOrderById(orderId);
    if (!order) {
      return null;
    }
    order.status = status;
    order.emailSent = emailSent;
    saveDb();
    return order;
  },
  updateOrderEmailSent: (orderId, emailSent = true) => {
    loadDb();
    const order = module.exports.getOrderById(orderId);
    if (!order) {
      return null;
    }
    order.emailSent = emailSent;
    saveDb();
    return order;
  },
};
