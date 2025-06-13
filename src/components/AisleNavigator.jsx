// src/components/AisleNavigator.jsx

import { NavLink } from 'react-router-dom';

// This is the helper function to apply conditional classes for active/inactive links
const getNavLinkClass = ({ isActive }) => {
  const commonClasses = "block px-4 py-2 text-sm rounded-md transition-colors";
  if (isActive) {
    // This is the style for the active link (like "Featured" in the image)
    return `${commonClasses} bg-green-100 text-green-800 font-semibold`;
  }
  // This is the style for inactive links
  return `${commonClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
};


export default function AisleNavigator() {
  // For the MVP, we will hardcode the navigation items.
  // In the future, this data could come from an API.
  const curatedLinks = [
    { name: 'Featured', path: '/shop/featured' },
    { name: 'Buy It Again', path: '/shop/buy-it-again' },
    { name: 'Shop with Points', path: '/shop/points' },
  ];

  const aisleLinks = [
    { name: 'Shop All', count: 1103, path: '/shop' },
    { name: 'Fruit', count: 30, path: '/shop/fruit' },
    { name: 'Vegetables', count: 87, path: '/shop/vegetables' },
    { name: 'Meat & Seafood', count: 129, path: '/shop/meat-seafood' },
    { name: 'Deli', count: 25, path: '/shop/deli' },
    { name: 'Dairy & Eggs', count: 100, path: '/shop/dairy-eggs' },
  ];

  return (
    <aside className="h-full w-64 bg-white border-r border-gray-200 p-4">
      <nav className="flex flex-col space-y-8">
        
        {/* CURATED Section */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Curated
          </h3>
          <div className="mt-2 space-y-1">
            {curatedLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={getNavLinkClass}>
                {link.name}
              </NavLink>
            ))}
            {/* Special link for Misfits+ Deals */}
            <NavLink to="/shop/deals" className={getNavLinkClass}>
              <div className="flex justify-between items-center">
                <span>Misfits+ Deals</span>
                <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">NEW</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* AISLES Section */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Aisles
          </h3>
          <div className="mt-2 space-y-1">
            {aisleLinks.map((link) => (
              <NavLink key={link.name} to={link.path} end={link.path === '/shop'} className={getNavLinkClass}>
                <div className="flex justify-between items-center">
                  <span>{link.name}</span>
                  <span className="text-gray-500">{link.count}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

      </nav>
    </aside>
  );
}