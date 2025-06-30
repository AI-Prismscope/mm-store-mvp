import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';

export default function ProductDetailModal({ productId }) {
  const { addItemToCart } = useCart();
  const { closeProductModal } = useUI();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      setProduct(data);
      setLoading(false);
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItemToCart(product.id, 1);
    alert(`${product.name} added to cart!`);
    closeProductModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl relative">
        <button onClick={closeProductModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        {loading && <p>Loading product...</p>}
        {!loading && product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.image_url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-auto object-cover rounded-lg"/>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold capitalize">{product.name}</h1>
              <div className="my-6"><span className="text-3xl font-bold text-gray-900">
                ${product.price ? product.price.toFixed(2) : 'Price not available'}
              </span></div>
              <button onClick={handleAddToCart} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg">Add to Cart</button>
              <div className="mt-6">
                <h3 className="font-semibold">Description</h3>
                <p className="text-gray-600 mt-2">Description goes here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 