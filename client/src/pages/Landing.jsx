
import { Link } from 'react-router-dom';
import { SHOP } from '../config.js';
import { useAuth } from '../AuthContext.jsx';

export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&display=swap');

.lp {
  --text:#f2fbf6;
  --text-dim:rgba(242,251,246,.76);
  --glass:rgba(255,255,255,.12);
  --glass-strong:rgba(255,255,255,.2);
  --border:rgba(255,255,255,.28);
  --lime:#b6f36b;
  --mango:#ffb547;
  --tomato:#ff6b57;
  --radius:22px;
  --head:'Bricolage Grotesque','Manrope',system-ui,sans-serif;
  position:relative;min-height:100vh;overflow:hidden;
  color:var(--text);font-family:'Manrope',system-ui,sans-serif;
  line-height:1.6;
  background:linear-gradient(140deg,#052e2b,#0b5d4f 55%,#137a5f);
}
.lp *, .lp *::before, .lp *::after { box-sizing:border-box; }
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
  background:var(--glass);border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:0 12px 40px rgba(2,20,17,.28),inset 0 1px 0 rgba(255,255,255,.25);
  -webkit-backdrop-filter:blur(18px) saturate(160%);
  backdrop-filter:blur(18px) saturate(160%);
}
.lp-eyebrow { display:inline-block;font-size:.72rem;letter-spacing:2px;color:var(--lime);font-weight:800;margin-bottom:12px; }
.lp-actions { display:flex;flex-wrap:wrap;gap:12px; }
.lp-btn { display:inline-flex;align-items:center;justify-content:center;padding:13px 25px;border-radius:999px;border:1px solid transparent;font:700 .95rem 'Manrope',sans-serif;cursor:pointer;transition:transform .2s; }
.lp-btn:hover { transform:translateY(-2px); }
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

.lp-browse { margin-top:55px;padding:45px 25px;text-align:center; }
.lp-browse h2 { margin:10px 0; }
.lp-browse p { color:var(--text-dim);margin-bottom:22px; }
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

function Perk({ icon, title, text }) {
  return (
    <article className="lp-glass lp-perk">
      <span className="lp-perk-icon" aria-hidden="true">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="lp">
      <style>{STYLES}</style>

      <div className="lp-orb lp-orb-mango" aria-hidden="true" />
      <div className="lp-orb lp-orb-tomato" aria-hidden="true" />

      <section className="lp-container lp-hero">
        <div className="lp-glass lp-hero-copy">
          <span className="lp-eyebrow">FRESH · LOCAL · EVERY DAY</span>

          <h1>Fresh groceries, fair prices, ready at the counter.</h1>

          <p className="lp-hero-tag">
            {SHOP.tagline}. Discover vegetables, fruits, dairy
            and daily essentials from {SHOP.name}.
          </p>

          <div className="lp-actions">
            <Link to="/products" className="lp-btn lp-btn-primary">
              Shop now →
            </Link>

            {user && (
              <Link to="/dashboard" className="lp-btn lp-btn-glass">
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
              src="https://png.pngtree.com/png-clipart/20250210/original/pngtree-vibrant-mixed-fruit-splash-photography-for-product-advertising-png-image_20404136.png"
              alt="Fresh fruits for your grocery shopping"
              fetchPriority="high"
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

      <section className="lp-container">
        <div className="lp-glass lp-browse">
          <span className="lp-eyebrow">FRESH FROM OUR SHELVES</span>
          <h2>Ready to fill your basket?</h2>
          <p>Explore fresh groceries, fruits, vegetables and everyday essentials.</p>
          <Link to="/products" className="lp-btn lp-btn-primary">
            Browse all products →
          </Link>
        </div>
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
