// src/components/Navbar.jsx

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A simple search icon component
const SearchIcon = () => (
    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );

// A simple cart icon component
const CartIcon = () => (
  <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left Side: Logo/Brand (no changes) */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-gray-800 font-serif text-2xl font-bold">
              RecipeApp
            </Link>
          </div>

          {/* Center: Search Bar (no changes) */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            {/* ... search bar jsx ... */}
          </div>

          {/* Right Side: Navigation & Auth */}
          <div className="flex items-center space-x-6">
            {/* --- THE LOGIC CHANGE IS HERE --- */}
            {user && (
              // If a user is logged in, show the main app navigation links
              <>
                <NavLink to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Shop
                </NavLink>
                <NavLink to="/my-recipes" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  My Recipes
                </NavLink>
                {/* 👇 NEW LINK ADDED HERE 👇 */}
                <NavLink to="/plan" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Meal Plan
                </NavLink>
              </>
            )}
            
            {/* Conditional Auth Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600 hidden lg:block">
                  {user.email}
                </span>
                <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-900">
                  Logout
                </button>
              </div>
            ) : (
              // If no user, only show a simple Login link
              <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Login
              </NavLink>
            )}

            {/* Cart Button (no changes) */}
            <button className="flex items-center space-x-2 bg-red-200 text-red-800 font-bold px-4 py-2 rounded-full text-sm">
              <CartIcon />
              <span>0</span>
              <span>INCOMPLETE</span>
            </button>
          </div>

        </div>
      </nav>
    </header>
  );
}