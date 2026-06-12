const db = require('./db');

exports.handler = async (event, context) => {
  const { httpMethod, path } = event;

  // Handle GET /api/products
  if (httpMethod === 'GET' && path === '/.netlify/functions/products') {
    try {
      const products = db.getProducts();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to fetch products.' }),
      };
    }
  }

  // Handle GET /api/products/:id
  const productIdMatch = path.match(/\/products\/([^/]+)$/);
  if (httpMethod === 'GET' && productIdMatch) {
    try {
      const productId = productIdMatch[1];
      const product = db.getProductById(productId);
      if (!product) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Product not found.' }),
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      };
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to fetch product.' }),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not Found' }),
  };
};
