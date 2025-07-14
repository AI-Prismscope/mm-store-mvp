// src/components/AisleNavigator.jsx

import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  // Fetch aisle links from the database
  const [aisleLinks, setAisleLinks] = useState([]);

  useEffect(() => {
    const fetchAisles = async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('name, slug')
        .eq('type', 'aisle')
        .order('name');
      if (error) {
        console.error('Error fetching aisle tags:', error);
      } else {
        setAisleLinks(data);
      }
    };
    fetchAisles();
  }, []);

  // For the MVP, we will hardcode the navigation items.
  // In the future, this data could come from an API.
  const curatedLinks = [
    { name: 'Featured', path: '/shop/featured' },
    { name: 'Buy It Again', path: '/shop/buy-it-again' },
    { name: 'Shop with Points', path: '/shop/points' },
  ];

  return (
    <aside className="h-full w-64 border-r border-gray-200 p-4 bg-[#F5F5DC]">
      <nav className="flex flex-col space-y-8">
        
        {/* CURATED Section */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Curated
          </h3>
          <div className="mt-2 space-y-1">
            {curatedLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={({ isActive }) => {
                const commonClasses = "block px-4 py-2 text-base rounded-md transition-colors";
                if (isActive) {
                  return `${commonClasses} bg-[#dbe7c9] text-black font-semibold`;
                }
                return `${commonClasses} text-gray-800 hover:bg-gray-200`;
              }}>
                {link.name}
              </NavLink>
            ))}
            {/* Special link for Misfits+ Deals */}
            <NavLink to="/shop/deals" className={({ isActive }) => {
                const commonClasses = "block px-4 py-2 text-base rounded-md transition-colors";
                if (isActive) {
                  return `${commonClasses} bg-[#dbe7c9] text-black font-semibold`;
                }
                return `${commonClasses} text-gray-800 hover:bg-gray-200`;
              }}>
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
            <NavLink to="/" end className={({ isActive }) => {
                const commonClasses = "block px-4 py-2 text-base rounded-md transition-colors";
                if (isActive) {
                  return `${commonClasses} bg-[#dbe7c9] text-black font-semibold`;
                }
                return `${commonClasses} text-gray-800 hover:bg-gray-200`;
              }}>
              <span>Shop All</span>
            </NavLink>
            {aisleLinks.map((link) => (
              <NavLink
                key={link.slug}
                to={`/shop/${link.slug}`}
                className={({ isActive }) => {
                  const commonClasses = "block px-4 py-2 text-base rounded-md transition-colors";
                  if (isActive) {
                    return `${commonClasses} bg-[#dbe7c9] text-black font-semibold`;
                  }
                  return `${commonClasses} text-gray-800 hover:bg-gray-200`;
                }}
              >
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

      </nav>
    </aside>
  );
}