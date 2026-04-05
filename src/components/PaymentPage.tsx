import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod } from '../types/index';
import '../styles/PaymentPage.css';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const paymentMethods: { method: PaymentMethod; label: string; description: string; icon: string }[] = [
    {
      method: 'UPI',
      label: 'UPI',
      description: 'Pay using Google Pay, PhonePe, or BHIM',
      icon: '📱',
    },
    {
      method: 'COD',
      label: 'Cash on Delivery',
      description: 'Pay when the product is delivered',
      icon: '💵',
    },
    {
      method: 'NET_BANKING',
      label: 'Net Banking',
      description: 'Pay directly from your bank account',
      icon: '🏦',
    },
    {
      method: 'WALLET',
      label: 'Digital Wallet',
      description: 'Use your stored wallet balance',
      icon: '💳',
    },
  ];

  const handleContinue = () => {
    if (selectedPayment) {
      navigate('/order-submission', { state: { paymentMethod: selectedPayment } });
    } else {
      alert('Please select a payment method');
    }
  };

  return (
    <div className="payment-container">
      <header className="payment-header">
        <button onClick={() => navigate('/cart')} className="back-btn">
          ← Back to Cart
        </button>
        <h1>Select Payment Method</h1>
      </header>

      <div className="payment-methods-grid">
        {paymentMethods.map((pm) => (
          <div
            key={pm.method}
            className={`payment-card ${selectedPayment === pm.method ? 'selected' : ''}`}
            onClick={() => setSelectedPayment(pm.method)}
          >
            <div className="payment-icon">{pm.icon}</div>
            <h3>{pm.label}</h3>
            <p>{pm.description}</p>
            <input
              type="radio"
              name="payment"
              value={pm.method}
              checked={selectedPayment === pm.method}
              onChange={() => setSelectedPayment(pm.method)}
            />
          </div>
        ))}
      </div>

      <div className="payment-actions">
        <button onClick={() => navigate('/cart')} className="cancel-btn">
          Cancel
        </button>
        <button onClick={handleContinue} className="continue-btn">
          Continue
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
