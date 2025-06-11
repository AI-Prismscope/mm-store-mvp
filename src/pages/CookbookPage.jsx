// src/pages/CookbookPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Make sure this path is correct

export default function CookbookPage() {
  // State to hold our list of products
  const [products, setProducts] = useState([]);
  // State to track if we are currently loading
  const [loading, setLoading] = useState(true);
  // State to hold any potential errors
  const [error, setError] = useState(null);

  // This `useEffect` hook runs once when the component first mounts
  useEffect(() => {
    async function fetchProducts() {
      console.log('Attempting to fetch products from Supabase...');
      setLoading(true);

      // This is the core Supabase query. We are selecting everything from our 'products' table.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true }); // Order them alphabetically

      if (error) {
        console.error('❌ Supabase fetch error:', error);
        setError(error.message);
        setProducts([]); // Clear any previous data
      } else {
        console.log('✅ Successfully fetched products:', data);
        setProducts(data);
        setError(null); // Clear any previous errors
      }

      setLoading(false);
    }

    fetchProducts();
  }, []); // The empty dependency array [] means this effect runs only once

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4 border-b pb-2">Supabase Connection Test</h1>
      <h2 className="text-xl font-semibold mb-4">Products Table:</h2>

      {/* Show a loading message while fetching */}
      {loading && <p className="text-blue-500">Loading...</p>}

      {/* Show an error message if something went wrong */}
      {error && <p className="text-red-500 font-bold">Error: {error}</p>}
      
      {/* If not loading and no error, display the products */}
      {!loading && !error && (
        <ul className="list-disc list-inside space-y-2">
          {products.map((product) => (
            <li key={product.id} className="text-gray-700">
              {product.name} (ID: {product.id})
            </li>
          ))}
        </ul>
      )}

      {/* Show a message if the table is empty */}
      {!loading && products.length === 0 && !error && (
        <p className="text-gray-500 italic">No products found. Did you run the populate script?</p>
      )}
    </div>
  );
}