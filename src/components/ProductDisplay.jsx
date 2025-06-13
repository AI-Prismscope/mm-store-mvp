// src/components/ProductDisplay.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import our Supabase client
import ProductCard from './ProductCard'; // Import the card component we just made

// A helper component for a single product row to keep our main component clean
const ProductRow = ({ title, description, products }) => (
  <section className="mb-12">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <a href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-800">View all →</a>
    </div>
    
    {/* This container enables horizontal scrolling */}
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </section>
);


export default function ProductDisplay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Fetch all products from our Supabase table
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest first

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  // For the MVP, we'll just split the fetched products into two example rows.
  const orderAgainProducts = products.slice(0, 6);
  const latestRescuesProducts = products.slice(6, 12);

  return (
    <div className="w-full">
      <ProductRow 
        title="Order Again" 
        products={orderAgainProducts} 
      />
      <ProductRow 
        title="Shop Our Latest Rescues" 
        description="A little unusual, a lot planet-friendly. These groceries were rescued for being too big, too small, or just too different. Help keep them out of the landfill."
        products={latestRescuesProducts} 
      />
    </div>
  );
}