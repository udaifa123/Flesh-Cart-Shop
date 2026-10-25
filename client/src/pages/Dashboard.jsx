
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { money } from '../utils.js';

function AddProduct() {
  const [f, setF] = useState({
    name: '',
    price: '',
    stock: '',
    emoji: '',
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setErrors({});
    setLoading(true);

    try {
      const d = await api('/products', {
        method: 'POST',
        body: {
          ...f,
          price: Number(f.price),
          stock: Number(f.stock),
        },
      });

      setMsg({
        type: 'success',
        text: `Product "${d.product.name}" added successfully.`,
      });

      setF({ name: '', price: '', stock: '', emoji: '' });
    } catch (err) {
      setErrors(err.errors || {});
      setMsg({
        type: 'error',
        text: err.message || 'Unable to add product.',
      });
    } finally {
      setLoading(false);
    }
  };

  const input = (key, label, props = {}) => (
    <div className="fc-field" key={key}>
      <label htmlFor={`product-${key}`}>{label}</label>
      <input
        id={`product-${key}`}
        value={f[key]}
        onChange={set(key)}
        {...props}
      />
      {errors[key] && (
        <span className="fc-field-error">{errors[key]}</span>
      )}
    </div>
  );

  return (
    <section className="fc-panel">
      <div className="fc-panel-heading">
        <div>
          <span className="fc-eyebrow">INVENTORY MANAGEMENT</span>
          <h2>Add a new product</h2>
          <p>Add products to your store inventory.</p>
        </div>
        <span className="fc-heading-icon">＋</span>
      </div>

      {msg.text && (
        <div
          className={`fc-alert ${
            msg.type === 'success' ? 'fc-success' : 'fc-error'
          }`}
          role="status"
        >
          {msg.text}
        </div>
      )}

      <form className="fc-product-form" onSubmit={submit}>
        {input('name', 'Product name', {
          placeholder: 'e.g. Fresh apples',
          required: true,
          maxLength: 100,
        })}

        {input('price', 'Price (₹)', {
          type: 'number',
          placeholder: '0.00',
          min: '0.01',
          step: '0.01',
          required: true,
        })}

        {input('stock', 'Available stock', {
          type: 'number',
          placeholder: '0',
          min: '0',
          step: '1',
          required: true,
        })}

        {input('emoji', 'Product emoji', {
          placeholder: '🍎',
          maxLength: 4,
        })}

        <button
          type="submit"
          className="fc-btn fc-btn-primary fc-add-button"
          disabled={loading}
        >
          {loading ? 'Adding product...' : '+ Add product'}
        </button>
      </form>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api('/bills/summary/today')
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Couldn't load today's sales.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const lowStock = summary?.lowStock || [];

  return (
    <main className="fc-dashboard">
      <style>{`
        .fc-dashboard {
          --fc-green: #16834a;
          --fc-green-dark: #11683b;
          --fc-green-light: #eaf7ee;
          --fc-ink: #17251c;
          --fc-muted: #758078;
          --fc-border: #e6ece7;
          min-height: 100vh;
          padding: 36px 24px 60px;
          color: var(--fc-ink);
          background: #f7faf7;
          font-family: inherit;
        }

        .fc-dashboard * { box-sizing: border-box; }

        .fc-dashboard-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .fc-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
        }

        .fc-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fc-brand-mark {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 15px;
          background: var(--fc-green);
          color: white;
          font-size: 25px;
          box-shadow: 0 7px 18px #16834a25;
        }

        .fc-brand-name {
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .fc-brand-caption {
          margin-top: 3px;
          color: var(--fc-muted);
          font-size: 12px;
        }

        .fc-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid #dceee1;
          border-radius: 999px;
          background: white;
          color: #287747;
          font-size: 12px;
          font-weight: 700;
        }

        .fc-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #25a55b;
        }

        .fc-welcome {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 34px;
          border-radius: 24px;
          color: white;
          background: linear-gradient(120deg, #12683b 0%, #19844b 58%, #34a65f 100%);
          box-shadow: 0 12px 32px #12683b18;
        }

        .fc-welcome::after {
          content: '';
          position: absolute;
          width: 280px;
          height: 280px;
          right: -65px;
          top: -125px;
          border: 1px solid #ffffff24;
          border-radius: 50%;
          box-shadow: 0 0 0 35px #ffffff09, 0 0 0 70px #ffffff07;
          pointer-events: none;
        }

        .fc-welcome-content { position: relative; z-index: 1; }

        .fc-eyebrow {
          display: block;
          color: #789083;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .fc-welcome .fc-eyebrow { color: #d2f1dc; }

        .fc-welcome h1 {
          margin: 10px 0;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          letter-spacing: -1.2px;
          line-height: 1.2;
        }

        .fc-welcome p {
          margin: 0;
          max-width: 490px;
          color: #e1f4e7;
          font-size: 14px;
          line-height: 1.7;
        }

        .fc-welcome-emoji {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 112px;
          height: 112px;
          border: 1px solid #ffffff35;
          border-radius: 28px;
          background: #ffffff18;
          font-size: 58px;
          transform: rotate(4deg);
        }

        .fc-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 20px 0 32px;
        }

        .fc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 12px 18px;
          border: 1px solid transparent;
          border-radius: 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 750;
          text-decoration: none;
          cursor: pointer;
          transition: transform .18s ease, background .18s ease;
        }

        .fc-btn:hover { transform: translateY(-2px); }

        .fc-btn-primary {
          color: white;
          background: var(--fc-green);
        }

        .fc-btn-primary:hover { background: var(--fc-green-dark); }

        .fc-btn-secondary {
          color: #24382b;
          border-color: var(--fc-border);
          background: white;
        }

        .fc-btn-secondary:hover { background: #f0f7f1; }

        .fc-section-title {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 16px;
        }

        .fc-section-title h2 {
          margin: 6px 0 0;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .fc-section-title p {
          margin: 5px 0 0;
          color: var(--fc-muted);
          font-size: 13px;
        }

        .fc-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .fc-stat-card {
          min-width: 0;
          padding: 23px;
          border: 1px solid var(--fc-border);
          border-radius: 18px;
          background: white;
          box-shadow: 0 3px 10px #15291b04;
        }

        .fc-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .fc-stat-label {
          color: var(--fc-muted);
          font-size: 13px;
          font-weight: 600;
        }

        .fc-stat-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          border-radius: 13px;
          background: var(--fc-green-light);
          font-size: 21px;
        }

        .fc-stat-value {
          display: block;
          margin-top: 15px;
          overflow-wrap: anywhere;
          font-size: clamp(27px, 3vw, 34px);
          font-weight: 850;
          letter-spacing: -1px;
        }

        .fc-stat-foot {
          margin-top: 7px;
          color: var(--fc-muted);
          font-size: 12px;
        }

        .fc-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr);
          gap: 18px;
          align-items: start;
          margin-bottom: 22px;
        }

        .fc-panel {
          min-width: 0;
          padding: 24px;
          border: 1px solid var(--fc-border);
          border-radius: 18px;
          background: white;
          box-shadow: 0 3px 10px #15291b04;
        }

        .fc-panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 22px;
        }

        .fc-panel-heading h2 {
          margin: 7px 0 5px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -.4px;
        }

        .fc-panel-heading p {
          margin: 0;
          color: var(--fc-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .fc-heading-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: var(--fc-green-light);
          color: var(--fc-green);
          font-size: 24px;
        }

        .fc-profile-list { display: grid; gap: 0; }

        .fc-profile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px 0;
          border-bottom: 1px solid #edf1ed;
        }

        .fc-profile-row:first-child { padding-top: 0; }
        .fc-profile-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .fc-profile-label {
          color: var(--fc-muted);
          font-size: 12px;
        }

        .fc-profile-value {
          max-width: 65%;
          overflow-wrap: anywhere;
          text-align: right;
          font-size: 13px;
          font-weight: 700;
        }

        .fc-role {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 8px;
          color: #237746;
          background: #eaf7ee;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .fc-stock-list { display: grid; gap: 10px; }

        .fc-stock-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px;
          border: 1px solid #f1e7d2;
          border-radius: 12px;
          background: #fffbf3;
        }

        .fc-stock-name {
          font-size: 13px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .fc-stock-count {
          flex-shrink: 0;
          color: #a86412;
          font-size: 11px;
          font-weight: 800;
        }

        .fc-stock-empty {
          padding: 22px 12px;
          border-radius: 12px;
          background: #f2faf4;
          color: #34794b;
          text-align: center;
          font-size: 13px;
          line-height: 1.7;
        }

        .fc-alert {
          margin: 0 0 18px;
          padding: 12px 14px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.6;
        }

        .fc-error {
          border: 1px solid #f4d0d0;
          background: #fff1f1;
          color: #a32626;
        }

        .fc-success {
          border: 1px solid #ccebd5;
          background: #eefaf1;
          color: #216e3b;
        }

        .fc-product-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
          align-items: end;
        }

        .fc-field { min-width: 0; }

        .fc-field label {
          display: block;
          margin-bottom: 8px;
          color: #39493e;
          font-size: 12px;
          font-weight: 750;
        }

        .fc-field input {
          display: block;
          width: 100%;
          min-width: 0;
          height: 45px;
          padding: 0 12px;
          border: 1px solid #dfe7e0;
          border-radius: 10px;
          outline: none;
          background: #fbfdfb;
          color: var(--fc-ink);
          font: inherit;
          font-size: 13px;
          transition: border-color .15s, box-shadow .15s;
        }

        .fc-field input:focus {
          border-color: #42a86a;
          box-shadow: 0 0 0 3px #16834a15;
        }

        .fc-field input::placeholder { color: #a0aaa2; }

        .fc-field-error {
          display: block;
          margin-top: 5px;
          color: #b42318;
          font-size: 11px;
        }

        .fc-add-button { width: 100%; }

        .fc-loading {
          padding: 25px 0;
          color: var(--fc-muted);
          font-size: 13px;
        }

        .fc-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--fc-border);
          color: var(--fc-muted);
          text-align: center;
          font-size: 11px;
        }

        @media (max-width: 760px) {
          .fc-dashboard { padding: 22px 15px 40px; }
          .fc-content-grid { grid-template-columns: 1fr; }
          .fc-welcome { padding: 27px 22px; }
          .fc-welcome-emoji { width: 76px; height: 76px; font-size: 40px; border-radius: 21px; }
          .fc-panel { padding: 20px; }
        }

        @media (max-width: 480px) {
          .fc-topline { margin-bottom: 22px; }
          .fc-brand-name { font-size: 18px; }
          .fc-brand-caption { font-size: 10px; }
          .fc-live-pill { padding: 8px 10px; font-size: 10px; }
          .fc-brand-mark { width: 40px; height: 40px; }
          .fc-welcome { padding: 23px 18px; border-radius: 19px; }
          .fc-welcome h1 { font-size: 26px; }
          .fc-welcome p { font-size: 12px; }
          .fc-welcome-emoji { width: 55px; height: 55px; font-size: 30px; border-radius: 15px; }
          .fc-stats { grid-template-columns: 1fr; gap: 12px; }
          .fc-stat-card { padding: 19px; }
          .fc-product-form { grid-template-columns: 1fr; }
          .fc-actions { display: grid; grid-template-columns: 1fr; }
          .fc-btn { width: 100%; }
          .fc-section-title h2 { font-size: 19px; }
        }
      `}</style>

      <div className="fc-dashboard-inner">
        <header className="fc-topline">
          <div className="fc-brand">
            <div className="fc-brand-mark">🛒</div>
            <div>
              <div className="fc-brand-name">FreshCart</div>
              <div className="fc-brand-caption">Store management system</div>
            </div>
          </div>

          <div className="fc-live-pill">
            <span className="fc-live-dot" />
            Dashboard
          </div>
        </header>

        <section className="fc-welcome">
          <div className="fc-welcome-content">
            <span className="fc-eyebrow">YOUR STORE AT A GLANCE</span>
            <h1>Welcome back, {user?.fullName || 'there'}! 👋</h1>
            <p>
              Manage your store, create bills and keep track of today's
              performance — all in one place.
            </p>
          </div>
          <div className="fc-welcome-emoji" aria-hidden="true">
            🥬
          </div>
        </section>

        <nav className="fc-actions" aria-label="Dashboard actions">
          <Link to="/pos" className="fc-btn fc-btn-primary">
            ＋ Start billing
          </Link>
          <Link to="/bills" className="fc-btn fc-btn-secondary">
            ▤ View bill history
          </Link>
        </nav>

        <section>
          <div className="fc-section-title">
            <div>
              <span className="fc-eyebrow">STORE OVERVIEW</span>
              <h2>Today's performance</h2>
              <p>Sales summary for the current day.</p>
            </div>
          </div>

          {error && (
            <div className="fc-alert fc-error" role="alert">
              {error}
            </div>
          )}

          <div className="fc-stats">
            <article className="fc-stat-card">
              <div className="fc-stat-top">
                <span className="fc-stat-label">Bills generated today</span>
                <span className="fc-stat-icon">🧾</span>
              </div>
              <strong className="fc-stat-value">
                {loading ? '—' : summary?.billCount ?? 0}
              </strong>
              <div className="fc-stat-foot">
                Total bills created today
              </div>
            </article>

            <article className="fc-stat-card">
              <div className="fc-stat-top">
                <span className="fc-stat-label">Total sales today</span>
                <span className="fc-stat-icon">💰</span>
              </div>
              <strong className="fc-stat-value">
                {loading ? '—' : money(summary?.totalSales ?? 0)}
              </strong>
              <div className="fc-stat-foot">
                Total recorded sales today
              </div>
            </article>
          </div>
        </section>

        <div className="fc-content-grid">
          <section className="fc-panel">
            <div className="fc-panel-heading">
              <div>
                <span className="fc-eyebrow">ACCOUNT DETAILS</span>
                <h2>Your profile</h2>
                <p>Information associated with your account.</p>
              </div>
              <span className="fc-heading-icon">👤</span>
            </div>

            <div className="fc-profile-list">
              <div className="fc-profile-row">
                <span className="fc-profile-label">Full name</span>
                <strong className="fc-profile-value">
                  {user?.fullName || '—'}
                </strong>
              </div>
              <div className="fc-profile-row">
                <span className="fc-profile-label">Email address</span>
                <strong className="fc-profile-value">
                  {user?.email || '—'}
                </strong>
              </div>
              <div className="fc-profile-row">
                <span className="fc-profile-label">Phone number</span>
                <strong className="fc-profile-value">
                  {user?.phone || 'Not provided'}
                </strong>
              </div>
              <div className="fc-profile-row">
                <span className="fc-profile-label">Account role</span>
                <span className="fc-role">
                  {user?.role === 'admin' ? 'Admin' : 'Staff'}
                </span>
              </div>
            </div>
          </section>

          <section className="fc-panel">
            <div className="fc-panel-heading">
              <div>
                <span className="fc-eyebrow">INVENTORY STATUS</span>
                <h2>Low-stock products</h2>
                <p>Products with fewer than 5 items remaining.</p>
              </div>
              <span className="fc-heading-icon">📦</span>
            </div>

            {loading ? (
              <div className="fc-loading">Loading inventory status...</div>
            ) : lowStock.length > 0 ? (
              <div className="fc-stock-list">
                {lowStock.map((product) => (
                  <div className="fc-stock-item" key={product.id}>
                    <span className="fc-stock-name">{product.name}</span>
                    <span className="fc-stock-count">
                      {product.stock === 0
                        ? 'Out of stock'
                        : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fc-stock-empty">
                <div style={{ fontSize: 27, marginBottom: 8 }}>✓</div>
                <strong>Inventory looks good!</strong>
                <div>No low-stock products to show.</div>
              </div>
            )}
          </section>
        </div>

        {user?.role === 'admin' && <AddProduct />}

        <footer className="fc-footer">
          FreshCart · Store management made simple
        </footer>
      </div>
    </main>
  );
}
