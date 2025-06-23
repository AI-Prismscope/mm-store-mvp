import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Hook to read URL query params
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard'; // We reuse our existing ProductCard
import ProductGrid from '../components/ProductGrid'; // 👈 Import the new grid

export default function SearchResultsPage() {
  // useSearchParams is like useState, but for the URL query string (e.g., ?q=chicken)
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; // Get the value of the 'q' parameter

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This effect will re-run whenever the search query in the URL changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // We perform the same kind of query as our backend function,
      // but without the .limit() so we get ALL results.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);
      
      if (error) {
        console.error("Error fetching search results:", error);
        setError(error.message);
      } else {
        setResults(data);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]); // The dependency array ensures this runs when `query` changes

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-purple-600">"{query}"</span>
      </h1>

      {loading && <p>Searching...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <ProductGrid products={results} />
      )}
    </div>
  );
} 