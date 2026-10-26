
import { useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { user, login, googleLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const success = location.state?.success;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const redirectAfterLogin = () => {
    navigate(location.state?.from || '/dashboard', {
      replace: true,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Invalid email or password');
      return;
    }

    setBusy(true);

    try {
      await login(email.trim(), password);
      redirectAfterLogin();
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    setError('');

    if (!response?.credential) {
      setError('Google sign-in did not return a credential.');
      return;
    }

    setBusy(true);

    try {
      await googleLogin(response.credential);
      redirectAfterLogin();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container auth-wrap">
      <form
        className="card auth-card"
        onSubmit={onSubmit}
        noValidate
      >
        <h1>Staff login</h1>

        {success && (
          <p className="alert alert-success">{success}</p>
        )}

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={busy}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={busy}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={busy}
        >
          {busy ? 'Please wait...' : 'Login'}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '22px 0',
          }}
        >
          <span
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--border, #ddd)',
            }}
          />
          <span className="muted">OR</span>
          <span
            style={{
              flex: 1,
              height: '1px',
              background: 'var(--border, #ddd)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            opacity: busy ? 0.6 : 1,
            pointerEvents: busy ? 'none' : 'auto',
          }}
        >
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {
              setError('Google sign-in failed. Please try again.');
            }}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
          />
        </div>

        <p className="muted center" style={{ marginTop: '20px' }}>
          New staff member? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
