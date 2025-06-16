// src/pages/ProductDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams gets the :id from the URL
import { supabase } from '../lib/supabaseClient';

export default function ProductDetailPage() {
  const { id } = useParams(); // 👈 Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      // Fetch the single product from the 'products' table where the id matches
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single(); // .single() ensures we get one and only one result

      if (error) {
        console.error("Error fetching product details:", error);
        setError(error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]); // Re-run this effect if the ID in the URL changes

  if (loading) {
    return <div className="p-8 text-center">Loading product...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }
  if (!product) {
    return <div className="p-8 text-center">Product not found.</div>;
  }

  // --- Render the Product Details ---
  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-purple-600 hover:underline mb-4 inline-block">← Back to Shop</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow">
        
        {/* Left side: Image */}
        <div>
          <img 
            src={product.image_url || 'https://via.placeholder.com/400'} 
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Right side: Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900 capitalize">{product.name}</h1>
          <p className="text-gray-500 mt-2">Product ID: {product.id}</p>
          
          <div className="my-6">
            <span className="text-3xl font-bold text-gray-900">$X.XX</span>
            <span className="text-gray-500 ml-2">/ per unit</span>
          </div>

          <button className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-purple-700 transition duration-300">
            Add to Cart
          </button>

          <div className="mt-6">
            <h3 className="font-semibold">Description</h3>
            <p className="text-gray-600 mt-2">
              A detailed and engaging description for '{product.name}' will go here. We can add a 'description' column to our 'products' table in the future to store this information.
            </p>
          </div>
        </div>

      </div>

      {/* Future section for related recipes */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Recipes using {product.name}</h2>
        <div className="p-8 mt-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          In the future, we can query the 'recipe_ingredients' table to find and display all recipes that include this product.
        </div>
      </div>
    </div>
  );
}