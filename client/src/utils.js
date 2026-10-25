import { GST_PERCENT } from './config.js';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
export const money = (n) => inr.format(Number(n) || 0);

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

// Integer-paise arithmetic so totals never drift. Mirrors the server calculation.
export function calcTotals(lines) {
  const subtotal = lines.reduce((s, l) => s + Math.round(l.price * 100) * l.quantity, 0);
  const gst = Math.round((subtotal * GST_PERCENT) / 100);
  return { subtotal: subtotal / 100, gst: gst / 100, grand: (subtotal + gst) / 100 };
}
