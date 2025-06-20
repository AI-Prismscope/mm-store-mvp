// src/components/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// A simple Plus icon for the add button
const PlusIcon = () => (
    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
  
  export default function ProductCard({ product }) {
    // In a real app, this function would likely be passed down as a prop
    const { addItemToCart } = useCart();

    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevents the click from triggering parent element clicks
      addItemToCart(product.id);
    };
  
    // For the MVP, we'll generate a random price for visual representation
    const randomPrice = (Math.random() * 5 + 2).toFixed(2);
  
    return (
        <Link to={`/product/${product.id}`} className="group relative flex-shrink-0 w-48 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
        >
        <div className="group relative flex-shrink-0 w-48 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative w-full h-32 bg-gray-200">
            {/* We use a placeholder if no image_url is provided */}
            <img
                src={product.image_url || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-full object-cover"
            />
            </div>
            <div className="p-3">
            <h3 className="text-sm font-medium text-gray-800">
                {/* We'll use a link here that could go to a product detail page in the future */}
                <a href="#" className="focus:outline-none">
                <span aria-hidden="true" className="absolute inset-0" />
                {product.name}
                </a>
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">${randomPrice}</p>
            </div>
            
            {/* Add to Cart Button */}
            <button
            onClick={handleAddToCart}
            className="absolute top-2 right-2 h-10 w-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transform opacity-0 group-hover:opacity-100 transition-opacity"
            >
            <PlusIcon />
            </button>
        </div>
      </Link>
    );
  }