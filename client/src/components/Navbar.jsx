import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/10 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <Compass className="text-blue-400" />
          Traveloop
        </Link>
        
        {isAuthenticated && (
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <Link to="/" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/destinations" className="hover:text-white transition-colors">Destinations</Link>
            <Link to="/planner" className="hover:text-white transition-colors">Trip Planner</Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white font-medium py-2">
                Log In
              </Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
