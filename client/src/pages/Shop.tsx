import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Shop() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadShop(); }, [id]);

  const loadShop = async () => {
    try {
      const [shopData, productsData] = await Promise.all([
        api.getShopById(id!),
        api.getProducts({ shopId: id } as any),
      ]);
      setShop(shopData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page flex-center" style={{ minHeight: '60vh' }}>
      <span className="text-muted">Loading shop...</span>
    </div>
  );
  if (!shop) return (
    <div className="page flex-center" style={{ minHeight: '60vh' }}>
      <span className="text-muted">Shop not found</span>
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      {/* Shop header */}
      <div className="card mb-lg">
        <div className="flex gap-lg items-start">
          <div className="shop-avatar" style={{ width: '72px', height: '72px', fontSize: '2rem', borderRadius: 'var(--radius-lg)' }}>
            🏪
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex flex-between flex-wrap gap-sm">
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{shop.name}</h1>
              {shop.isVerified && <span className="badge badge-success">✓ Verified Shop</span>}
            </div>
            {shop.description && (
              <p className="text-muted" style={{ marginTop: '0.375rem', maxWidth: '600px' }}>{shop.description}</p>
            )}
            <div className="flex gap-md flex-wrap mt-md">
              <span className="text-sm text-muted">📍 {shop.address}</span>
              <span className="badge badge-gray">{shop.area}, {shop.city}</span>
              <span className="text-sm text-muted">📞 {shop.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="section-header">
        <h2 className="section-title">Products</h2>
        <span className="text-sm text-muted">{products.length} items</span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📦</div>
          <p>No products listed yet</p>
        </div>
      ) : (
        <div className="grid grid-4">
          {products.map((product) => (
            <Link to={`/product/${product._id}`} key={product._id} className="product-card">
              <div className="product-img">
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} />
                  : <span className="product-img-placeholder">📦</span>}
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="flex items-center" style={{ marginTop: '0.375rem' }}>
                  <span className="product-price">Rs. {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="product-price-original">Rs. {product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="product-stock">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
