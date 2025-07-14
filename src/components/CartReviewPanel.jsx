import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext'; // Import the cart hook
import CartItemCard from './CartItemCard'; // Import the item card component

const CloseIcon = () => ( <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> );

export default function CartReviewPanel() {
  const { isCartOpen, closeCart } = useUI();
  // Get all the data and state from our CartContext
  const { cart, loading: cartLoading, cartItemCount, cartSubtotal } = useCart();

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div onClick={closeCart} className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Sliding Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-[375px] bg-white shadow-xl flex flex-col">
        
        {/* Panel Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart ({cartItemCount})</h2>
          <button onClick={closeCart} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>
        </div>

        {/* Panel Body (where the cart items will go) */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartLoading && <p>Loading cart...</p>}
          {!cartLoading && cart.length === 0 && (
            <div className="text-center text-gray-500 pt-16">
              <p>Your cart is empty.</p>
            </div>
          )}
          {!cartLoading && cart.length > 0 && (
            <div className="divide-y divide-gray-200">
              {cart.map(item => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Subtotal</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
} 