require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve public assets (images, favicon, etc.) so the CRA dev proxy can fetch them
app.use(express.static(path.join(__dirname, '../public')));

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.SERVER_PORT || 5000;

const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

if (!STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY in environment. Stripe payment will be disabled and only COD orders will work.');
}

if (!SENDGRID_API_KEY || !FROM_EMAIL) {
  console.warn('SendGrid is not fully configured. Email notifications will be disabled until SENDGRID_API_KEY and FROM_EMAIL are set.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const orders = new Map();

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
  if (!SENDGRID_API_KEY || !FROM_EMAIL) {
    console.warn('SendGrid configuration missing. Email not sent.');
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

  await sgMail.send({
    to: order.customerDetails.email,
    from: FROM_EMAIL,
    subject,
    text,
    html,
  });
};

const storeOrder = (order) => {
  const storedOrder = {
    ...order,
    status: order.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
    emailSent: order.paymentMethod === 'COD',
  };

  orders.set(order.orderId, storedOrder);
  return storedOrder;
};

app.post('/api/orders', async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.orderId) {
      return res.status(400).json({ error: 'Order payload is required.' });
    }

    const storedOrder = storeOrder(order);

    if (order.paymentMethod === 'COD') {
      try {
        await sendOrderEmail(storedOrder, 'paid');
      } catch (emailError) {
        console.error('SendGrid email error:', emailError);
      }

      return res.json({ order: storedOrder });
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

    const pendingOrder = {
      ...storedOrder,
      stripeSessionId: session.id,
      status: 'PENDING',
      emailSent: false,
    };

    orders.set(order.orderId, pendingOrder);
    return res.json({ url: session.url });
  } catch (error) {
    console.error('Order creation error:', error);
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

    const order = orders.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (session.payment_status === 'paid' && order.status !== 'CONFIRMED') {
      order.status = 'CONFIRMED';
      try {
        await sendOrderEmail(order, 'paid');
        order.emailSent = true;
      } catch (emailError) {
        console.error('SendGrid email error:', emailError);
      }
    }

    return res.json({ order });
  } catch (error) {
    console.error('Stripe session lookup error:', error);
    return res.status(500).json({ error: 'Unable to retrieve order from payment session.' });
  }
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  return res.json({ order });
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
