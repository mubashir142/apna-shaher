import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const CATEGORIES = ['Fashion','Footwear','Accessories','Beauty','Home','Handicrafts','Essentials'];
const AREAS = [
  'F-6','F-7','F-8','F-10','F-11',
  'G-6','G-7','G-8','G-9','G-10','G-11',
  'E-7','E-11','I-8','I-10',
  'Saddar','Aabpara','Commercial Market','Raja Bazaar','Bahria','DHA',
];

const STATUS_NEXT: Record<string, { label: string; next: string }> = {
  pending:    { label: 'Confirm Order',   next: 'confirmed' },
  confirmed:  { label: 'Start Processing', next: 'processing' },
  processing: { label: 'Mark Shipped',    next: 'shipped' },
  shipped:    { label: 'Mark Delivered',  next: 'delivered' },
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [loading, setLoading] = useState(true);

  const [shopForm, setShopForm] = useState({ name:'', description:'', address:'', area:'', city:'Islamabad', phone:'' });
  const [productForm, setProductForm] = useState({ name:'', description:'', category:'', price:'', originalPrice:'', stock:'' });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const shopData = await api.getMyShop().catch(() => null);
      setShop(shopData);
      if (shopData) {
        const [prod, ord] = await Promise.all([api.getMyProducts(), api.getSellerOrders()]);
        setProducts(prod);
        setOrders(ord);
        setShopForm({ name: shopData.name||'', description: shopData.description||'', address: shopData.address||'', area: shopData.area||'', city: shopData.city||'Islamabad', phone: shopData.phone||'' });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      shop ? await api.updateShop(shopForm) : await api.createShop(shopForm);
      await loadData();
      toast.success(shop ? 'Shop updated!' : 'Shop created!');
    } catch { toast.error('Failed to save shop'); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openModal = (product?: any) => {
    setEditingProduct(product || null);
    setProductForm(product ? { name: product.name, description: product.description||'', category: product.category, price: String(product.price), originalPrice: product.originalPrice ? String(product.originalPrice) : '', stock: String(product.stock) } : { name:'', description:'', category:'', price:'', originalPrice:'', stock:'' });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let images: string[] = editingProduct?.images || [];
      if (imageFile) {
        const { url } = await api.uploadImage(imageFile);
        images = [url];
      }
      const data = { ...productForm, price: Number(productForm.price), originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined, stock: Number(productForm.stock), images };
      editingProduct ? await api.updateProduct(editingProduct._id, data) : await api.createProduct(data);
      setShowModal(false);
      await loadData();
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
    } catch { toast.error('Failed to save product'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api.deleteProduct(id); await loadData(); toast.success('Product deleted'); }
    catch { toast.error('Failed to delete product'); }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    try { await api.updateOrderStatus(orderId, status); await loadData(); toast.success('Order status updated'); }
    catch { toast.error('Failed to update order'); }
  };

  if (loading) return <div className="page flex-center" style={{ minHeight: '60vh' }}><span className="text-muted">Loading...</span></div>;

  /* ---- Shop creation form ---- */
  if (!shop) return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      <div className="card" style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h1 className="page-title mb-sm">Create Your Shop</h1>
        <p className="text-muted mb-lg">Set up your digital storefront on ApnaShehar</p>
        <form onSubmit={handleShopSubmit}>
          <div className="form-group">
            <label className="form-label">Shop Name *</label>
            <input className="form-control" type="text" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} required placeholder="e.g. Al-Madina Fabrics" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} rows={3} placeholder="What do you sell?" />
          </div>
          <div className="form-group">
            <label className="form-label">Full Address *</label>
            <textarea className="form-control" value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} required rows={2} placeholder="Shop No., Street, Market..." />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Area *</label>
              <select className="form-control" value={shopForm.area} onChange={e => setShopForm({...shopForm, area: e.target.value})} required>
                <option value="">Select area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <select className="form-control" value={shopForm.city} onChange={e => setShopForm({...shopForm, city: e.target.value})}>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input className="form-control" type="tel" value={shopForm.phone} onChange={e => setShopForm({...shopForm, phone: e.target.value})} required placeholder="03xxxxxxxxx" />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg">Create Shop</button>
        </form>
      </div>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      {/* Shop header */}
      <div className="card mb-lg">
        <div className="flex-between flex-wrap gap-md">
          <div>
            <div className="flex items-center gap-sm mb-sm">
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>{shop.name}</h1>
              {shop.isVerified
                ? <span className="badge badge-success">✓ Verified</span>
                : <span className="badge badge-warning">Pending Verification</span>}
            </div>
            <div className="flex gap-md flex-wrap">
              <span className="text-sm text-muted">📍 {shop.area}, {shop.city}</span>
              <span className="text-sm text-muted">📞 {shop.phone}</span>
              <span className="text-sm text-muted">Commission: {shop.commissionRate}%</span>
            </div>
          </div>
          <div className="flex gap-md">
            <div className="stat-card" style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{products.length}</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat-card" style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{orders.length}</div>
              <div className="stat-label">Orders</div>
            </div>
            {pendingOrders > 0 && (
              <div className="stat-card" style={{ padding: '0.875rem 1.25rem', textAlign: 'center', borderColor: 'var(--warning-border)', background: 'var(--warning-light)' }}>
                <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>{pendingOrders}</div>
                <div className="stat-label">Pending</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {([
          { key: 'products', label: `Products (${products.length})` },
          { key: 'orders',   label: `Orders (${orders.length})` },
          { key: 'settings', label: 'Shop Settings' },
        ] as const).map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        <div>
          <div className="section-header mb-md">
            <h2 className="section-title">My Products</h2>
            <button onClick={() => openModal()} className="btn btn-primary btn-sm">+ Add Product</button>
          </div>
          {products.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📦</div>
              <p style={{ marginBottom: '1rem' }}>No products yet</p>
              <button onClick={() => openModal()} className="btn btn-primary">Add Your First Product</button>
            </div>
          ) : (
            <div className="grid grid-3">
              {products.map(product => (
                <div key={product._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div className="product-img" style={{ height: '160px', borderRadius: '0' }}>
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} />
                      : <span className="product-img-placeholder">📦</span>}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div className="product-name mb-sm">{product.name}</div>
                    <div className="flex-between items-center mb-md">
                      <span className="product-price">Rs. {product.price.toLocaleString()}</span>
                      <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button onClick={() => openModal(product)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div>
          <h2 className="section-title mb-md">Orders</h2>
          {orders.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">🛒</div>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="flex-col gap-md">
              {orders.map(order => (
                <div key={order._id} className="card">
                  <div className="flex-between flex-wrap gap-md mb-md">
                    <div>
                      <div className="fw-semibold">Order #{order._id.slice(-8)}</div>
                      <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</div>
                      <div className="text-sm text-muted mt-sm">
                        👤 {order.customerId?.name} · 📞 {order.customerId?.phone || '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'} mb-sm`} style={{ display: 'inline-block' }}>
                        {order.status}
                      </span>
                      <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Rs. {order.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '0.875rem' }}>
                    {order.products.map((p: any, i: number) => (
                      <div key={i} className="text-sm text-muted">{p.quantity}× {p.name}</div>
                    ))}
                    <hr className="divider" style={{ margin: '0.5rem 0' }} />
                    <div className="text-sm"><strong>Delivery:</strong> {order.deliveryAddress}, {order.area}</div>
                    <div className="text-sm"><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</div>
                  </div>

                  {STATUS_NEXT[order.status] && (
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handleOrderStatus(order._id, STATUS_NEXT[order.status].next)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        {STATUS_NEXT[order.status].label}
                      </button>
                      {order.status === 'pending' && (
                        <button onClick={() => handleOrderStatus(order._id, 'cancelled')} className="btn btn-danger btn-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="card" style={{ maxWidth: '560px' }}>
          <h2 className="section-title mb-lg">Shop Settings</h2>
          <form onSubmit={handleShopSubmit}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input className="form-control" type="text" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} rows={2} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Area</label>
                <select className="form-control" value={shopForm.area} onChange={e => setShopForm({...shopForm, area: e.target.value})}>
                  <option value="">Select area</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-control" value={shopForm.city} onChange={e => setShopForm({...shopForm, city: e.target.value})}>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" type="tel" value={shopForm.phone} onChange={e => setShopForm({...shopForm, phone: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {/* Product modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-control" type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input className="form-control" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (Rs.)</label>
                  <input className="form-control" type="number" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: e.target.value})} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input className="form-control" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.875rem' }} />
                {(imagePreview || editingProduct?.images?.[0]) && (
                  <img src={imagePreview || editingProduct.images[0]} alt="preview" style={{ marginTop: '0.75rem', width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
                )}
              </div>
              <div className="flex gap-sm">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Saving...' : editingProduct ? 'Update' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
