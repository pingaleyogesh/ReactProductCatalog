import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingContext } from '../context/ShoppingContext';
import '../styles/CartPage.css';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useShoppingContext();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="cart-container">
      <header className="cart-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Products
        </button>
        <h1>Shopping Cart</h1>
      </header>

      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.product.id} className="cart-item-row">
                  <td>
                    <div className="product-info">
                      <img src={item.product.image} alt={item.product.name} width={50} />
                      <span>{item.product.name}</span>
                    </div>
                  </td>
                  <td>₹{item.product.price.toLocaleString()}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.product.inventory}
                      value={item.quantity}
                      onChange={(e) =>
                        updateCartQuantity(item.product.id, parseInt(e.target.value) || 1)
                      }
                      className="qty-input"
                    />
                  </td>
                  <td>₹{(item.product.price * item.quantity).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-summary">
          <h2>Cart Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%):</span>
            <span>₹{Math.round(total * 0.18).toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{Math.round(total * 1.18).toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate('/payment')}
            className="checkout-btn"
          >
            Proceed to Payment
          </button>
          <button
            onClick={() => navigate('/')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
