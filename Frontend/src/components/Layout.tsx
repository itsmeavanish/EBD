import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  console.log('Current user in Layout:', user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">TheEBD</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-md'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Home
                </NavLink>
                
                {user ? (
                  <>
                    <NavLink
                      to="/forms"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                        }`
                      }
                    >
                      Forms
                    </NavLink>
                    
                    {user.role === 'admin' && 
                    <NavLink
                      to="/allot-orders"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                        }`
                      }
                    >
                      Allot Orders
                    </NavLink>
                    }
                    <NavLink
                      to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 shadow-md'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  </>
                ) : (
                  <NavLink
                    to="/auth"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-md'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    Sign In
                  </NavLink>
                )}
              </div>
            </div>

            {/* User Menu */}
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/50 rounded-lg">
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-purple-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="bg-gray-100 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;