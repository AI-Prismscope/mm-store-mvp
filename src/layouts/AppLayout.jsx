// src/layouts/AppLayout.jsx

import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      <Navbar /> {/* Our new, standard navigation bar */}
      
      {/* A centered, single-column content area for the page */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet /> {/* Child pages like CookbookPage will render here */}
        </div>
      </main>
    </div>
  );
}