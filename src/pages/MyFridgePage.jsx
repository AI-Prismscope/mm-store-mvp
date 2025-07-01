import { useFridge } from '../context/FridgeContext'; // 👈 Use the new context
import FridgeSearch from '../components/FridgeSearch';     // Import the left column
import FridgeOverview from '../components/FridgeOverview'; // Import the right column

export default function MyFridgePage() {
  // This page is the "single source of truth" for the fridge's contents.
  const { fridgeItems, loading, refetchFridge } = useFridge(); // 👈 Get everything from context

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Fridge & Pantry</h1>
      
      {/* Main two-column layout container */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* --- Left Column: Search & Add Panel --- */}
        <div className="md:w-1/3 lg:w-1/4">
          <FridgeSearch 
            // We pass the fetch function down as a prop.
            // This allows the search component to tell this page to refresh its data
            // after a new item has been successfully added.
            onFridgeUpdate={refetchFridge} 
          />
        </div>

        {/* --- Right Column: The Fridge Overview Display --- */}
        <div className="md:w-2/3 lg:w-3/4">
          {loading && <p>Loading your fridge...</p>}
          {!loading && <FridgeOverview fridgeItems={fridgeItems} />}
        </div>
        
      </div>
    </div>
  );
} 