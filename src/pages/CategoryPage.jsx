import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProductGrid from '../components/ProductGrid'; // Reusing our grid component!

// These are the placeholder sub-tags for the MVP. They don't do anything yet.
const subCategoryPlaceholders = [
  'Stone Fruit', 'Melons', 'Berries', 'Citrus', 'Apples & Pears', 'Tropical Fruit'
];

export default function CategoryPage() {
  // Use the slug from the URL
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [pageTitle, setPageTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!categorySlug) return;
      setLoading(true);
      setError(null);
      // Query by slug
      const { data, error } = await supabase
        .from('tags')
        .select(`
          name,
          product_tags!inner (
            products ( * )
          )
        `)
        .eq('slug', categorySlug)
        .maybeSingle();
      if (error) {
        console.error('Error fetching category products:', error);
        setError(error.message);
      } else if (data && data.product_tags) {
        setPageTitle(data.name);
        const productList = data.product_tags.map(item => item.products);
        setProducts(productList);
      } else {
        setProducts([]);
        setPageTitle('Category Not Found');
      }
      setLoading(false);
    };
    fetchCategoryProducts();
  }, [categorySlug]);

  return (
    <div className="w-full">
      {/* Breadcrumb Navigation */}
      <p className="text-sm text-gray-500 mb-2">Home / {pageTitle}</p>
      
      {/* Main Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{pageTitle}</h1>

      {/* Placeholder for Sub-Category Filters */}
      <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
        {subCategoryPlaceholders.map(tag => (
          <button 
            key={tag}
            className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-yellow-200 rounded-full whitespace-nowrap"
            // This button is non-functional for now
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Displaying the Product Grid */}
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <ProductGrid products={products} />
      )}
    </div>
  );
} 