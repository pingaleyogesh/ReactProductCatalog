const db = require('./db');

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  // Handle POST /api/orders
  if (httpMethod === 'POST' && path === '/.netlify/functions/orders') {
    try {
      const { order } = JSON.parse(body || '{}');
      if (!order || !order.orderId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Order payload is required.' }),
        };
      }

      if (order.paymentMethod === 'COD') {
        const storedOrder = db.createOrder(order);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: { ...storedOrder, emailSent: true } }),
        };
      }

      // For non-COD payments, you would integrate with Stripe here
      // For now, just create a pending order
      const storedOrder = db.createOrder(order);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: storedOrder }),
      };
    } catch (error) {
      console.error('Order creation error:', error);
      if (error.message.includes('Insufficient inventory')) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error.message }),
        };
      }
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to create order.' }),
      };
    }
  }

  // Handle GET /api/orders/:orderId
  const orderIdMatch = path.match(/\/orders\/([^/]+)$/);
  if (httpMethod === 'GET' && orderIdMatch) {
    try {
      const orderId = orderIdMatch[1];
      const order = db.getOrderById(orderId);
      if (!order) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Order not found.' }),
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      };
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to fetch order.' }),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
};
