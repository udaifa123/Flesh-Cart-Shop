
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
    let active = true;

    setBill(null);
    setError('');

    api(`/bills/${id}`)
      .then((data) => {
        if (active) setBill(data.bill);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.status === 404
              ? 'Bill not found.'
              : err.message || 'Unable to load bill.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handlePrint = () => {
    if (bill) window.print();
  };

  return (
    <main className="container section">
      <div className="action-row no-print">
        <Link to="/pos" className="btn btn-primary">
          New Bill
        </Link>

        <Link to="/bills" className="btn btn-outline">
          Bill History
        </Link>

        {bill && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handlePrint}
          >
            Print Thermal Receipt
          </button>
        )}
      </div>

      {location.state?.justCreated && bill && (
        <p className="alert alert-success no-print">
          Bill {bill.bill_number} saved successfully!
        </p>
      )}

      {error && (
        <p className="alert alert-error no-print">{error}</p>
      )}

      {!bill && !error && (
        <p className="muted no-print">Loading receipt...</p>
      )}

      {bill && <Receipt bill={bill} />}
    </main>
  );
}
