// src/pages/ShopPage.jsx (New "Smart" Version)

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductDisplay from '../components/ProductDisplay';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Let's limit the homepage load for performance

      if (error) {
        console.error("Error fetching homepage products:", error);
        setError(error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchAllProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  // We now slice the data here, in the smart parent component
  const orderAgainProducts = products.slice(0, 8);
  const latestRescuesProducts = products.slice(8, 16);

  return (
    <ProductDisplay 
      orderAgainProducts={orderAgainProducts}
      latestRescuesProducts={latestRescuesProducts}
    />
  );
}