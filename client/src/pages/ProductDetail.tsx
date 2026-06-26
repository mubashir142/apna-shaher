import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();

  useEffect(() => { loadProduct(); }, [id]);

  const loadProduct = async () => {
    try {
      const data = await api.getProductById(id!);
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.productId === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        shopId: product.shopId._id,
        shopName: product.shopId.name,
        quantity,
        image: product.images?.[0],
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="page flex-center" style={{ minHeight: '60vh' }}>
      <span className="text-muted">Loading...</span>
    </div>
  );
  if (!product) return (
    <div className="page flex-center" style={{ minHeight: '60vh' }}>
      <span className="text-muted">Product not found</span>
    </div>
  );

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      <Link to={`/shop/${product.shopId._id}`} className="text-sm text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
        ← Back to {product.shopId.name}
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Image */}
        <div style={{
          background: 'var(--bg-2)',
          borderRadius: 'var(--radius-xl)',
          height: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '5rem', opacity: 0.3 }}>📦</span>}
        </div>

        {/* Details */}
        <div className="flex-col gap-md">
          <div>
            <span className="badge badge-gray mb-sm">{product.category}</span>
            <h1 className="page-title" style={{ lineHeight: 1.3, marginBottom: '0.75rem' }}>{product.name}</h1>

            {product.description && (
              <p className="text-muted" style={{ lineHeight: 1.7 }}>{product.description}</p>
            )}
          </div>

          {/* Price */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="flex items-center gap-md">
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{ color: 'var(--text-4)', textDecoration: 'line-through', fontSize: '1.125rem' }}>
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="badge badge-danger">{discount}% off</span>
                </>
              )}
            </div>
            <div className="mt-sm">
              {product.stock > 0
                ? <span className="badge badge-success">✓ In Stock ({product.stock} available)</span>
                : <span className="badge badge-danger">Out of Stock</span>}
            </div>
          </div>

          {/* Shop info */}
          <div className="flex items-center gap-sm" style={{ padding: '0.75rem 1rem', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1.25rem' }}>🏪</span>
            <div>
              <div className="fw-medium text-sm">{product.shopId.name}</div>
              {product.shopId.isVerified && <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>Verified</span>}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex-col gap-sm">
              <div className="flex items-center gap-md">
                <label className="fw-medium text-sm">Quantity</label>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="qty-num">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
                <span className="text-sm text-muted">
                  Total: <strong style={{ color: 'var(--primary)' }}>Rs. {(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>

              {user ? (
                <button
                  onClick={addToCart}
                  className={`btn btn-lg btn-full ${added ? 'btn-success' : 'btn-primary'}`}
                >
                  {added ? '✓ Added to Cart!' : 'Add to Cart'}
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg btn-full" style={{ textAlign: 'center' }}>
                  Login to Buy
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
