import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Order } from '../types/index';
import '../styles/OrderConfirmation.css';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order;

  if (!order) {
    return (
      <div className="confirmation-container">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>Unable to load order details.</p>
          <button onClick={() => navigate('/')} className="home-btn">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const total = Math.round(order.totalAmount * 1.18);
  const tax = Math.round(order.totalAmount * 0.18);
  const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>

        <div className="order-id-section">
          <h2>Order ID</h2>
          <div className="order-id-box">
            <code>{order.orderId}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.orderId);
                alert('Order ID copied to clipboard!');
              }}
              className="copy-btn"
              title="Copy Order ID"
            >
              📋
            </button>
          </div>
        </div>

        <div className="order-details">
          <h2>Order Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Order Date</span>
              <span className="value">
                {new Date(order.orderDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Estimated Delivery</span>
              <span className="value">{deliveryDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value status">{order.status}</span>
            </div>
            <div className="detail-item">
              <span className="label">Payment Method</span>
              <span className="value">{order.paymentMethod.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="customer-details">
          <h2>Delivery Address</h2>
          <div className="address-box">
            <p>
              <strong>
                {order.customerDetails.firstName} {order.customerDetails.lastName}
              </strong>
            </p>
            <p>{order.customerDetails.address}</p>
            <p>
              {order.customerDetails.city}, {order.customerDetails.state} -{' '}
              {order.customerDetails.pincode}
            </p>
            <p>Email: {order.customerDetails.email}</p>
            <p>Phone: {order.customerDetails.phone}</p>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Items Ordered</h2>
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.product.price.toLocaleString()}</td>
                    <td>₹{(item.product.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="confirmation-message">
          <p>
            A confirmation email has been sent to <strong>{order.customerDetails.email}</strong>
          </p>
          <p>You will receive updates on your order via SMS and email.</p>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate('/')} className="shop-more-btn">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/order-tracking')} className="track-btn">
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
