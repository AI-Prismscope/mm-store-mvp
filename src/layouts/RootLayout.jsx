// src/layouts/RootLayout.jsx

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 1. Import our custom auth hook

export default function RootLayout({ children }) {
  const { user, logout } = useAuth(); // 👈 2. Get the current user and logout function from our context
  const navigate = useNavigate();    // 👈 3. Get the navigate function to redirect after logout

  // This function is for NavLink's classes and is perfect as is.
  const getNavLinkClass = ({ isActive }) => {
    const commonClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (isActive) {
      return `${commonClasses} bg-gray-900 text-white`;
    }
    return `${commonClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;
  };

  // 👈 4. Create a handler function for the logout button
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from our context
      navigate('/login'); // Redirect the user to the login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <header className="bg-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                RecipeApp
              </Link>
            </div>
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
            
            {/* --- THE LOGIC CHANGE IS HERE --- */}
            <div className="hidden md:block">
              {user ? (
                // 👈 5. If a user is logged in, show their email and a Logout button
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // 👈 6. If no user is logged in, show the Login link
                <NavLink to="/login" className={getNavLinkClass}>
                  Login
                </NavLink>
              )}
            </div>
            
          </div>
        </nav>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}