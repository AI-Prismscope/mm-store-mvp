// src/components/ProductCard.jsx
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
// A simple Plus icon for the add button
const PlusIcon = () => (
    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
  
  export default function ProductCard({ product }) {
    const { addItemToCart } = useCart();
    const { openProductModal } = useUI();

    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addItemToCart(product.id);
    };
  
    // For the MVP, we'll generate a random price for visual representation
    const randomPrice = (Math.random() * 5 + 2).toFixed(2);
  
    return (
      <div
        onClick={() => openProductModal(product.id)}
        className="group relative flex-shrink-0 w-48 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="relative w-full h-32 bg-gray-200">
          <img
            src={product.image_url || 'https://via.placeholder.com/150'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-800">
            {product.name}
          </h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            ${product.price ? product.price.toFixed(2) : 'N/A'}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="absolute top-2 right-2 h-10 w-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transform opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PlusIcon />
        </button>
      </div>
    );
  }