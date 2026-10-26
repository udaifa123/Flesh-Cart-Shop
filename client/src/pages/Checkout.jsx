import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../CartContext.jsx';
import { money } from '../utils.js';
import { GST_PERCENT, SHOP } from '../config.js';
import { STYLES } from './Landing.jsx';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, subtotal } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gst = Math.round(
    subtotal * Number(GST_PERCENT) * 100
  ) / 10000;

  const grandTotal = Math.round(
    (subtotal + gst) * 100
  ) / 100;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!cartItems.length) {
      setError('Your cart is empty. Please add products first.');
      return;
    }

    if (customerPhone.trim() && !/^[+]?[\d\s()-]{7,20}$/.test(customerPhone.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const result = await api('/bills', {
        method: 'POST',
        body: {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          items: cartItems.map((item) => ({
            productId: Number(item.id ?? item.product_id),
            quantity: Number(item.quantity),
          })),
        },
      });

      if (!result?.bill?.id) {
        throw new Error('Bill was created, but its ID was not returned.');
      }

      clearCart();

      navigate(`/bills/${result.bill.id}`, {
        replace: true,
        state: { justCreated: true },
      });
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp">
      <style>{STYLES}</style>

      <style>{`
        .fc-checkout-grid {
          display:grid;
          grid-template-columns:minmax(0,1fr) 350px;
          gap:24px;
          align-items:start;
        }
        .fc-checkout-card {
          padding:24px;
          border:1px solid rgba(255,255,255,.2);
          border-radius:18px;
          background:rgba(255,255,255,.09);
          color:white;
        }
        .fc-checkout-card h2 { color:white; margin-top:0; }
        .fc-checkout-field { display:grid; gap:7px; margin:18px 0; }
        .fc-checkout-field label { font-weight:650; }
        .fc-checkout-field input {
          width:100%;
          box-sizing:border-box;
          padding:13px;
          border:1px solid rgba(255,255,255,.25);
          border-radius:10px;
          background:rgba(0,0,0,.18);
          color:white;
          font:inherit;
        }
        .fc-checkout-field input::placeholder { color:rgba(255,255,255,.65); }
        .fc-checkout-total {
          display:flex;
          justify-content:space-between;
          gap:12px;
          margin:16px 0;
        }
        .fc-checkout-grand {
          padding-top:16px;
          border-top:1px solid rgba(255,255,255,.25);
          color:#c6ff68;
          font-size:19px;
          font-weight:800;
        }
        .fc-checkout-submit {
          width:100%;
          padding:14px;
          border:0;
          border-radius:11px;
          background:#16834a;
          color:white;
          font:inherit;
          font-weight:800;
          cursor:pointer;
        }
        .fc-checkout-submit:disabled { opacity:.6; cursor:not-allowed; }
        .fc-checkout-error {
          padding:12px;
          border-radius:10px;
          background:rgba(150,20,20,.25);
          color:#ffe0dd;
        }
        .fc-checkout-product {
          display:flex;
          justify-content:space-between;
          gap:12px;
          margin:12px 0;
        }
        @media(max-width:800px) {
          .fc-checkout-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <section className="lp-container lp-section">
        <div className="lp-section-head">
          <div>
            <span className="lp-eyebrow">{SHOP.name}</span>
            <h2>Checkout</h2>
            <p>Confirm your details and create your bill.</p>
          </div>

          <Link to="/cart" className="lp-btn lp-btn-glass">
            ← Back to Cart
          </Link>
        </div>

        {!cartItems.length ? (
          <div className="fc-checkout-card">
            <h2>Your cart is empty</h2>
            <p>Add some products before checkout.</p>
            <Link to="/products" className="lp-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="fc-checkout-grid">
            <form className="fc-checkout-card" onSubmit={handleSubmit}>
              <h2>Customer Details</h2>

              <div className="fc-checkout-field">
                <label htmlFor="customerName">Customer name</label>
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  maxLength={100}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="fc-checkout-field">
                <label htmlFor="customerPhone">Phone number</label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  maxLength={20}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              {error && (
                <p className="fc-checkout-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="fc-checkout-submit"
                type="submit"
                disabled={loading || !cartItems.length}
              >
                {loading ? 'Creating Bill…' : 'Confirm Order & Create Bill'}
              </button>

              <p style={{ fontSize: 12, lineHeight: 1.6 }}>
                GST and final totals are recalculated by the server.
                Stock is checked and updated when the bill is saved.
              </p>
            </form>

            <aside className="fc-checkout-card">
              <h2>Order Summary</h2>

              {cartItems.map((item) => (
                <div
                  className="fc-checkout-product"
                  key={String(item.id ?? item.product_id)}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <strong>
                    {money(Number(item.price) * Number(item.quantity))}
                  </strong>
                </div>
              ))}

              <div className="fc-checkout-total">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>

              <div className="fc-checkout-total">
                <span>GST ({GST_PERCENT}%)</span>
                <strong>{money(gst)}</strong>
              </div>

              <div className="fc-checkout-total fc-checkout-grand">
                <span>Total</span>
                <span>{money(grandTotal)}</span>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}