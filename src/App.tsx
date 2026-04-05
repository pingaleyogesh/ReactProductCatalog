import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ShoppingProvider } from './context/ShoppingContext';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage';
import OrderSubmissionPage from './components/OrderSubmissionPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import './App.css';

function App() {
  return (
    <ShoppingProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-submission" element={<OrderSubmissionPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="*" element={<ProductPage />} />
          </Routes>
        </div>
      </Router>
    </ShoppingProvider>
  );
}

export default App;
