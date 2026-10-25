import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Receipt from '../components/Receipt.jsx';

export default function BillView() {
  const { id } = useParams();
  const location = useLocation();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setBill(null);
    api(`/bills/${id}`)
      .then((d) => setBill(d.bill))
      .catch((e) => setError(e.status === 404 ? 'Bill not found.' : e.message));
  }, [id]);

  return (
    <main className="container section">
      <div className="action-row no-print">
        <Link to="/pos" className="btn btn-primary">
          New bill
        </Link>
        <Link to="/bills" className="btn btn-outline">
          Bill history
        </Link>
        {bill && (
          <button className="btn btn-outline" onClick={() => window.print()}>
            Print
          </button>
        )}
      </div>
      {location.state?.justCreated && bill && (
        <p className="alert alert-success no-print">Bill {bill.bill_number} saved.</p>
      )}
      {error && <p className="alert alert-error">{error}</p>}
      {!bill && !error && <p className="muted">Loading receipt…</p>}
      {bill && <Receipt bill={bill} />}
    </main>
  );
}
