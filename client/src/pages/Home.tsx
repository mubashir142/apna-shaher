import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const CATEGORIES = ['Fashion', 'Footwear', 'Accessories', 'Beauty', 'Home', 'Handicrafts', 'Essentials'];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => { loadData(); }, [category, city, search]);

  const loadData = async () => {
    try {
      const [productsData, shopsData] = await Promise.all([
        api.getProducts({ category: category || undefined, city: city || undefined, search: search || undefined }),
        api.getShops({ city: city || undefined }),
      ]);
      setProducts(productsData);
      setShops(shopsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">Shop Local. Save More.</h1>
        <p className="hero-sub">Direct from real shops of Islamabad &amp; Rawalpindi</p>

        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products, shops..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="hero-search-btn">Search</button>
        </form>
      </section>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <span className="filter-label">City:</span>
          {['', 'Islamabad', 'Rawalpindi'].map((c) => (
            <button
              key={c}
              className={`filter-pill${city === c ? ' active' : ''}`}
              onClick={() => setCity(c)}
            >
              {c || 'All'}
            </button>
          ))}

          <span className="filter-label" style={{ marginLeft: '0.5rem' }}>Category:</span>
          <button
            className={`filter-pill${category === '' ? ' active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Shops */}
      <section style={{ padding: '2.5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Local Shops</h2>
            <span className="text-sm text-muted">{shops.length} shops</span>
          </div>

          {shops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏪</div>
              <p>No shops found</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {shops.map((shop) => (
                <Link to={`/shop/${shop._id}`} key={shop._id} className="shop-card">
                  <div className="flex gap-md items-center mb-sm">
                    <div className="shop-avatar">🏪</div>
                    <div>
                      <div className="shop-name">{shop.name}</div>
                      <div className="shop-location">{shop.area}, {shop.city}</div>
                    </div>
                  </div>
                  {shop.isVerified && (
                    <span className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                      ✓ Verified
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section style={{ padding: '2.5rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Products</h2>
            <span className="text-sm text-muted">{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>No products found</p>
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
      </section>
    </div>
  );
}
