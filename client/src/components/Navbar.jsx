
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { SHOP } from '../config.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logout();
      navigate('/login', {
        replace: true,
        state: { success: 'You have been logged out.' },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fc-navbar no-print">
      <style>{`
        .fc-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #e6ece7;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .fc-nav-inner {
          width: 100%;
          max-width: 1180px;
          min-height: 76px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .fc-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          flex-shrink: 0;
          color: #17251c;
          text-decoration: none;
          font-size: 22px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .fc-brand-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          border-radius: 14px;
          background: #16834a;
          color: white;
          font-size: 23px;
          box-shadow: 0 5px 15px #16834a24;
        }

        .fc-nav-links {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
        }

        .fc-nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 13px;
          border-radius: 10px;
          color: #637067;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background .18s ease, color .18s ease;
        }

        .fc-nav-link:hover {
          background: #f0f7f1;
          color: #16834a;
        }

        .fc-nav-link.active {
          background: #eaf7ee;
          color: #16834a;
        }

        .fc-nav-user {
          max-width: 150px;
          overflow: hidden;
          margin-left: 5px;
          padding: 10px 12px;
          border-left: 1px solid #e6ece7;
          color: #34463a;
          font-size: 12px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fc-nav-button {
          min-height: 39px;
          padding: 9px 15px;
          border: 1px solid #dce7de;
          border-radius: 10px;
          background: white;
          color: #34463a;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: background .18s ease, color .18s ease;
        }

        .fc-nav-button:hover {
          border-color: #16834a;
          background: #f0f7f1;
          color: #16834a;
        }

        .fc-nav-button:disabled {
          cursor: wait;
          opacity: .6;
        }

        .fc-nav-signup {
          border-color: #16834a;
          background: #16834a;
          color: white;
        }

        .fc-nav-signup:hover {
          border-color: #11683b;
          background: #11683b;
          color: white;
        }

        .fc-nav-auth {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        @media (max-width: 760px) {
          .fc-nav-inner {
            min-height: auto;
            padding: 13px 16px;
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .fc-nav-links {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 5px;
          }

          .fc-nav-link {
            padding: 9px 10px;
            font-size: 12px;
          }

          .fc-nav-user {
            max-width: 115px;
            margin-left: auto;
            padding: 8px;
          }
        }

        @media (max-width: 420px) {
          .fc-brand { font-size: 20px; }
          .fc-nav-inner { gap: 10px; }
          .fc-nav-links { gap: 3px; }
          .fc-nav-link { padding: 8px; }
          .fc-nav-user { display: none; }
          .fc-nav-button { padding: 8px 11px; }
        }
      `}</style>

      <div className="fc-nav-inner">
        <Link to="/" className="fc-brand">
          <span className="fc-brand-icon" aria-hidden="true">
            🛒
          </span>
          <span>{SHOP.name}</span>
        </Link>

        <nav className="fc-nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `fc-nav-link${isActive ? ' active' : ''}`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/pos"
                className={({ isActive }) =>
                  `fc-nav-link${isActive ? ' active' : ''}`
                }
              >
                Billing
              </NavLink>

              <NavLink
                to="/bills"
                className={({ isActive }) =>
                  `fc-nav-link${isActive ? ' active' : ''}`
                }
              >
                Bills
              </NavLink>

              <span className="fc-nav-user" title={user.fullName}>
                Hi, {user.fullName}
              </span>

              <button
                type="button"
                className="fc-nav-button"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="fc-nav-auth">
              <Link to="/login" className="fc-nav-button">
                Login
              </Link>

              <Link
                to="/signup"
                className="fc-nav-button fc-nav-signup"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
