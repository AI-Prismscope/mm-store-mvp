// src/layouts/RootLayout.jsx
import { Link, NavLink } from 'react-router-dom';

export default function RootLayout({ children }) {
  // This function determines the NavLink's classes.
  // It's a powerful feature of React Router.
  const getNavLinkClass = ({ isActive }) => {
    const commonClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (isActive) {
      return `${commonClasses} bg-gray-900 text-white`; // Active link style
    }
    return `${commonClasses} text-gray-300 hover:bg-gray-700 hover:text-white`; // Inactive link style
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <header className="bg-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side: Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                RecipeApp
              </Link>
            </div>

            {/* Center: Main Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={getNavLinkClass}>
                  Meal Plan
                </NavLink>
                <NavLink to="/my-recipes" className={getNavLinkClass}>
                  My Recipes
                </NavLink>
              </div>
            </div>

            {/* Right Side: Login Link */}
            <div className="hidden md:block">
               <NavLink to="/login" className={getNavLinkClass}>
                  Login
               </NavLink>
            </div>

          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Your page content will be injected here by the router */}
          {children}
        </div>
      </main>
    </div>
  );
}