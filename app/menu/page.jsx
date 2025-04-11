import React, { useState } from 'react';
import Header from '../components/Header';
import CartSidebar from '../components/CartSidebar';

const MenuPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const menuItems = [
    // Add your menu items here
  ];

  const addToCart = (item) => {
    // Implement the addToCart function
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative h-48">
                {item.image_urls?.[0] && (
                  <img
                    src={item.image_urls[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.image_urls?.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 rounded-full px-2 py-1 text-xs">
                    +{item.image_urls.length - 1} more
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                <p className="text-gray-600 mt-1">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-black">${item.price.toFixed(2)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Item Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-black">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-gray-600">{selectedItem.description}</div>
                    <div className="text-xl font-bold text-black">${selectedItem.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Category: {selectedItem.category}</div>
                    <button
                      onClick={() => {
                        addToCart(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.image_urls?.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${selectedItem.name} ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateCart={setCart}
        />
      </div>
    </>
  );
};

export default MenuPage; 