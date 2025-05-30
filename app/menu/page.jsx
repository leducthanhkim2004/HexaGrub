'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category');

        if (error) throw error;

        // Process the data to ensure consistent image handling
        const processedData = data.map(item => ({
          ...item,
          // Ensure image_urls is always an array
          image_urls: Array.isArray(item.image_urls) ? item.image_urls : 
                     item.image_urls ? [item.image_urls] : 
                     item.image_url ? [item.image_url] : []
        }));

        setMenuItems(processedData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Function to safely get image URL
  const getImageUrl = (urls, index = 0) => {
    if (!urls || !Array.isArray(urls) || !urls.length) return '/placeholder.jpg';
    return urls[index] || '/placeholder.jpg';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Our Menu</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const thumbnailUrl = getImageUrl(item.image_urls);
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative h-64">
                  <img
                    src={thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  {item.image_urls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                      +{item.image_urls.length - 1} more
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">{item.name}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900 drop-shadow-sm">${parseFloat(item.price).toFixed(2)}</span>
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors border border-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart functionality here
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Item Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 drop-shadow-sm">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Image Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedItem.image_urls.map((url, index) => (
                      <div key={index} className="relative aspect-w-16 aspect-h-9">
                        <img
                          src={url}
                          alt={`${selectedItem.name} ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Item Details */}
                  <div className="space-y-4">
                    <p className="text-gray-600">{selectedItem.description}</p>
                    <p className="text-2xl font-bold text-gray-900 drop-shadow-sm">${parseFloat(selectedItem.price).toFixed(2)}</p>
                    <p className="text-gray-600 font-medium">Category: {selectedItem.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateCart={setCart}
        />
      </main>
    </div>
  );
} 