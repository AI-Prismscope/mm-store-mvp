// src/components/Navbar.jsx

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
  const { cartItemCount, addItemToCart } = useCart();
  const navigate = useNavigate();

  // --- NEW STATE for Search ---
  const [query, setQuery] = useState('');                 // The text in the input box
  const [results, setResults] = useState([]);             // The results for the preview dropdown
  const [isSearching, setIsSearching] = useState(false);  // A loading state for the preview

  // --- NEW EFFECT for Debounced Search ---
  useEffect(() => {
    // Don't search if the query is empty
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // This is our debounce timer. We'll wait 300ms after the user stops typing.
    const searchTimer = setTimeout(() => {
      fetch(`/.netlify/functions/product-search?q=${query}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
        })
        .catch(err => console.error("Search preview error:", err))
        .finally(() => setIsSearching(false));
    }, 300);

    // Cleanup function: This cancels the timer if the user types again
    return () => clearTimeout(searchTimer);

  }, [query]); // This effect re-runs every time the `query` state changes

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setResults([]); // Clear the preview results
      setQuery('');     // Clear the search bar
      navigate(`/search?q=${query}`);
    }
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart(product.id);
    alert(`${product.name} added to cart!`);
    setResults([]); // Close preview after adding
    setQuery('');   // Clear the search bar
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

          {/* Center: Search Bar with Live Preview */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <form onSubmit={handleSearchSubmit}>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Search for products..."
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </form>
              
              {/* The Live Search Preview Dropdown */}
              {query && (results.length > 0 || isSearching) && (
                <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-50 border">
                  <ul className="max-h-60 overflow-y-auto">
                    {isSearching && <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>}
                    {!isSearching && results.map(product => (
                      <li key={product.id}>
                        <Link to={`/product/${product.id}`} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span>{product.name}</span>
                          <button onClick={(e) => handleQuickAdd(e, product)} className="ml-2 text-purple-600 font-bold">+</button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                {/* <span className="text-sm font-medium text-gray-600 hidden lg:block">
                  {user.email}
                </span> */}
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
              <span>{cartItemCount}</span>
              <span>INCOMPLETE</span>
            </button>
          </div>

        </div>
      </nav>
    </header>
  );
}