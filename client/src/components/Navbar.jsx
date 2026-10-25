import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { SHOP } from '../config.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true, state: { success: 'You have been logged out.' } });
  };

  return (
    <header className="navbar no-print">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span aria-hidden="true">🛒</span> {SHOP.name}
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/pos">Billing</NavLink>
              <NavLink to="/bills">Bills</NavLink>
              <span className="nav-user">{user.fullName}</span>
              <button className="btn btn-outline btn-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
