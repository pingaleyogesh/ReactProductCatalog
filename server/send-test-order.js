const fetch = globalThis.fetch || require('node-fetch');

async function sendOrder() {
  const order = {
    order: {
      orderId: `test-order-${Date.now()}`,
      items: [{ product: { id: '1' }, quantity: 1 }],
      customerDetails: {
        firstName: 'QA',
        lastName: 'Tester',
        email: 'qa.tester@example.com',
        phone: '9999999999',
        address: '123 Test Lane',
        city: 'Testville',
        state: 'TestState',
        pincode: '560001',
      },
      paymentMethod: 'COD',
      totalAmount: 10999,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };

  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

sendOrder();
