import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface CartItem {
  productId: string; name: string; price: number;
  shopId: string; shopName: string; quantity: number;
}

const AREAS = [
  'F-6','F-7','F-8','F-10','F-11',
  'G-6','G-7','G-8','G-9','G-10','G-11',
  'E-7','E-11','I-8','I-10',
  'Saddar','Aabpara','Commercial Market',
  'Raja Bazaar','Bahria','DHA',
];

const PAYMENT_OPTIONS = [
  { value: 'cod',           icon: '💵', label: 'Cash on Delivery' },
  { value: 'jazzcash',      icon: '📱', label: 'JazzCash' },
  { value: 'easypaisa',     icon: '📲', label: 'EasyPaisa' },
  { value: 'bank_transfer', icon: '🏦', label: 'Bank Transfer' },
];

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    if (saved.length === 0) navigate('/cart');
    setCart(saved);
  }, []);

  if (!user) { navigate('/login'); return null; }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const cartByShop = cart.reduce((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = { shopName: item.shopName, items: [] };
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { shopName: string; items: CartItem[] }>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      for (const [shopId, { items }] of Object.entries(cartByShop)) {
        await api.createOrder({
          shopId,
          products: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
          deliveryAddress: address,
          area,
          paymentMethod,
          notes,
        });
      }
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      <h1 className="page-title mb-lg">Checkout</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column */}
        <div className="flex-col gap-md">
          {/* Delivery */}
          <div className="card">
            <h3 className="section-title mb-md">Delivery Address</h3>
            <div className="form-group">
              <label className="form-label">Full address</label>
              <textarea
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="House No., Street, Colony..."
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area</label>
              <select className="form-control" value={area} onChange={(e) => setArea(e.target.value)} required>
                <option value="">Select your area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <h3 className="section-title mb-md">Payment Method</h3>
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`payment-option${paymentMethod === opt.value ? ' selected' : ''}`}
                onClick={() => setPaymentMethod(opt.value)}
              >
                <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} style={{ accentColor: 'var(--primary)' }} />
                <span className="payment-option-icon">{opt.icon}</span>
                <span className="payment-option-label">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="section-title mb-md">Order Notes <span className="text-muted fw-medium text-sm">(optional)</span></h3>
            <textarea
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special instructions for delivery..."
            />
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1rem)' }}>
          <h3 className="section-title mb-md">Order Summary</h3>

          {Object.entries(cartByShop).map(([shopId, { shopName, items }]) => (
            <div key={shopId} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div className="fw-medium text-sm mb-sm">🏪 {shopName}</div>
              {items.map(item => (
                <div key={item.productId} className="summary-row" style={{ paddingLeft: '0.25rem' }}>
                  <span className="text-muted">{item.quantity}× {item.name}</span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="summary-row">
            <span>Subtotal</span>
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

          {error && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
