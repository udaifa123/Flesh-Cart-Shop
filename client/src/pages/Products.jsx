
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { SHOP } from '../config.js';
import { money } from '../utils.js';
import { STYLES } from './Landing.jsx';
import { useCart } from '../CartContext.jsx';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85';

const PRODUCT_IMAGES = {
  apple: 'https://i.pinimg.com/1200x/db/51/45/db51454283429c596366c29678be0be0.jpg',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=85',
  tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
  potato: 'https://i.pinimg.com/736x/73/f8/da/73f8daa79ec2dbc950d2818df7144a7f.jpg',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=85',
  bread: 'https://i.pinimg.com/1200x/8a/a3/fa/8aa3fabf5eb487fb421a29b10482d091.jpg',
  egg: 'https://i.pinimg.com/736x/e1/cb/e8/e1cbe811e55850d6a4953d741e9b1b8a.jpg',
  rice: 'https://i.pinimg.com/1200x/55/65/8a/55658afe397ab3c50582ad6e745841ed.jpg',
  orange: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85',
};

function getProductImage(product) {
  const savedImage = product.imageUrl || product.image_url || product.image;

  if (typeof savedImage === 'string' && /^https?:\/\//i.test(savedImage)) {
    return savedImage;
  }

  const name = String(product.name || '').toLowerCase();

  if (name.includes('apple')) return PRODUCT_IMAGES.apple;
  if (name.includes('banana')) return PRODUCT_IMAGES.banana;
  if (name.includes('tomato')) return PRODUCT_IMAGES.tomato;
  if (name.includes('potato')) return PRODUCT_IMAGES.potato;
  if (name.includes('milk')) return PRODUCT_IMAGES.milk;
  if (name.includes('bread')) return PRODUCT_IMAGES.bread;
  if (name.includes('egg')) return PRODUCT_IMAGES.egg;
  if (name.includes('rice')) return PRODUCT_IMAGES.rice;
  if (name.includes('orange') || name.includes('juice')) return PRODUCT_IMAGES.orange;
  if (name.includes('spinach') || name.includes('green')) return PRODUCT_IMAGES.spinach;

  return FALLBACK_IMAGE;
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const [imageSrc, setImageSrc] = useState(() => getProductImage(product));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setImageSrc(getProductImage(product));
  }, [product]);

  const id = String(product.id ?? product.product_id ?? '');
  const stock = Number(product.stock ?? product.stock_quantity ?? 0);
  const cartItem = cartItems.find(
    (item) => String(item.id ?? item.product_id ?? '') === id
  );
  const quantityInCart = cartItem?.quantity ?? 0;
  const outOfStock = stock <= 0;

  function handleAddToCart() {
    setErrorMessage('');

    const result = addToCart(product);

    if (result.ok) {
      navigate('/cart');
    } else {
      setErrorMessage(result.message);
    }
  }

  return (
    <article className={`lp-glass lp-product ${outOfStock ? 'is-out' : ''}`}>
      <div className="lp-product-img">
        <img
          src={imageSrc}
          alt={product.name || 'Grocery product'}
          loading="lazy"
          onError={() => {
            if (imageSrc !== FALLBACK_IMAGE) setImageSrc(FALLBACK_IMAGE);
          }}
        />
      </div>

      <div className="lp-product-info">
        <span className="lp-category">
          {product.category || 'Fresh groceries'}
        </span>

        <h3>{product.name}</h3>

        {product.description && (
          <p className="lp-product-description">{product.description}</p>
        )}

        <div className="lp-product-foot">
          <p className="lp-price">{money(product.price)}</p>
          {outOfStock && <span className="lp-badge">Out of stock</span>}
        </div>

        <p className="fc-product-stock">
          {outOfStock ? 'Currently unavailable' : `${stock} in stock`}
        </p>

        <button
          type="button"
          className="fc-add-cart-btn"
          disabled={outOfStock || quantityInCart >= stock}
          onClick={handleAddToCart}
        >
          {outOfStock
            ? 'Out of Stock'
            : quantityInCart >= stock
              ? 'Maximum Stock Added'
              : quantityInCart > 0
                ? `Add More · ${quantityInCart} in Cart`
                : '🛒 Add to Cart'}
        </button>

        {errorMessage && (
          <p className="fc-cart-feedback" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </article>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { totalItems } = useCart();

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const data = await api('/products');
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      setProducts(list);
    } catch (err) {
      setError(err?.message || 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const data = await api('/products');
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        if (active) {
          setProducts(list);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err?.message || 'Unable to load products. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
      ].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [products, query]);

  return (
    <main className="lp">
      <style>{STYLES}</style>
      <style>{`
        .fc-products-toolbar {
          display:flex;
          justify-content:space-between;
          align-items:center;
          flex-wrap:wrap;
          gap:14px;
          margin-bottom:24px;
        }
        .fc-add-cart-btn {
          display:block;
          width:100%;
          margin-top:12px;
          padding:12px 10px;
          border:1px solid #16834a;
          border-radius:10px;
          background:#16834a;
          color:#fff;
          font:inherit;
          font-size:13px;
          font-weight:750;
          cursor:pointer;
        }
        .fc-add-cart-btn:hover:not(:disabled) { background:#11683b; }
        .fc-add-cart-btn:disabled {
          background:#e5eae5;
          border-color:#d5ddd5;
          color:#788278;
          cursor:not-allowed;
        }
        .fc-product-stock { margin:7px 0 0; font-size:12px; }
        .fc-cart-feedback { color:#ffd0ca; font-size:12px; }
        .fc-view-cart-link { color:#d9ffb4; font-size:13px; font-weight:750; }
        .fc-products-cart-link {
          display:inline-flex;
          gap:8px;
          align-items:center;
          justify-content:center;
          padding:12px 18px;
          border-radius:11px;
          background:#16834a;
          color:white;
          text-decoration:none;
          font-weight:750;
        }
        @media(max-width:600px) {
          .fc-products-toolbar { align-items:stretch; }
          .fc-products-toolbar > * { text-align:center; }
        }
      `}</style>

      <div className="lp-orb lp-orb-mango" aria-hidden="true" />
      <div className="lp-orb lp-orb-tomato" aria-hidden="true" />

      <section className="lp-container lp-section">
        <div className="lp-section-head">
          <div>
            <span className="lp-eyebrow">FRESH FROM OUR SHELVES</span>
            <h2>Today at {SHOP.name}</h2>
            <p>{SHOP.tagline}</p>
          </div>

          <input
            className="lp-search"
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="fc-products-toolbar">
          <Link to="/" className="lp-btn lp-btn-glass">
            ← Back to Home
          </Link>

          <Link to="/cart" className="fc-products-cart-link">
            🛒 Cart ({totalItems})
          </Link>
        </div>

        {error && (
          <div className="lp-alert" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="lp-btn lp-btn-glass"
              onClick={loadProducts}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="lp-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="lp-glass lp-skeleton" aria-hidden="true" />
            ))}
          </div>
        ) : !error && visibleProducts.length > 0 ? (
          <div className="lp-grid">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id ?? product.product_id ?? index}
                product={product}
              />
            ))}
          </div>
        ) : !error ? (
          <p className="lp-empty">
            {query
              ? `No products match "${query}". Try another search.`
              : 'No products found. Check your PostgreSQL seed data.'}
          </p>
        ) : null}
      </section>

      <footer className="lp-container lp-footer">
        <div className="lp-glass lp-footer-inner">
          <div>
            <strong>{SHOP.name}</strong>
            <p>{SHOP.tagline}</p>
          </div>
          <div>
            <strong>Visit us</strong>
            <p>{SHOP.address}</p>
            <p>{SHOP.hours}</p>
          </div>
          <div>
            <strong>Call us</strong>
            <p>{SHOP.phone}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
