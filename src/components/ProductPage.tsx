import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingContext } from '../context/ShoppingContext';
import '../styles/ProductPage.css';

const ProductPage: React.FC = () => {
  const { products, addToCart } = useShoppingContext();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities({
      ...quantities,
      [productId]: value,
    });
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const quantity = quantities[productId] || 1;

    if (product && quantity > 0) {
      addToCart(product, quantity);
      alert(`${product.name} added to cart!`);
      setQuantities({ ...quantities, [productId]: 1 });
    }
  };

  return (
    <div className="products-container">
      <header className="products-header">
        <h1>Water Purifiers</h1>
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          🛒 Go to Cart
        </button>
      </header>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="description">{product.description}</p>
              <div className="specs">
                <p><strong>Capacity:</strong> {product.filtrationCapacity}</p>
                <p><strong>Warranty:</strong> {product.warranty}</p>
                <p><strong>In Stock:</strong> {product.inventory} units</p>
              </div>
              <div className="price">₹{product.price.toLocaleString()}</div>

              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor={`qty-${product.id}`}>Qty:</label>
                  <input
                    id={`qty-${product.id}`}
                    type="number"
                    min="1"
                    max={product.inventory}
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <button
                  className="add-btn"
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.inventory === 0}
                >
                  {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
