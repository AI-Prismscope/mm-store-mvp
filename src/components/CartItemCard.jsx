import { useCart } from '../context/CartContext'; // Import to get our action functions

// Helper Icons
const TrashIcon = () => ( <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> );
const PlusIcon = () => ( <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> );
const MinusIcon = () => ( <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg> );

export default function CartItemCard({ item }) {
  // Get the functions we need from our global CartContext
  const { updateItemQuantity, removeItemFromCart } = useCart();

  // This prevents the app from crashing if product data is missing
  if (!item.products) {
    return <div className="text-red-500 text-sm">Error: Product data missing for this item.</div>;
  }

  return (
    <div className="flex items-center space-x-4 py-3">
      {/* Image */}
      <img 
        src={item.products.image_url || 'https://via.placeholder.com/150'} 
        alt={item.products.name}
        className="w-16 h-16 object-cover rounded-md"
      />

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{item.products.name}</p>
        <p className="text-sm text-gray-500">$X.XX</p> {/* Placeholder for price */}
      </div>

      {/* Quantity Stepper & Delete Button */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => removeItemFromCart(item.id)}
          className="p-1 text-gray-500 hover:text-red-600"
          title="Remove item"
        >
          <TrashIcon />
        </button>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button 
            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            className="px-2 py-1"
          >
            <MinusIcon />
          </button>
          <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
          <button 
            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            className="px-2 py-1"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  );
} 