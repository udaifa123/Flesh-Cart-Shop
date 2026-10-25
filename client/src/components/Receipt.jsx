import { SHOP } from '../config.js';
import { formatDate, money } from '../utils.js';

export default function Receipt({ bill }) {
  return (
    <article className="receipt" id="receipt">
      <h2>{SHOP.name}</h2>
      <p className="muted center">
        {SHOP.address}
        <br />
        Phone: {SHOP.phone}
      </p>
      <hr />
      <dl className="receipt-meta">
        <div>
          <dt>Bill no.</dt>
          <dd>{bill.bill_number}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(bill.created_at)}</dd>
        </div>
        {bill.customer_name && (
          <div>
            <dt>Customer</dt>
            <dd>{bill.customer_name}</dd>
          </div>
        )}
        {bill.customer_phone && (
          <div>
            <dt>Phone</dt>
            <dd>{bill.customer_phone}</dd>
          </div>
        )}
        {bill.billed_by && (
          <div>
            <dt>Billed by</dt>
            <dd>{bill.billed_by}</dd>
          </div>
        )}
      </dl>
      <table className="table receipt-table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.product_name}</td>
              <td className="num">{i.quantity}</td>
              <td className="num">{money(i.unit_price)}</td>
              <td className="num">{money(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <div>
          <span>Subtotal</span>
          <span>{money(bill.subtotal)}</span>
        </div>
        <div>
          <span>GST ({bill.gstPercent}%)</span>
          <span>{money(bill.gst_amount)}</span>
        </div>
        <div className="grand">
          <span>Grand total</span>
          <span>{money(bill.grand_total)}</span>
        </div>
      </div>
      <p className="muted center">Thank you for shopping with us!</p>
    </article>
  );
}
