import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, money } from '../utils.js';

export default function Bills() {
  const navigate = useNavigate();
  const [bills, setBills] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/bills')
      .then((d) => setBills(d.bills))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="container section">
      <h1>Bill history</h1>
      {error && <p className="alert alert-error">{error}</p>}
      {!bills && !error && <p className="muted">Loading bills…</p>}
      {bills && bills.length === 0 && (
        <p className="card">
          No bills yet. <Link to="/pos">Create the first bill</Link>.
        </p>
      )}
      {bills && bills.length > 0 && (
        <div className="table-wrap card">
          <table className="table clickable">
            <thead>
              <tr>
                <th>Bill number</th>
                <th>Date</th>
                <th className="num">Items</th>
                <th className="num">Grand total</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} onClick={() => navigate(`/bills/${b.id}`)}>
                  <td>
                    <Link to={`/bills/${b.id}`}>{b.bill_number}</Link>
                  </td>
                  <td>{formatDate(b.created_at)}</td>
                  <td className="num">{b.item_count}</td>
                  <td className="num">{money(b.grand_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
