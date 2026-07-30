import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-vault-950/85 backdrop-blur-xl border-b border-brass-600/20 sticky top-0 z-50 shadow-[0_1px_0_0_rgba(201,162,39,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="group flex items-center gap-2.5"
          >
            <svg
              className="w-8 h-8 text-brass-400 transition-transform duration-500 group-hover:rotate-45"
              viewBox="0 0 32 32"
              fill="none"
            >
              <circle cx="16" cy="16" r="11.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="16" cy="16" r="2.2" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="16" y1="6.2" x2="16" y2="8.6" />
                <line x1="16" y1="23.4" x2="16" y2="25.8" />
                <line x1="6.2" y1="16" x2="8.6" y2="16" />
                <line x1="23.4" y1="16" x2="25.8" y2="16" />
              </g>
              <line x1="16" y1="16" x2="20.5" y2="12.2" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span className="font-display italic font-semibold text-2xl tracking-tight text-brass-300 group-hover:text-brass-200 transition-colors">
              AutoVault
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/vehicles/new"
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-brass-500 hover:bg-brass-400 text-vault-950 text-sm font-semibold rounded-md transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Vehicle
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-vault-100">{user?.name}</p>
                    <p className="ledger-label text-[10px] text-brass-500/80">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm text-vault-300 hover:text-oxblood-300 hover:bg-oxblood-600/10 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-vault-300 hover:text-brass-300 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brass-500 hover:bg-brass-400 text-vault-950 text-sm font-semibold rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
