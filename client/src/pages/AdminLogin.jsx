
import { useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function AdminLogin() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Wait until the existing session has been checked.
  if (loading) {
    return (
      <main className="container auth-wrap">
        <div className="card auth-card">
          Checking session...
        </div>
      </main>
    );
  }

  // Already logged-in admin can open the admin dashboard.
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your admin email and password.');
      return;
    }

    setBusy(true);

    try {
      const loggedInUser = await login(email.trim(), password);

      if (loggedInUser?.role !== 'admin') {
        setError('This account does not have administrator access.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Staff users should use the staff dashboard, not admin login.
  if (user && user.role !== 'admin') {
    return (
      <main className="container auth-wrap">
        <section className="card auth-card">
          <h1>Admin access required</h1>
          <p className="muted">
            You are currently logged in as a staff user.
            Log out of the staff account before signing in as an admin.
          </p>
          <Link className="btn btn-primary btn-block" to="/dashboard">
            Go to staff dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container auth-wrap">
      <form
        className="card auth-card"
        onSubmit={onSubmit}
        noValidate
      >
        <div
          style={{
            width: 52,
            height: 52,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 14,
            background: '#C9A227',
            color: '#080B14',
            fontWeight: 900,
            fontSize: 20,
            marginBottom: 20,
          }}
        >
          FC
        </div>

        <p
          style={{
            color: '#C9A227',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          FRESHCART MANAGEMENT
        </p>

        <h1>Admin Login</h1>

        <p className="muted">
          Sign in to manage products, inventory and orders.
        </p>

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="admin-email">Admin email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="admin@example.com"
            disabled={busy}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter admin password"
            disabled={busy}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={busy}
        >
          {busy ? 'Please wait...' : 'Sign in to Admin'}
        </button>

        <p className="muted center" style={{ marginTop: 22 }}>
          Staff member? <Link to="/login">Go to staff login</Link>
        </p>
      </form>
    </main>
  );
}
