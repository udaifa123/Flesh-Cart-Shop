
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { money } from '../utils.js';

const C = {
  bg: '#071b17',
  panel: '#102a23',
  border: '#28463a',
  green: '#b6f36b',
  muted: '#9bb5a6',
  white: '#f1f8f1',
  red: '#ff9b9b',
  orange: '#ffd18a',
};

const css = `
.adm{min-height:100vh;background:radial-gradient(ellipse at 15% 0%,#174838 0%,transparent 42%),#071b17;color:${C.white};padding:32px 22px 60px;font-family:Inter,system-ui,sans-serif}
.adm *{box-sizing:border-box}
.adm-shell{max-width:1400px;margin:auto}
.adm-header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px}
.adm-kicker{font-size:11px;letter-spacing:2px;color:${C.green};font-weight:800;margin-bottom:10px}
.adm h1{font-size:clamp(28px,4vw,42px);letter-spacing:-1.5px;margin:0}
.adm p{color:${C.muted};font-size:13px;line-height:1.6}
.adm-header p{margin:8px 0 0}
.adm-btn{border:1px solid ${C.border};background:#19372c;color:${C.white};border-radius:10px;padding:11px 15px;font-weight:700;cursor:pointer;font-size:12px}
.adm-btn:disabled{opacity:.5;cursor:wait}
.adm-btn.primary{background:${C.green};color:#14251a;border-color:${C.green}}
.adm-btn.danger{color:${C.red}}
.adm-nav{display:flex;gap:7px;padding:7px;background:#0c241d;border:1px solid ${C.border};border-radius:14px;margin-bottom:20px;flex-wrap:wrap}
.adm-nav button{border:0;border-radius:9px;padding:11px 17px;color:${C.muted};background:transparent;cursor:pointer;font-weight:700;font-size:12px}
.adm-nav button.active{background:${C.green};color:#102319}
.adm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:20px}
.adm-stat,.adm-panel{background:linear-gradient(145deg,rgba(24,57,44,.97),rgba(13,38,31,.97));border:1px solid ${C.border};border-radius:17px}
.adm-stat{padding:21px}
.adm-stat-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#284c36;color:${C.green};font-size:20px;font-weight:900}
.adm-stat p{margin:15px 0 6px}
.adm-stat strong{font-size:clamp(22px,2.5vw,30px);overflow-wrap:anywhere}
.adm-stat small{display:block;color:${C.muted};font-size:11px;margin-top:8px}
.adm-panel{padding:22px;margin-bottom:19px;min-width:0}
.adm-panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}
.adm-panel h2{font-size:18px;margin:0}
.adm-panel-head p{margin:5px 0 0}
.adm-count{font-size:11px;border:1px solid ${C.border};padding:7px 10px;border-radius:8px;color:${C.muted};white-space:nowrap}
.adm-alert{padding:13px 15px;border-radius:10px;margin-bottom:15px;font-size:13px}
.adm-alert.error{color:${C.red};background:#402523;border:1px solid #70413b}
.adm-alert.ok{color:${C.green};background:#183d2c;border:1px solid #345c3b}
.adm-filters{display:flex;gap:10px;margin-bottom:18px}
.adm input,.adm select{min-width:0;width:100%;padding:11px 12px;border:1px solid ${C.border};border-radius:9px;background:#0a211a;color:${C.white};outline:none;font:inherit;font-size:12px}
.adm input:focus,.adm select:focus{border-color:${C.green}}
.adm .adm-filters input{flex:1}
.adm .adm-filters select{width:180px}
.adm-table-wrap{overflow-x:auto;width:100%}
.adm table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
.adm th{padding:12px;border-bottom:1px solid ${C.border};color:#86a293;font-size:10px;letter-spacing:1px;text-transform:uppercase}
.adm td{padding:14px 12px;border-bottom:1px solid #203d31;font-size:12px}
.adm tbody tr:last-child td{border-bottom:0}
.adm .adm-link{color:${C.green};font-weight:800;text-decoration:none}
.adm .adm-link:hover{text-decoration:underline}
.adm-pill{display:inline-block;border-radius:30px;padding:6px 9px;font-size:10px;font-weight:800;background:#1c4933;color:${C.green}}
.adm-pill.pending,.adm-pill.warning{background:#493b21;color:${C.orange}}
.adm-pill.processing{background:#183d4a;color:#9de2ff}
.adm-pill.cancelled{background:#4b2929;color:${C.red}}
.adm-pill.completed{background:#1c4933;color:${C.green}}
.adm-product-form{display:grid;grid-template-columns:2fr 1fr 1fr .7fr auto;gap:12px;align-items:end}
.adm-product-form label{display:flex;flex-direction:column;gap:7px;color:${C.muted};font-size:11px;font-weight:700}
.adm-product-form .adm-btn{min-height:40px}
.adm-product-cell{display:flex;align-items:center;gap:10px}
.adm-emoji{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#1c4031;font-size:18px}
.adm-actions{display:flex;gap:7px}
.adm-empty{padding:28px;text-align:center;color:${C.muted};font-size:13px}
.adm-stock-list{display:grid;gap:9px}
.adm-stock-row{display:flex;align-items:center;gap:12px;padding:11px;border:1px solid ${C.border};border-radius:11px}
.adm-stock-name{flex:1;font-size:13px;font-weight:700}
.adm-stock-low{font-size:11px;font-weight:800;color:${C.orange}}
.adm-denied{max-width:520px;margin:60px auto;padding:35px;text-align:center;border:1px solid ${C.border};border-radius:18px;background:${C.panel}}
@media(max-width:1000px){.adm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.adm-product-form{grid-template-columns:repeat(2,minmax(0,1fr))}.adm-product-form .adm-btn{grid-column:1/-1}}
@media(max-width:600px){.adm{padding:23px 12px 45px}.adm-header{align-items:flex-start}.adm-header h1{font-size:29px}.adm-stat{padding:14px}.adm-panel{padding:14px}.adm-product-form{grid-template-columns:1fr}.adm-product-form .adm-btn{grid-column:auto}.adm-filters{flex-direction:column}.adm .adm-filters select{width:100%}.adm-nav button{flex:1;padding:10px 7px}.adm-panel-head{align-items:flex-start}}
`;

const STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];
const EMPTY = { name: '', price: '', stock: '', emoji: '🛒' };

function dateText(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [section, setSection] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    billCount: 0,
    totalSales: 0,
    lowStock: [],
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyOrder, setBusyOrder] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productData, summaryData, orderData] = await Promise.all([
        api('/products'),
        api('/bills/summary/today'),
        api('/bills/admin/orders'),
      ]);
      setProducts(productData.products || []);
      setSummary(summaryData);
      setOrders(orderData.orders || []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard. Check your backend and admin access.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, loadData]);

  function setTab(tab) {
    setSection(tab);
    setSearch('');
    setError('');
    setNotice('');
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      emoji: product.emoji || '🛒',
    });
    setSection('products');
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      emoji: form.emoji.trim() || '🛒',
    };

    if (!payload.name || form.price === '' || form.stock === '') {
      setError('Product name, price and stock are required.');
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price < 0 ||
        Math.abs(payload.price * 100 - Math.round(payload.price * 100)) > 1e-6) {
      setError('Enter a valid price with at most 2 decimals.');
      return;
    }
    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      setError('Stock must be a whole number, 0 or more.');
      return;
    }

    setSaving(true);
    try {
      if (editingId !== null) {
        await api(`/products/${editingId}`, { method: 'PATCH', body: payload });
        setNotice('Product updated successfully.');
      } else {
        await api('/products', { method: 'POST', body: payload });
        setNotice('Product added successfully.');
      }
      resetForm();
      const data = await api('/products');
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await api(`/products/${product.id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((p) => p.id !== product.id));
      setNotice('Product deleted.');
    } catch (err) {
      setError(err.message || 'Unable to delete this product. It may be used in an existing bill.');
    }
  }

  async function updateStatus(orderId, status) {
    setBusyOrder(orderId);
    setError('');
    setNotice('');
    try {
      const data = await api(`/bills/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setOrders((current) => current.map((o) =>
        o.id === orderId ? { ...o, status: data.order.status } : o
      ));
      setNotice('Order status updated.');
    } catch (err) {
      setError(err.message || 'Unable to update order status.');
    } finally {
      setBusyOrder(null);
    }
  }

  if (authLoading) {
    return <main className="adm"><p>Checking session…</p></main>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'admin') {
    return (
      <main className="adm">
        <style>{css}</style>
        <section className="adm-denied">
          <div style={{ fontSize: 38 }}>🔒</div>
          <h1>Admin access required</h1>
          <p>Your account does not have permission to open this page.</p>
          <Link className="adm-btn primary" to="/dashboard">Back to dashboard</Link>
        </section>
      </main>
    );
  }

  const term = search.trim().toLowerCase();
  const visibleProducts = products.filter((p) =>
    p.name.toLowerCase().includes(term)
  );
  const visibleOrders = orders.filter((o) => {
    const matchesSearch =
      !term ||
      String(o.bill_number || '').toLowerCase().includes(term) ||
      String(o.customer_name || '').toLowerCase().includes(term) ||
      String(o.customer_phone || '').includes(term);
    return matchesSearch && (statusFilter === 'All' || (o.status || 'Completed') === statusFilter);
  });
  const lowStock = products.filter((p) => Number(p.stock) < 5);

  return (
    <main className="adm">
      <style>{css}</style>
      <div className="adm-shell">
        <header className="adm-header">
          <div>
            <div className="adm-kicker">FRESHCART / CONTROL CENTER</div>
            <h1>Admin dashboard</h1>
            <p>Manage products, monitor sales and track orders.</p>
          </div>
          <button className="adm-btn" disabled={loading} onClick={loadData}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </header>

        <nav className="adm-nav">
          {[
            ['overview', '◫ Overview'],
            ['orders', '▤ Order tracking'],
            ['products', '▦ Products'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={section === value ? 'active' : ''}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && <div className="adm-alert error">{error}</div>}
        {notice && <div className="adm-alert ok">{notice}</div>}

        {loading ? (
          <section className="adm-panel adm-empty">Loading dashboard data…</section>
        ) : (
          <>
            {section === 'overview' && (
              <>
                <section className="adm-stats">
                  <Stat icon="₹" label="Today's sales" value={money(summary.totalSales)} hint="Sales recorded today" />
                  <Stat icon="▤" label="Today's bills" value={summary.billCount ?? 0} hint="Billing transactions" />
                  <Stat icon="▦" label="Total products" value={products.length} hint="Products in catalogue" />
                  <Stat icon="!" label="Low stock" value={lowStock.length} hint="Fewer than 5 units left" />
                </section>

                <section className="adm-panel">
                  <PanelHead title="Recent orders" subtitle="Latest billing transactions" action={
                    <button className="adm-btn" onClick={() => setTab('orders')}>View all →</button>
                  } />
                  <OrderTable orders={orders.slice(0, 5)} busyOrder={busyOrder} onStatusChange={updateStatus} />
                </section>

                <section className="adm-panel">
                  <PanelHead title="Stock alerts" subtitle="Products that may need restocking" action={
                    <button className="adm-btn" onClick={() => setTab('products')}>Manage products →</button>
                  } />
                  {lowStock.length === 0 ? (
                    <div className="adm-empty">All products have sufficient stock.</div>
                  ) : (
                    <div className="adm-stock-list">
                      {lowStock.sort((a, b) => Number(a.stock) - Number(b.stock)).map((p) => (
                        <div className="adm-stock-row" key={p.id}>
                          <span className="adm-emoji">{p.emoji}</span>
                          <span className="adm-stock-name">{p.name}</span>
                          <span className="adm-stock-low">{p.stock} left</span>
                          <button className="adm-btn" onClick={() => editProduct(p)}>Update</button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {section === 'orders' && (
              <section className="adm-panel">
                <PanelHead title="Order tracking" subtitle="Find bills and update order status" action={
                  <span className="adm-count">{orders.length} orders</span>
                } />
                <div className="adm-filters">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bill number, customer or phone…" />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All</option>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <OrderTable orders={visibleOrders} busyOrder={busyOrder} onStatusChange={updateStatus} />
              </section>
            )}

            {section === 'products' && (
              <>
                <section className="adm-panel">
                  <PanelHead title={editingId !== null ? 'Edit product' : 'Add a product'} subtitle="Manage product information and stock" action={
                    editingId !== null ? <button className="adm-btn" onClick={resetForm}>Cancel edit</button> : null
                  } />
                  <form className="adm-product-form" onSubmit={saveProduct}>
                    <label>Product name
                      <input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fresh bananas" />
                    </label>
                    <label>Price (₹)
                      <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                    </label>
                    <label>Stock quantity
                      <input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                    </label>
                    <label>Emoji
                      <input maxLength={8} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                    </label>
                    <button className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : editingId !== null ? 'Save changes' : '+ Add product'}</button>
                  </form>
                </section>

                <section className="adm-panel">
                  <PanelHead title="Product catalogue" subtitle="Edit prices, availability and inventory" action={
                    <span className="adm-count">{products.length} products</span>
                  } />
                  <div className="adm-filters">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
                  </div>
                  <div className="adm-table-wrap">
                    <table>
                      <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead>
                      <tbody>
                        {visibleProducts.map((p) => (
                          <tr key={p.id}>
                            <td><div className="adm-product-cell"><span className="adm-emoji">{p.emoji}</span><strong>{p.name}</strong></div></td>
                            <td>{money(p.price)}</td>
                            <td>{p.stock}</td>
                            <td><span className={`adm-pill ${Number(p.stock) < 5 ? 'warning' : 'completed'}`}>{Number(p.stock) === 0 ? 'Out of stock' : Number(p.stock) < 5 ? 'Low stock' : 'In stock'}</span></td>
                            <td><div className="adm-actions">
                              <button className="adm-btn" onClick={() => editProduct(p)}>Edit</button>
                              <button className="adm-btn danger" onClick={() => deleteProduct(p)}>Delete</button>
                            </div></td>
                          </tr>
                        ))}
                        {visibleProducts.length === 0 && <tr><td colSpan="5" className="adm-empty">No products found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, label, value, hint }) {
  return (
    <article className="adm-stat">
      <span className="adm-stat-icon">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function PanelHead({ title, subtitle, action }) {
  return (
    <div className="adm-panel-head">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action}
    </div>
  );
}

function OrderTable({ orders, busyOrder, onStatusChange }) {
  if (!orders.length) return <div className="adm-empty">No orders found.</div>;

  return (
    <div className="adm-table-wrap">
      <table>
        <thead><tr><th>Bill</th><th>Customer</th><th>Date</th><th>Amount</th><th>Items</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>
          {orders.map((order) => {
            const status = order.status || 'Completed';
            return (
              <tr key={order.id}>
                <td><Link className="adm-link" to={`/bills/${order.id}`}>{order.bill_number}</Link></td>
                <td>
                  <strong>{order.customer_name || 'Walk-in customer'}</strong>
                  {order.customer_phone && <div style={{ color: C.muted, marginTop: 4 }}>{order.customer_phone}</div>}
                </td>
                <td>{dateText(order.created_at)}</td>
                <td>{money(order.grand_total)}</td>
                <td>{order.item_count ?? 0}</td>
                <td><span className={`adm-pill ${status.toLowerCase()}`}>{status}</span></td>
                <td>
                  <select
                    aria-label={`Update status for ${order.bill_number}`}
                    value={status}
                    disabled={busyOrder === order.id}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
