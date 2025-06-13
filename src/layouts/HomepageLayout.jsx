// src/layouts/HomepageLayout.jsx

import Navbar from '../components/Navbar';
import AisleNavigator from '../components/AisleNavigator';
import { Outlet } from 'react-router-dom'; // Use Outlet to render child routes

export default function HomepageLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - The Aisle Navigator */}
        <div className="flex-shrink-0 w-64 bg-white border-r border-gray-200">
          <AisleNavigator />
        </div>
        
        {/* Main Content Area - This will scroll independently */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet /> {/* Child routes like ProductDisplay will render here */}
          </div>
        </main>
      </div>
    </div>
  );
}