
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { SHOP } from '../config.js';
import { money } from '../utils.js';
import { useAuth } from '../AuthContext.jsx';

const FALLBACK_IMAGE =
  'https://png.pngtree.com/png-clipart/20250210/original/pngtree-vibrant-mixed-fruit-splash-photography-for-product-advertising-png-image_20404136.png';

const PRODUCT_IMAGES = {
  apple:
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=85',
  banana:
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=85',
  tomato:
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
  potato:
    'https://tropicalexotics.in/cdn/shop/files/rn-image_picker_lib_temp_28447044-fbd4-4ec1-a2f7-6d7a1f7500e0_2048x.png?v=1774817295',
  milk:
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=85',
  bread:
    'https://5.imimg.com/data5/VB/UN/MY-17977060/orange.png',
  egg:
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=85',
  rice:
    'https://www.californiastrawberries.com/wp-content/uploads/2019/03/halved-strawberries.jpg',
  orange:
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85',
  spinach:
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85',
};

const PERKS = [
  {
    icon: '🌿',
    title: 'Picked fresh daily',
    text: 'Fresh vegetables and fruits for everyday meals.',
  },
  {
    icon: '🏷️',
    title: 'Fair prices',
    text: 'Honest prices on your daily essentials.',
  },
  {
    icon: '🛍️',
    title: 'Ready at the counter',
    text: 'Quick and convenient grocery shopping.',
  },
];

function getProductImage(product) {
  const savedImage =
    product.imageUrl || product.image_url || product.image;

  if (
    typeof savedImage === 'string' &&
    /^https?:\/\//i.test(savedImage)
  ) {
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

  if (name.includes('orange') || name.includes('juice')) {
    return PRODUCT_IMAGES.orange;
  }

  if (name.includes('spinach') || name.includes('green')) {
    return PRODUCT_IMAGES.spinach;
  }

  return FALLBACK_IMAGE;
}

function Perk({ icon, title, text }) {
  return (
    <article className="lp-glass lp-perk">
      <span className="lp-perk-icon" aria-hidden="true">
        {icon}
      </span>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function ProductCard({ product }) {
  const [imageSrc, setImageSrc] = useState(() =>
    getProductImage(product)
  );

  const outOfStock = Number(product.stock) <= 0;

  useEffect(() => {
    setImageSrc(getProductImage(product));
  }, [product]);

  return (
    <article
      className={`lp-glass lp-product ${
        outOfStock ? 'is-out' : ''
      }`}
    >
      <div className="lp-product-img">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={() => {
            if (imageSrc !== FALLBACK_IMAGE) {
              setImageSrc(FALLBACK_IMAGE);
            }
          }}
        />
      </div>

      <div className="lp-product-info">
        <span className="lp-category">
          {product.category || 'Fresh groceries'}
        </span>

        <h3>{product.name}</h3>

        {product.description && (
          <p className="lp-product-description">
            {product.description}
          </p>
        )}

        <div className="lp-product-foot">
          <p className="lp-price">{money(product.price)}</p>

          {outOfStock && (
            <span className="lp-badge">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Landing() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await api('/products');

        if (active) {
          setProducts(
            Array.isArray(data.products) ? data.products : []
          );
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Unable to load products. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      String(product.name || '').toLowerCase().includes(term)
    );
  }, [products, query]);

  return (
    <main className="lp">
      <style>{STYLES}</style>

      <div className="lp-orb lp-orb-mango" aria-hidden="true" />
      <div className="lp-orb lp-orb-tomato" aria-hidden="true" />

      <section className="lp-container lp-hero">
        <div className="lp-glass lp-hero-copy">
          <span className="lp-eyebrow">
            FRESH · LOCAL · EVERY DAY
          </span>

          <h1>
            Fresh groceries, fair prices, ready at the counter.
          </h1>

          <p className="lp-hero-tag">
            {SHOP.tagline}. Discover vegetables, fruits, dairy
            and daily essentials from {SHOP.name}.
          </p>

          <div className="lp-actions">
            <a href="#products" className="lp-btn lp-btn-primary">
              Shop now →
            </a>

            {user && (
              <Link
                to="/dashboard"
                className="lp-btn lp-btn-glass"
              >
                Go to dashboard
              </Link>
            )}
          </div>

          <p className="lp-trust">
            ✓ Fresh picks &nbsp; ✓ Great value &nbsp; ✓ Easy shopping
          </p>
        </div>

        <div className="lp-hero-art">
          <div className="lp-hero-photo">
            <img
              src={FALLBACK_IMAGE}
              alt="Fresh vegetables at a grocery market"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
            />
          </div>

          {['🍅', '🥛', '🍌', '🍞'].map((emoji, index) => (
            <span
              key={emoji}
              className={`lp-glass lp-float lp-float-${index + 1}`}
              aria-hidden="true"
            >
              {emoji}
            </span>
          ))}
        </div>
      </section>

      <section className="lp-container lp-perks">
        {PERKS.map((perk) => (
          <Perk key={perk.title} {...perk} />
        ))}
      </section>

      <section
        id="products"
        className="lp-container lp-section"
      >
        <div className="lp-section-head">
          <div>
            <span className="lp-eyebrow">
              FRESH FROM OUR SHELVES
            </span>
            <h2>Today at {SHOP.name}</h2>
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

        {error && (
          <div className="lp-alert" role="alert">
            <p>{error}</p>
            <button
              className="lp-btn lp-btn-glass"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        )}

        {loading ? (
          <div className="lp-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="lp-glass lp-skeleton"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <div className="lp-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {!loading && !error && visibleProducts.length === 0 && (
          <p className="lp-empty">
            {query
              ? `No products match "${query}". Try another search.`
              : 'No products found. Check your PostgreSQL seed data.'}
          </p>
        )}
      </section>

      <footer id="contact" className="lp-container lp-footer">
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

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&display=swap');

.lp {
  --text: #f2fbf6;
  --text-dim: rgba(242,251,246,.76);
  --glass: rgba(255,255,255,.12);
  --glass-strong: rgba(255,255,255,.2);
  --border: rgba(255,255,255,.28);
  --lime: #b6f36b;
  --mango: #ffb547;
  --tomato: #ff6b57;
  --radius: 22px;
  --head: 'Bricolage Grotesque','Manrope',system-ui,sans-serif;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--text);
  font-family: 'Manrope',system-ui,sans-serif;
  line-height: 1.6;
  background: linear-gradient(140deg,#052e2b,#0b5d4f 55%,#137a5f);
}

.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp h1,.lp h2,.lp h3 { font-family:var(--head);line-height:1.15;letter-spacing:-.02em;margin:0 0 .5em; }
.lp h1 { font-size:clamp(2.2rem,5vw,3.6rem);font-weight:800; }
.lp h2 { font-size:clamp(1.6rem,3vw,2.2rem); }
.lp h3 { font-size:1.1rem; }
.lp p { margin:0 0 .6em; }
.lp a { color:inherit;text-decoration:none; }
.lp-container { position:relative;z-index:1;width:min(1180px,calc(100% - 40px));margin-inline:auto; }

.lp-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
.lp-orb-mango { width:460px;height:460px;top:-120px;right:-100px;background:var(--mango);opacity:.38; }
.lp-orb-tomato { width:520px;height:520px;bottom:-160px;left:-140px;background:var(--tomato);opacity:.28; }

.lp-glass {
  background:var(--glass);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:0 12px 40px rgba(2,20,17,.28),inset 0 1px 0 rgba(255,255,255,.25);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  backdrop-filter:blur(18px) saturate(160%);
}

.lp-eyebrow { display:inline-block;font-size:.72rem;letter-spacing:2px;color:var(--lime);font-weight:800;margin-bottom:12px; }
.lp-actions { display:flex;flex-wrap:wrap;gap:12px; }
.lp-btn { display:inline-flex;align-items:center;justify-content:center;padding:13px 25px;border-radius:999px;border:1px solid transparent;font:700 .95rem 'Manrope',sans-serif;cursor:pointer; }
.lp-btn-primary { color:#1d2a05!important;background:linear-gradient(135deg,var(--lime),var(--mango)); }
.lp-btn-glass { background:var(--glass);border-color:var(--border); }

.lp-hero { display:grid;grid-template-columns:1.15fr 1fr;gap:34px;align-items:center;padding:56px 0 24px; }
.lp-hero-copy { padding:clamp(24px,4vw,48px); }
.lp-hero-tag { max-width:52ch;margin-bottom:1.6em!important;font-size:1.05rem;color:var(--text-dim); }
.lp-trust { margin-top:22px;font-size:.82rem;color:var(--text-dim); }

.lp-hero-art { position:relative;min-height:365px;display:grid;place-items:center; }
.lp-hero-photo { width:min(100%,420px);height:330px;border-radius:32px;overflow:hidden;border:1px solid var(--border);transform:rotate(2deg); }
.lp-hero-photo img { width:100%;height:100%;object-fit:cover;display:block; }
.lp-float { position:absolute;display:grid;place-items:center;width:78px;height:78px;font-size:2.5rem;border-radius:22px;animation:lp-drift 7s ease-in-out infinite; }
.lp-float-1 { top:5px;left:2%; }
.lp-float-2 { top:24%;right:-2%;animation-delay:-2s; }
.lp-float-3 { bottom:14%;left:-1%;animation-delay:-4s; }
.lp-float-4 { bottom:0;right:20%;animation-delay:-1s; }
@keyframes lp-drift { 0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)} }

.lp-perks { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px; }
.lp-perk { display:flex;align-items:center;gap:14px;padding:18px 20px; }
.lp-perk h3 { margin:0 0 3px; }
.lp-perk p { margin:0;font-size:.88rem;color:var(--text-dim); }
.lp-perk-icon { display:grid;place-items:center;flex:none;width:48px;height:48px;font-size:1.5rem;border-radius:14px;background:var(--glass-strong); }

.lp-section { padding:56px 0; }
.lp-section-head { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px; }
.lp-section-head h2 { margin:0; }
.lp-search { width:min(300px,100%);padding:12px 18px;border-radius:999px;font:500 .95rem 'Manrope',sans-serif;color:var(--text);background:var(--glass);border:1px solid var(--border); }
.lp-search::placeholder { color:var(--text-dim); }

.lp-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:20px; }
.lp-product { display:flex;flex-direction:column;overflow:hidden;transition:transform .2s,background .2s; }
.lp-product:hover { transform:translateY(-4px);background:var(--glass-strong); }
.lp-product.is-out { opacity:.65; }
.lp-product-img { height:165px;overflow:hidden;background:rgba(255,255,255,.1); }
.lp-product-img img { width:100%;height:100%;object-fit:cover;display:block; }
.lp-product-info { display:flex;flex-direction:column;flex:1;padding:17px; }
.lp-category { font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--lime);font-weight:800; }
.lp-product h3 { margin:7px 0; }
.lp-product-description { font-size:.82rem;color:var(--text-dim); }
.lp-product-foot { display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:9px; }
.lp-price { margin:0!important;font:800 1.2rem var(--head);color:var(--lime); }
.lp-badge { padding:3px 10px;border-radius:999px;font-size:.7rem;font-weight:700;color:#3d2200;background:var(--mango); }

.lp-skeleton { min-height:245px;background:linear-gradient(100deg,var(--glass) 30%,var(--glass-strong) 50%,var(--glass) 70%);background-size:200% 100%;animation:lp-shimmer 1.4s linear infinite; }
@keyframes lp-shimmer { to{background-position:-200% 0} }
.lp-empty { text-align:center;padding:32px;color:var(--text-dim); }
.lp-alert { padding:14px 16px;border-radius:14px;background:#ff6b5738;border:1px solid #ff6b5780;margin-bottom:18px; }

.lp-footer { padding:24px 0 40px; }
.lp-footer-inner { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:28px 32px; }
.lp-footer-inner strong { font-family:var(--head);font-size:1.05rem; }
.lp-footer-inner p { margin:4px 0 0;color:var(--text-dim); }

@media(max-width:860px) {
  .lp-hero { grid-template-columns:1fr; }
  .lp-hero-art { min-height:280px; }
  .lp-hero-photo { height:260px; }
  .lp-perks,.lp-footer-inner { grid-template-columns:1fr; }
}
@media(max-width:560px) {
  .lp-container { width:calc(100% - 28px); }
  .lp-hero { padding-top:28px; }
  .lp-hero h1 { font-size:2.5rem; }
  .lp-hero-art { min-height:225px; }
  .lp-hero-photo { height:210px; }
  .lp-grid { grid-template-columns:repeat(2,minmax(0,1fr));gap:12px; }
  .lp-product-img { height:125px; }
  .lp-product-info { padding:12px; }
  .lp-product h3 { font-size:.98rem; }
  .lp-price { font-size:1.05rem; }
  .lp-footer-inner { padding:22px; }
}
@media(prefers-reduced-motion:reduce) {
  .lp *, .lp *::before, .lp *::after { animation:none!important;transition:none!important; }
}
`;
