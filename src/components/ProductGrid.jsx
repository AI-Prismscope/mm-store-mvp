// The complete code for: src/components/ProductGrid.jsx

import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  // --- Case 1: Handle the "No Results" state ---
  // If the `products` array is empty or doesn't exist, we render a
  // user-friendly message instead of just a blank space.
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700">No Products Found</h3>
        <p className="text-gray-500 mt-2">Please try a different search or category.</p>
      </div>
    );
  }

  // --- Case 2: Render the grid of products ---
  // This is the primary purpose of the component.
  return (
    // This is the responsive grid container.
    // - It starts as a single column on mobile (`grid-cols-1`).
    // - Becomes 2 columns on small screens (`sm:grid-cols-2`).
    // - Expands to 3, 4, and 5 columns on larger screens.
    // - `gap-6` provides consistent spacing between all cards.
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {/* 
        We use .map() to loop through the `products` array that was passed
        down as a prop. For each `product` object in the array, we render
        our reusable ProductCard component.
      */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}