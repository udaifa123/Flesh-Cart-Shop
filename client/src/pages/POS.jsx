import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { calcTotals, money } from '../utils.js';
import { GST_PERCENT } from '../config.js';

export default function POS() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({}); // productId -> quantity
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api('/products');
      setProducts(d.products);
      // keep cart quantities within the latest stock
      setCart((c) => {
        const next = {};
        for (const p of d.products) if (c[p.id]) next[p.id] = Math.min(c[p.id], p.stock);
        return Object.fromEntries(Object.entries(next).filter(([, q]) => q > 0));
      });
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => ({ product: byId.get(Number(id)), quantity }))
        .filter((l) => l.product)
        .map((l) => ({ ...l, price: l.product.price, lineTotal: Math.round(l.product.price * 100 * l.quantity) / 100 })),
    [cart, byId]
  );
  const totals = calcTotals(lines);
  const visible = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const setQty = (p, qty) => {
    setNotice('');
    if (qty > p.stock) {
      setNotice(`Cannot add more than the available stock (${p.stock} of ${p.name}).`);
      return;
    }
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[p.id];
      else next[p.id] = qty;
      return next;
    });
  };

  const generate = async () => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const d = await api('/bills', {
        method: 'POST',
        body: {
          customerName,
          customerPhone,
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        },
      });
      setCart({});
      navigate(`/bills/${d.bill.id}`, { state: { justCreated: true } });
    } catch (e) {
      setError(e.message);
      if (e.status === 409 || e.status === 400) load(); // refresh stock figures
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container section pos">
      <div className="pos-products">
        <h1>Billing</h1>
        <input
          className="search"
          type="search"
          placeholder="Search products by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <div className="grid grid-sm">
          {visible.map((p) => (
            <button
              key={p.id}
              className="card product-btn"
              disabled={p.stock === 0}
              onClick={() => setQty(p, (cart[p.id] || 0) + 1)}
            >
              <span className="product-emoji" aria-hidden="true">
                {p.emoji}
              </span>
              <span className="p-name">{p.name}</span>
              <span className="price">{money(p.price)}</span>
              <span className={`stock ${p.stock < 5 ? 'stock-low' : ''}`}>
                {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
              </span>
            </button>
          ))}
        </div>
        {visible.length === 0 && <p className="muted">No products match "{search}".</p>}
      </div>

      <aside className="card cart">
        <h2>Cart</h2>
        {notice && <p className="alert alert-warn">{notice}</p>}
        {error && <p className="alert alert-error">{error}</p>}
        {lines.length === 0 ? (
          <p className="muted">Cart is empty. Tap a product to add it.</p>
        ) : (
          <ul className="cart-lines">
            {lines.map((l) => (
              <li key={l.product.id}>
                <div className="cart-top">
                  <span>{l.product.name}</span>
                  <strong>{money(l.lineTotal)}</strong>
                </div>
                <div className="cart-bottom">
                  <span className="muted">{money(l.price)} each</span>
                  <div className="qty">
                    <button aria-label={`Decrease ${l.product.name}`} onClick={() => setQty(l.product, l.quantity - 1)}>
                      −
                    </button>
                    <span>{l.quantity}</span>
                    <button aria-label={`Increase ${l.product.name}`} onClick={() => setQty(l.product, l.quantity + 1)}>
                      +
                    </button>
                    <button className="remove" onClick={() => setQty(l.product, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          <div>
            <span>GST ({GST_PERCENT}%)</span>
            <span>{money(totals.gst)}</span>
          </div>
          <div className="grand">
            <span>Grand total</span>
            <span>{money(totals.grand)}</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="cn">Customer name (optional)</label>
          <input id="cn" value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="cp">Customer phone (optional)</label>
          <input id="cp" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy || lines.length === 0} onClick={generate}>
          {busy ? 'Saving bill…' : 'Generate bill'}
        </button>
        {lines.length > 0 && (
          <button className="btn btn-outline btn-block" onClick={() => setCart({})} disabled={busy}>
            Clear cart
          </button>
        )}
      </aside>
    </main>
  );
}
