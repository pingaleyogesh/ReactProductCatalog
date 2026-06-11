require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// Serve public assets directly from the server so image requests work in development.
app.use(express.static(path.join(__dirname, '../public')));

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || '465';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@siddhiaqua.shop';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pingaleyogesh@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.SERVER_PORT || 5000;

const transporter = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

if (!STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY in environment. Stripe payment will be disabled and only COD orders will work.');
}

if (!transporter || !FROM_EMAIL) {
  console.warn('SMTP is not fully configured. Email notifications will be disabled until SMTP_HOST, SMTP_USER, SMTP_PASS, and FROM_EMAIL are set.');
} else {
  transporter.verify((error) => {
    if (error) {
      console.warn('SMTP transporter verification failed:', error);
    } else {
      console.log('SMTP transporter is ready to send emails.');
    }
  });
}

const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

const buildEmailHtml = (order, paymentStatus) => {
  const totalAmount = order.totalAmount;
  const tax = Math.round(totalAmount * 0.18);
  const grandTotal = Math.round(totalAmount * 1.18);

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Order ${paymentStatus === 'paid' ? 'Confirmed' : 'Received'}: ${order.orderId}</h2>
      <p>Hi ${order.customerDetails.firstName},</p>
      <p>Thank you for shopping with us. Your order has been ${paymentStatus === 'paid' ? 'paid and confirmed' : 'received'}.</p>
      <h3>Order summary</h3>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li>${item.product.name} x ${item.quantity} = ₹${(
                item.product.price * item.quantity
              ).toLocaleString()}</li>`
          )
          .join('')}
      </ul>
      <p><strong>Subtotal:</strong> ₹${totalAmount.toLocaleString()}</p>
      <p><strong>Tax (18%):</strong> ₹${tax.toLocaleString()}</p>
      <p><strong>Total:</strong> ₹${grandTotal.toLocaleString()}</p>
      <h3>Shipping details</h3>
      <p>${order.customerDetails.address}</p>
      <p>${order.customerDetails.city}, ${order.customerDetails.state} - ${order.customerDetails.pincode}</p>
      <p>Email: ${order.customerDetails.email}</p>
      <p>Phone: ${order.customerDetails.phone}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod.replace(/_/g, ' ')}</p>
      <p>Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
      <p>Thanks for choosing our service.</p>
    </div>
  `;
};

const sendOrderEmail = async (order, status) => {
  if (!transporter || !FROM_EMAIL) {
    console.warn('SMTP configuration missing. Email not sent.');
    return;
  }

  const subject =
    status === 'paid'
      ? `Your order ${order.orderId} is confirmed`
      : `Order received: ${order.orderId}`;
  const html = buildEmailHtml(order, status);
  const text = `Order ${order.orderId} ${status === 'paid' ? 'is confirmed' : 'has been received'}. Total: ₹${Math.round(
    order.totalAmount * 1.18
  ).toLocaleString()}`;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: order.customerDetails.email,
    subject,
    text,
    html,
  });
};

const sendAdminNotification = async (order, eventType = 'New order placed') => {
  if (!transporter || !ADMIN_EMAIL || !FROM_EMAIL) {
    console.warn('SMTP or admin email configuration missing. Admin notification not sent.');
    return;
  }

  const subject = `${eventType}: ${order.orderId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>${eventType}</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customerDetails.firstName} ${order.customerDetails.lastName}</p>
      <p><strong>Email:</strong> ${order.customerDetails.email}</p>
      <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod.replace(/_/g, ' ')}</p>
      <p><strong>Total amount:</strong> ₹${order.totalAmount.toLocaleString()}</p>
      <ul>
        ${order.items
          .map(
            (item) =>
              `<li>${item.product.name} x ${item.quantity} = ₹${(
                item.product.price * item.quantity
              ).toLocaleString()}</li>`
          )
          .join('')}
      </ul>
      <p><strong>Shipping address:</strong></p>
      <p>${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} - ${order.customerDetails.pincode}</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
};

app.get('/api/products', (req, res) => {
  try {
    const products = db.getProducts();
    return res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return res.status(500).json({ error: 'Unable to fetch products.' });
  }
});

app.get('/api/products/:productId', (req, res) => {
  try {
    const product = db.getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return res.status(500).json({ error: 'Unable to fetch product.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.orderId) {
      return res.status(400).json({ error: 'Order payload is required.' });
    }

    if (order.paymentMethod === 'COD') {
      const storedOrder = db.createOrder(order);
      let emailSent = false;
      try {
        await sendOrderEmail(storedOrder, 'paid');
        emailSent = true;
        db.updateOrderEmailSent(storedOrder.orderId, true);
      } catch (emailError) {
            console.error('Email error:', emailError);
      }
      try {
        await sendAdminNotification(storedOrder, 'New COD order received');
      } catch (adminError) {
            console.error('Admin notification error:', adminError);
      }
      return res.json({ order: { ...storedOrder, emailSent } });
    }

    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY to enable online payments.',
      });
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
          description: item.product.description,
        },
        unit_amount: item.product.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: order.customerDetails.email,
      success_url: `${FRONTEND_URL}/#/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/#/payment`,
      metadata: {
        orderId: order.orderId,
      },
    });

    const pendingOrder = db.createOrder(order, session.id);
    try {
      await sendAdminNotification(pendingOrder, 'New payment order received');
    } catch (adminError) {
      console.error('Admin notification error:', adminError);
    }
    return res.json({ url: session.url, order: pendingOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    if (error.message.includes('Insufficient inventory')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unable to create order or payment session.' });
  }
});

app.get('/api/order-by-session/:sessionId', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Cannot resolve checkout session.',
      });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return res.status(404).json({ error: 'Order metadata not found for this session.' });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (session.payment_status === 'paid' && order.status !== 'CONFIRMED') {
      const updated = db.updateOrderStatus(orderId, 'CONFIRMED', false);
      try {
        await sendOrderEmail(updated, 'paid');
        db.updateOrderEmailSent(orderId, true);
      } catch (emailError) {
            console.error('Email error:', emailError);
      }
      try {
        await sendAdminNotification(updated, 'Payment order confirmed');
      } catch (adminError) {
            console.error('Admin notification error:', adminError);
      }
      return res.json({ order: db.getOrderById(orderId) });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Stripe session lookup error:', error);
    return res.status(500).json({ error: 'Unable to retrieve order from payment session.' });
  }
});

app.get('/api/orders/:orderId', (req, res) => {
  try {
    const order = db.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json({ order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return res.status(500).json({ error: 'Unable to fetch order.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
