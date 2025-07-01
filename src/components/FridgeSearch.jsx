import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the user's auth token
import { useUI } from '../context/UIContext'; // To open the product detail modal

// A simple Plus icon for the add button
const PlusIcon = () => (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default function FridgeSearch({ onFridgeUpdate }) {
  const { session } = useAuth();
  const { openProductModal } = useUI();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // This debounced effect fetches search results as the user types
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const searchTimer = setTimeout(() => {
      fetch(`/.netlify/functions/product-search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => console.error("Search error:", err))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [query]);

  // This function calls our new fridge-add-item endpoint
  const handleAddItemToFridge = async (productId) => {
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/fridge-add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }), // Default to adding 1
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add item to fridge.');
      }
      // Tell the parent page that an update happened so it can refetch
      onFridgeUpdate(); 
      setQuery(''); // Clear the search bar
      setResults([]); // Hide the results dropdown
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-50 h-full rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add to Your Fridge</h2>
      
      <div className="relative">
        <input
          type="search"
          placeholder="Search for an item..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-md shadow-sm"
          autoComplete="off"
        />

        {/* --- Search Results Dropdown --- */}
        {(query && (results.length > 0 || isSearching)) && (
          <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10 border">
            <ul className="max-h-80 overflow-y-auto">
              {isSearching && <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>}
              {!isSearching && results.map(product => (
                <li key={product.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
                  <span 
                    onClick={() => openProductModal(product.id)}
                    className="flex-1 cursor-pointer"
                  >
                    {product.name}
                  </span>
                  <button 
                    onClick={() => handleAddItemToFridge(product.id)}
                    className="ml-4 bg-purple-600 text-white h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-purple-700"
                    title={`Add ${product.name} to fridge`}
                  >
                    <PlusIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-xs text-gray-500 mt-4">
        Add items you already have at home. This will help us recommend recipes that use up what you've got!
      </p>
    </div>
  );
} 