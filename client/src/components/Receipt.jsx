
import { SHOP } from '../config.js';
import { formatDate, money } from '../utils.js';

const printStyles = `
  .thermal-receipt {
    box-sizing: border-box;
    width: 100%;
    max-width: 380px;
    margin: 24px auto;
    padding: 20px;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .thermal-receipt * {
    box-sizing: border-box;
  }

  .thermal-receipt .receipt-header,
  .thermal-receipt .receipt-footer {
    text-align: center;
  }

  .thermal-receipt .receipt-header h2 {
    margin: 0 0 6px;
    font-size: 20px;
    text-transform: uppercase;
  }

  .thermal-receipt p {
    margin: 3px 0;
  }

  .thermal-receipt .receipt-tagline {
    margin-top: 8px;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .thermal-receipt .receipt-divider {
    border-top: 1px dashed #000;
    margin: 12px 0;
  }

  .thermal-receipt .receipt-meta {
    display: grid;
    gap: 5px;
  }

  .thermal-receipt .receipt-meta > div,
  .thermal-receipt .receipt-totals > div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .thermal-receipt .receipt-meta > div > :last-child {
    text-align: right;
  }

  .thermal-receipt .thermal-items {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 11px;
  }

  .thermal-receipt .thermal-items th,
  .thermal-receipt .thermal-items td {
    padding: 6px 2px;
    border: 0;
    color: #000;
    vertical-align: top;
  }

  .thermal-receipt .thermal-items thead {
    border-bottom: 1px solid #000;
  }

  .thermal-receipt .item-name {
    width: 54%;
    text-align: left;
  }

  .thermal-receipt .item-qty {
    width: 12%;
    text-align: center;
  }

  .thermal-receipt .item-amount {
    width: 34%;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .thermal-receipt .item-name span,
  .thermal-receipt .item-name small {
    display: block;
  }

  .thermal-receipt .item-name small {
    margin-top: 3px;
    font-size: 10px;
  }

  .thermal-receipt .receipt-totals {
    display: grid;
    gap: 7px;
  }

  .thermal-receipt .receipt-grand {
    border-top: 1px solid #000;
    padding-top: 9px;
    font-size: 14px;
    font-weight: bold;
  }

  .thermal-receipt .receipt-end {
    margin-top: 14px;
    font-weight: bold;
    letter-spacing: 1px;
  }


@media print {
  @page {
    size: 80mm auto;
    margin: 0;
  }

  html,
  body,
  #root {
    width: 80mm !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  body * {
    visibility: hidden !important;
  }

  #receipt,
  #receipt * {
    visibility: visible !important;
  }

  #receipt {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 74mm !important;
    max-width: 74mm !important;
    margin: 0 !important;
    padding: 2mm !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
    color: #000 !important;
    font-size: 11px !important;
  }

  #receipt .thermal-items {
    width: 100% !important;
    table-layout: fixed !important;
  }

  #receipt tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .no-print {
    display: none !important;
  }
}
`;

export default function Receipt({ bill }) {
  if (!bill) return null;

  return (
    <>
      <style>{printStyles}</style>

      <article className="thermal-receipt receipt" id="receipt">
        <header className="receipt-header">
          <h2>{SHOP.name}</h2>
          <p>{SHOP.address}</p>
          <p>Phone: {SHOP.phone}</p>
          <p className="receipt-tagline">GROCERY STORE</p>
        </header>

        <div className="receipt-divider" />

        <section className="receipt-meta">
          <div>
            <span>Bill No:</span>
            <strong>{bill.bill_number}</strong>
          </div>

          <div>
            <span>Date:</span>
            <span>{formatDate(bill.created_at)}</span>
          </div>

          {bill.customer_name && (
            <div>
              <span>Customer:</span>
              <span>{bill.customer_name}</span>
            </div>
          )}

          {bill.customer_phone && (
            <div>
              <span>Phone:</span>
              <span>{bill.customer_phone}</span>
            </div>
          )}

          {bill.billed_by && (
            <div>
              <span>Cashier:</span>
              <span>{bill.billed_by}</span>
            </div>
          )}
        </section>

        <div className="receipt-divider" />

        <table className="thermal-items">
          <thead>
            <tr>
              <th className="item-name">Item</th>
              <th className="item-qty">Qty</th>
              <th className="item-amount">Amount</th>
            </tr>
          </thead>

          <tbody>
            {(bill.items || []).map((item, index) => (
              <tr key={item.id ?? `${item.product_name}-${index}`}>
                <td className="item-name">
                  <span>{item.product_name}</span>
                  <small>
                    {money(item.unit_price)} x {item.quantity}
                  </small>
                </td>
                <td className="item-qty">{item.quantity}</td>
                <td className="item-amount">
                  {money(item.line_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-divider" />

        <section className="receipt-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(bill.subtotal)}</span>
          </div>

          <div>
            <span>GST ({bill.gstPercent ?? 5}%)</span>
            <span>{money(bill.gst_amount)}</span>
          </div>

          <div className="receipt-grand">
            <strong>GRAND TOTAL</strong>
            <strong>{money(bill.grand_total)}</strong>
          </div>
        </section>

        <div className="receipt-divider" />

        <footer className="receipt-footer">
          <p>Thank you for shopping with us!</p>
          <p>Please visit again.</p>
          <p className="receipt-end">*** CUSTOMER COPY ***</p>
        </footer>
      </article>
    </>
  );
}
