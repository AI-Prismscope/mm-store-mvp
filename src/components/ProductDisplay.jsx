// The complete code for: src/components/ProductDisplay.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from './ProductCard'; // It uses the same ProductCard

// This is a helper component specifically for a single, horizontally-scrolling row.
const ProductRow = ({ title, description, products }) => (
  <section className="mb-12">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <a href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-800 whitespace-nowrap">
        View all →
      </a>
    </div>
    
    {/* This is the key layout: a flex container that allows horizontal scrolling */}
    <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
      {products && products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      {(!products || products.length === 0) && (
        <p className="text-gray-500">No products to display in this section.</p>
      )}
    </div>
  </section>
);


export default function ProductDisplay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

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

  // For the MVP, we'll split the fetched products into two example rows.
  const orderAgainProducts = products.slice(0, 8);
  const latestRescuesProducts = products.slice(8, 16);

  return (
    <div className="w-full">
      <ProductRow 
        title="Order Again" 
        products={orderAgainProducts} 
      />
      <ProductRow 
        title="Shop Our Latest Rescues" 
        description="A little unusual, a lot planet-friendly. These groceries were rescued for being too big, too small, or just too different."
        products={latestRescuesProducts} 
      />
    </div>
  );
}