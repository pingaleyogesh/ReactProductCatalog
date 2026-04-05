import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShoppingContext } from '../context/ShoppingContext';
import { CustomerDetails, PaymentMethod } from '../types/index';
import '../styles/OrderSubmission.css';

const OrderSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, submitOrder } = useShoppingContext();
  const paymentMethod = (location.state?.paymentMethod as PaymentMethod) || 'COD';

  const [formData, setFormData] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof CustomerDetails]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    const total = getCartTotal();

    const order = {
      orderId,
      customerId: `CUST-${Date.now()}`,
      items: cart,
      totalAmount: total,
      paymentMethod,
      customerDetails: formData,
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING' as const,
    };

    submitOrder(order);

    navigate('/order-confirmation', { state: { order } });
  };

  return (
    <div className="order-submission-container">
      <header className="submission-header">
        <button onClick={() => navigate('/payment')} className="back-btn">
          ← Back to Payment
        </button>
        <h1>Order Submission</h1>
      </header>

      <div className="submission-content">
        <form onSubmit={handleSubmit} className="customer-form">
          <h2>Personal Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="10 digit number"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>

          <h2>Address Details</h2>
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              rows={3}
              placeholder="House No., Building Name, Street Name"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
              />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={errors.pincode ? 'error' : ''}
                placeholder="6 digit code"
              />
              {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>
          </div>

          <div className="submission-actions">
            <button type="button" onClick={() => navigate('/payment')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Place Order
            </button>
          </div>
        </form>

        <div className="order-summary-sidebar">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.map((item) => (
              <div key={item.product.id} className="summary-item">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{getCartTotal().toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%):</span>
              <span>₹{Math.round(getCartTotal() * 0.18).toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span>₹{Math.round(getCartTotal() * 1.18).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{paymentMethod.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSubmissionPage;
