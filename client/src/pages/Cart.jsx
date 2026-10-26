
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { money } from '../utils.js';
import { GST_PERCENT, SHOP } from '../config.js';
import { STYLES } from './Landing.jsx';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';

const IMAGES = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
  tomato: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=500&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
  egg: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=500&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
  orange: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80',
};

function getImage(product) {
  const saved = product.imageUrl || product.image_url || product.image;

  if (typeof saved === 'string' && /^https?:\/\//i.test(saved)) {
    return saved;
  }

  const name = String(product.name || '').toLowerCase();

  for (const key of Object.keys(IMAGES)) {
    if (name.includes(key)) return IMAGES[key];
  }

  return FALLBACK_IMAGE;
}

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  const gst = Math.round(subtotal * Number(GST_PERCENT) * 100) / 10000;
  const grandTotal = Math.round((subtotal + gst) * 100) / 100;

  return (
    <main className="lp">
      <style>{STYLES}</style>
      <style>{`
        .fc-cart-layout {
          display:grid;
          grid-template-columns:minmax(0,1fr) 330px;
          gap:24px;
          align-items:start;
        }
        .fc-cart-list { display:grid; gap:14px; }
        .fc-cart-item {
          display:grid;
          grid-template-columns:110px minmax(0,1fr);
          gap:16px;
          padding:15px;
          border:1px solid rgba(255,255,255,.22);
          border-radius:17px;
          background:rgba(255,255,255,.1);
          color:white;
        }
        .fc-cart-item img {
          width:110px;
          height:110px;
          object-fit:cover;
          border-radius:12px;
        }
        .fc-cart-item h3 { color:white; margin:7px 0; }
        .fc-cart-item p { margin:5px 0 12px; }
        .fc-cart-price { color:#c6ff68; font-weight:800; }
        .fc-cart-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
          gap:12px;
        }
        .fc-quantity { display:flex; align-items:center; gap:12px; }
        .fc-quantity button {
          width:34px;
          height:34px;
          border:1px solid rgba(255,255,255,.3);
          border-radius:9px;
          background:rgba(255,255,255,.12);
          color:white;
          font-size:20px;
          cursor:pointer;
        }
        .fc-quantity button:disabled { opacity:.4; cursor:not-allowed; }
        .fc-remove {
          border:0;
          background:transparent;
          color:#ffd0ca;
          cursor:pointer;
          text-decoration:underline;
        }
        .fc-summary {
          padding:22px;
          border:1px solid rgba(255,255,255,.22);
          border-radius:18px;
          background:rgba(4,45,37,.8);
          color:white;
        }
        .fc-summary h2 { color:white; margin-top:0; }
        .fc-summary-row {
          display:flex;
          justify-content:space-between;
          gap:12px;
          margin:16px 0;
        }
        .fc-grand {
          padding-top:15px;
          border-top:1px solid rgba(255,255,255,.25);
          color:#c6ff68;
          font-size:18px;
          font-weight:850;
        }
        .fc-cart-btn {
          display:flex;
          align-items:center;
          justify-content:center;
          width:100%;
          box-sizing:border-box;
          margin-top:16px;
          padding:13px 16px;
          border:1px solid #16834a;
          border-radius:11px;
          background:#16834a;
          color:white;
          font:inherit;
          font-weight:750;
          text-align:center;
          text-decoration:none;
          cursor:pointer;
        }
        .fc-cart-btn.secondary {
          border-color:rgba(255,255,255,.3);
          background:transparent;
        }
        .fc-empty {
          padding:45px 20px;
          border:1px solid rgba(255,255,255,.2);
          border-radius:18px;
          background:rgba(255,255,255,.08);
          color:white;
          text-align:center;
        }
        .fc-empty h2 { color:white; }
        @media(max-width:850px) {
          .fc-cart-layout { grid-template-columns:1fr; }
        }
        @media(max-width:480px) {
          .fc-cart-item { grid-template-columns:82px minmax(0,1fr); gap:12px; padding:11px; }
          .fc-cart-item img { width:82px; height:90px; }
          .fc-cart-item h3 { font-size:15px; }
        }
      `}</style>

      <section className="lp-container lp-section">
        <div className="lp-section-head">
          <div>
            <span className="lp-eyebrow">{SHOP.name}</span>
            <h2>Your Shopping Cart</h2>
            <p>{totalItems} item{totalItems === 1 ? '' : 's'} in your cart</p>
          </div>
          <Link to="/products" className="lp-btn lp-btn-glass">
            ← Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="fc-empty">
            <div style={{ fontSize: 48 }}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add products from the FreshCart products page.</p>
            <Link to="/products" className="fc-cart-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="fc-cart-layout">
            <div className="fc-cart-list">
              {cartItems.map((product) => {
                const id = String(product.id ?? product.product_id ?? '');
                const quantity = Number(product.quantity || 0);
                const stock = Number(product.stock ?? product.stock_quantity ?? 0);

                return (
                  <article className="fc-cart-item" key={id}>
                    <img
                      src={getImage(product)}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <div>
                      <span>{product.category || 'Fresh groceries'}</span>
                      <h3>{product.name}</h3>
                      <p className="fc-cart-price">{money(product.price)} each</p>

                      <div className="fc-cart-row">
                        <div className="fc-quantity">
                          <button
                            type="button"
                            disabled={quantity <= 1}
                            aria-label={`Decrease ${product.name}`}
                            onClick={() => updateQuantity(id, quantity - 1)}
                          >
                            −
                          </button>
                          <strong>{quantity}</strong>
                          <button
                            type="button"
                            disabled={quantity >= stock}
                            aria-label={`Increase ${product.name}`}
                            onClick={() => updateQuantity(id, quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <strong>{money(Number(product.price) * quantity)}</strong>

                        <button
                          type="button"
                          className="fc-remove"
                          onClick={() => removeFromCart(id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              <button
                type="button"
                className="fc-cart-btn secondary"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            <aside className="fc-summary">
              <h2>Order Summary</h2>

              <div className="fc-summary-row">
                <span>Total items</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="fc-summary-row">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className="fc-summary-row">
                <span>GST ({GST_PERCENT}%)</span>
                <strong>{money(gst)}</strong>
              </div>
              <div className="fc-summary-row fc-grand">
                <span>Grand Total</span>
                <span>{money(grandTotal)}</span>
              </div>

             <Link
  to="/checkout"
  className="fc-cart-btn"
  style={{
    opacity: cartItems.length === 0 ? 0.5 : 1,
    pointerEvents: cartItems.length === 0 ? 'none' : 'auto',
  }}
>
  Proceed to Checkout →
</Link>

              <p style={{ fontSize: 12, lineHeight: 1.6 }}>
                This is the shopping cart. The Billing page is a separate
                feature and generates bills through the existing backend.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
