import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { money } from '../utils.js';

function AddProduct() {
  const [f, setF] = useState({ name: '', price: '', stock: '', emoji: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setErrors({});
    try {
      const d = await api('/products', { method: 'POST', body: f });
      setMsg({ type: 'success', text: `Added "${d.product.name}".` });
      setF({ name: '', price: '', stock: '', emoji: '' });
    } catch (err) {
      setErrors(err.errors || {});
      setMsg({ type: 'error', text: err.message });
    }
  };

  const input = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={`p-${k}`}>{label}</label>
      <input id={`p-${k}`} value={f[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <section className="card">
      <h2>Add a product (admin)</h2>
      {msg.text && <p className={`alert alert-${msg.type}`}>{msg.text}</p>}
      <form onSubmit={submit} className="form-row">
        {input('name', 'Name', { required: true })}
        {input('price', 'Price (₹)', { type: 'number', step: '0.01', min: '0', required: true })}
        {input('stock', 'Stock', { type: 'number', step: '1', min: '0', required: true })}
        {input('emoji', 'Emoji (optional)', { maxLength: 4 })}
        <button className="btn btn-primary">Add product</button>
      </form>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/bills/summary/today')
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="container section">
      <h1>Welcome, {user.fullName}</h1>
      <div className="card profile">
        <div>
          <span className="muted">Email</span>
          <strong>{user.email}</strong>
        </div>
        <div>
          <span className="muted">Phone</span>
          <strong>{user.phone}</strong>
        </div>
        <div>
          <span className="muted">Role</span>
          <strong>{user.role === 'admin' ? 'Admin' : 'Staff'}</strong>
        </div>
      </div>

      <div className="action-row">
        <Link to="/pos" className="btn btn-primary btn-lg">
          Start billing
        </Link>
        <Link to="/bills" className="btn btn-outline btn-lg">
          Bill history
        </Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {summary && (
        <>
          <h2>Today's sales</h2>
          <div className="stats">
            <div className="card stat">
              <span className="muted">Bills today</span>
              <strong>{summary.billCount}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Total sales</span>
              <strong>{money(summary.totalSales)}</strong>
            </div>
          </div>
          {summary.lowStock.length > 0 && (
            <div className="alert alert-warn">
              <strong>Low stock (fewer than 5 left):</strong>
              <ul>
                {summary.lowStock.map((p) => (
                  <li key={p.id}>
                    {p.name} – {p.stock === 0 ? 'out of stock' : `${p.stock} left`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {user.role === 'admin' && <AddProduct />}
    </main>
  );
}
