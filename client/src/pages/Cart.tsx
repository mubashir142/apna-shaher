import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  shopId: string;
  shopName: string;
  quantity: number;
  image?: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const save = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQty = (productId: string, delta: number) => {
    save(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const remove = (productId: string) => {
    save(cart.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const cartByShop = cart.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = { shopName: item.shopName, items: [] };
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopName: string; items: CartItem[] }>);

  if (cart.length === 0) return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 3rem)', maxWidth: '500px' }}>
      <div className="empty-state card">
        <div className="empty-state-icon">🛒</div>
        <p style={{ marginBottom: '1.25rem' }}>Your cart is empty</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      <h1 className="page-title mb-lg">Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Items */}
        <div className="flex-col gap-md">
          {Object.entries(cartByShop).map(([shopId, { shopName, items }]) => (
            <div key={shopId} className="card">
              <div className="flex items-center gap-sm mb-md" style={{ paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.1rem' }}>🏪</span>
                <span className="fw-semibold">{shopName}</span>
              </div>

              <div className="flex-col" style={{ gap: '0.875rem' }}>
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-md items-center">
                    <div style={{
                      width: '72px', height: '72px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--bg-2)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid var(--border)',
                    }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>📦</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="fw-medium" style={{ marginBottom: '0.25rem' }}>{item.name}</div>
                      <div className="product-price text-sm">Rs. {item.price.toLocaleString()}</div>
                    </div>

                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateQty(item.productId, -1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.productId, 1)}>+</button>
                    </div>

                    <div className="text-right" style={{ minWidth: '80px' }}>
                      <div className="fw-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-sm"
                        style={{ color: 'var(--danger)', background: 'none', marginTop: '0.25rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
          <h3 className="section-title mb-md">Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.length} items)</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className="badge badge-success">Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            {user ? (
              <Link to="/checkout" className="btn btn-primary btn-full btn-lg" style={{ textAlign: 'center', display: 'block' }}>
                Proceed to Checkout
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ textAlign: 'center', display: 'block' }}>
                Login to Checkout
              </Link>
            )}
            <Link to="/" className="btn btn-ghost btn-full" style={{ marginTop: '0.625rem', textAlign: 'center', display: 'block' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
