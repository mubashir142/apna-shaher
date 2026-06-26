import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary',
  shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<'overview' | 'shops' | 'orders'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionEdits, setCommissionEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, sh, or] = await Promise.all([api.getAdminStats(), api.getAdminShops(), api.getAdminOrders()]);
      setStats(s); setShops(sh); setOrders(or);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (shopId: string, isVerified: boolean) => {
    try {
      await api.verifyShop(shopId);
      setShops(shops.map(s => s._id === shopId ? { ...s, isVerified } : s));
      toast.success(isVerified ? 'Shop verified!' : 'Shop unverified');
    } catch { toast.error('Failed to update shop'); }
  };

  const handleCommission = async (shopId: string) => {
    const rate = Number(commissionEdits[shopId]);
    if (!rate || rate < 0 || rate > 100) return toast.warning('Enter a valid rate (0–100)');
    try {
      await fetch(`/api/admin/shops/${shopId}/commission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ commissionRate: rate }),
      });
      setShops(shops.map(s => s._id === shopId ? { ...s, commissionRate: rate } : s));
      setCommissionEdits(prev => { const n = { ...prev }; delete n[shopId]; return n; });
      toast.success('Commission rate updated');
    } catch { toast.error('Failed to update commission'); }
  };

  if (loading) return <div className="page flex-center" style={{ minHeight: '60vh' }}><span className="text-muted">Loading...</span></div>;

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      <div className="mb-lg">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-muted">ApnaShehar control panel</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'shops',    label: `Shops (${shops.length})` },
          { key: 'orders',   label: `Orders (${orders.length})` },
        ] as const).map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div>
          <div className="grid grid-stats mb-lg">
            {[
              { label: 'Total Shops',       value: stats.totalShops,                    sub: `${stats.verifiedShops} verified` },
              { label: 'Total Products',    value: stats.totalProducts,                 sub: '' },
              { label: 'Total Orders',      value: stats.totalOrders,                   sub: '' },
              { label: 'Total Users',       value: stats.totalUsers,                    sub: '' },
              { label: 'Revenue',           value: `Rs. ${stats.totalRevenue.toLocaleString()}`,            sub: '' },
              { label: 'Commission Earned', value: `Rs. ${Math.round(stats.totalCommission).toLocaleString()}`, sub: '' },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
                {c.sub && <div className="stat-sub">{c.sub}</div>}
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="section-title mb-md">Pending Verifications</h3>
            {shops.filter(s => !s.isVerified).length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <div className="empty-state-icon" style={{ fontSize: '1.5rem' }}>✓</div>
                <p>All shops are verified</p>
              </div>
            ) : (
              shops.filter(s => !s.isVerified).map(shop => (
                <div key={shop._id} className="flex-between flex-wrap gap-md" style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div className="fw-semibold">{shop.name}</div>
                    <div className="text-sm text-muted">{shop.area}, {shop.city} · {shop.sellerId?.email}</div>
                  </div>
                  <button onClick={() => handleVerify(shop._id, true)} className="btn btn-success btn-sm">Verify Shop</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Shops */}
      {tab === 'shops' && (
        <div className="flex-col gap-md">
          {shops.length === 0 && <div className="empty-state card"><p>No shops yet</p></div>}
          {shops.map(shop => (
            <div key={shop._id} className="card">
              <div className="flex-between flex-wrap gap-md">
                <div>
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="card-title">{shop.name}</span>
                    <span className={`badge ${shop.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {shop.isVerified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-sm text-muted">📍 {shop.area}, {shop.city}</div>
                  <div className="text-sm text-muted">👤 {shop.sellerId?.name} · {shop.sellerId?.email}</div>
                  <div className="text-sm text-muted">📞 {shop.phone}</div>
                </div>

                <div className="flex-col gap-sm items-start">
                  <button
                    onClick={() => handleVerify(shop._id, !shop.isVerified)}
                    className={`btn btn-sm ${shop.isVerified ? 'btn-danger' : 'btn-success'}`}
                  >
                    {shop.isVerified ? 'Unverify' : 'Verify'}
                  </button>

                  <div className="flex items-center gap-sm">
                    <span className="text-sm text-muted">Commission:</span>
                    <input
                      type="number" min="0" max="100"
                      value={commissionEdits[shop._id] ?? shop.commissionRate}
                      onChange={e => setCommissionEdits(prev => ({ ...prev, [shop._id]: e.target.value }))}
                      style={{ width: '56px', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}
                    />
                    <span className="text-sm">%</span>
                    {commissionEdits[shop._id] !== undefined && (
                      <button onClick={() => handleCommission(shop._id)} className="btn btn-primary btn-sm">Save</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="flex-col gap-md">
          {orders.length === 0 && <div className="empty-state card"><p>No orders yet</p></div>}
          {orders.map(order => (
            <div key={order._id} className="card">
              <div className="flex-between flex-wrap gap-md">
                <div>
                  <div className="fw-semibold mb-sm">#{order._id.slice(-10)}</div>
                  <div className="text-sm text-muted">🏪 {order.shopId?.name} — {order.shopId?.area}, {order.shopId?.city}</div>
                  <div className="text-sm text-muted">👤 {order.customerId?.name} · {order.customerId?.email}</div>
                  <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()} · {order.paymentMethod.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <span className={`badge ${STATUS_CLASS[order.status] || 'badge-gray'}`} style={{ display: 'inline-block', marginBottom: '0.375rem' }}>
                    {order.status}
                  </span>
                  <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Rs. {order.totalAmount.toLocaleString()}</div>
                  <div className="text-sm" style={{ color: 'var(--success)' }}>
                    Commission: Rs. {Math.round(order.commissionAmount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
