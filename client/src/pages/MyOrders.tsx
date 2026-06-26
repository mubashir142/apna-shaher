import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STATUS_CLASS: Record<string, string> = {
  pending:    'badge-warning',
  confirmed:  'badge-primary',
  processing: 'badge-primary',
  shipped:    'badge-primary',
  delivered:  'badge-success',
  cancelled:  'badge-danger',
};

const STATUS_LABEL: Record<string, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="page flex-center" style={{ minHeight: '60vh' }}>
      <span className="text-muted">Loading orders...</span>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', maxWidth: '760px' }}>
      <div className="flex-between mb-lg">
        <h1 className="page-title">My Orders</h1>
        <Link to="/" className="btn btn-secondary btn-sm">Continue Shopping</Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📦</div>
          <p style={{ marginBottom: '1.25rem' }}>You haven't placed any orders yet</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="flex-col gap-md">
          {orders.map(order => {
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Order header — always visible */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '1.25rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div className="flex-between flex-wrap gap-md">
                    <div>
                      <div className="flex items-center gap-sm mb-sm">
                        <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                          Order #{order._id.slice(-10).toUpperCase()}
                        </span>
                        <span className={`badge ${STATUS_CLASS[order.status] || 'badge-gray'}`}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>
                      <div className="flex gap-md flex-wrap">
                        <span className="text-sm text-muted">
                          🏪 {order.shopId?.name || 'Shop'}
                        </span>
                        <span className="text-sm text-muted">
                          📅 {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-sm text-muted">
                          💳 {order.paymentMethod.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-md">
                      <div className="text-right">
                        <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                          Rs. {order.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted">{order.products.length} item(s)</div>
                      </div>
                      <span style={{ color: 'var(--text-4)', fontSize: '1.25rem', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        ⌄
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem', background: 'var(--bg)' }}>
                    {/* Products list */}
                    <div className="mb-md">
                      <div className="text-sm fw-semibold text-muted mb-sm">Items</div>
                      {order.products.map((p: any, i: number) => (
                        <div key={i} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                          <span className="text-sm">{p.quantity}× {p.name}</span>
                          <span className="text-sm fw-medium">Rs. {(p.price * p.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex-between" style={{ paddingTop: '0.625rem' }}>
                        <span className="fw-semibold text-sm">Total</span>
                        <span className="fw-bold" style={{ color: 'var(--primary)' }}>Rs. {order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', border: '1px solid var(--border)' }}>
                      <div className="text-sm fw-semibold text-muted mb-sm">Delivery Details</div>
                      <div className="text-sm" style={{ lineHeight: 1.8 }}>
                        <div>📍 {order.deliveryAddress}</div>
                        <div>🗺️ Area: {order.area}</div>
                        {order.notes && <div>📝 {order.notes}</div>}
                      </div>
                    </div>

                    {/* Status timeline */}
                    <div style={{ marginTop: '1rem' }}>
                      <div className="text-sm fw-semibold text-muted mb-sm">Status</div>
                      <div className="flex gap-xs flex-wrap">
                        {['pending','confirmed','processing','shipped','delivered'].map((s, i) => {
                          const statuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
                          const currentIdx = statuses.indexOf(order.status);
                          const stepIdx = statuses.indexOf(s);
                          const done = order.status !== 'cancelled' && stepIdx <= currentIdx;
                          const active = s === order.status;
                          return (
                            <div key={s} className="flex items-center gap-xs">
                              <span style={{
                                padding: '0.2rem 0.625rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: active ? 700 : 500,
                                background: active ? 'var(--primary)' : done ? 'var(--success-light)' : 'var(--bg-2)',
                                color: active ? 'white' : done ? 'var(--success)' : 'var(--text-4)',
                                border: `1px solid ${active ? 'var(--primary)' : done ? 'var(--success-border)' : 'var(--border)'}`,
                              }}>
                                {STATUS_LABEL[s]}
                              </span>
                              {i < 4 && <span style={{ color: 'var(--border-2)', fontSize: '0.75rem' }}>›</span>}
                            </div>
                          );
                        })}
                        {order.status === 'cancelled' && (
                          <span className="badge badge-danger">Cancelled</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
