import { createContext, useContext, useState } from 'react';

// Create the context
const UIContext = createContext();

// Create the provider component that will wrap our app
export function UIProvider({ children }) {
  // State for the Cart Review Panel (from our previous plan)
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- NEW STATE for the Product Detail Modal ---
  // Instead of a boolean, we store the ID of the product to show, or null if it's closed.
  const [viewingProductId, setViewingProductId] = useState(null);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // --- NEW FUNCTIONS for the Product Detail Modal ---
  const openProductModal = (productId) => setViewingProductId(productId);
  const closeProductModal = () => setViewingProductId(null);

  // The value provided to all consuming components
  const value = {
    isCartOpen,
    openCart,
    closeCart,
    viewingProductId,
    openProductModal,
    closeProductModal,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// A custom hook for easy access to the context
export function useUI() {
  return useContext(UIContext);
} 