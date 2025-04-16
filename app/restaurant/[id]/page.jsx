'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantService } from '../../services/restaurantService';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import CartSidebar from '../../components/CartSidebar';

export default function RestaurantPage({ params }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();

  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedItem) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  useEffect(() => {
    if (!params.id) {
      setError('Restaurant ID is missing');
      setLoading(false);
      return;
    }
    fetchRestaurantData();
  }, [params.id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantData = await restaurantService.getRestaurantById(params.id);
      
      if (!restaurantData) {
        throw new Error('Restaurant not found');
      }

      setRestaurant(restaurantData);
      setMenuItems(restaurantData.menu_items || []);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError(error.message || 'Failed to load restaurant data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Function to safely get image URL
  const getImageUrl = (urls, index = 0) => {
    if (!urls || !Array.isArray(urls) || !urls.length) return '/placeholder.jpg';
    return urls[index] || '/placeholder.jpg';
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedItem && selectedItem.image_urls) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedItem.image_urls.length
      );
    }
  };

  const prevImage = () => {
    if (selectedItem && selectedItem.image_urls) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedItem.image_urls.length - 1 : prevIndex - 1
      );
    }
  };

  const handleModalClick = (e) => {
    // Close modal if clicking the overlay (outside the modal content)
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="text-gray-600 text-lg mb-4">Restaurant not found</div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Restaurant Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{restaurant.name}</h1>
          <p className="text-gray-600 mb-4">{restaurant.description}</p>
          <div className="flex items-center text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>{restaurant.address}</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div 
                className="relative h-48 cursor-pointer" 
                onClick={() => openModal(item)}
              >
                <img
                  src={getImageUrl(item.image_urls)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.image_urls?.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                    +{item.image_urls.length - 1} more
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-sm">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-700 drop-shadow-sm">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart({ ...item, restaurant_id: restaurant.id })}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
          </div>
        )}

        {/* Image Gallery Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleModalClick}
          >
            <div className="relative bg-white rounded-lg max-w-4xl w-full">
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 text-white hover:text-gray-200 z-50"
                aria-label="Close modal"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-4">
                <div className="relative aspect-w-16 aspect-h-9">
                  <img
                    src={getImageUrl(selectedItem.image_urls, currentImageIndex)}
                    alt={selectedItem.name}
                    className="w-full h-[400px] object-cover rounded-lg"
                  />
                  {selectedItem.image_urls?.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from closing
                          prevImage();
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from closing
                          nextImage();
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {selectedItem.image_urls.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h3>
                  <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-blue-700">
                      ${parseFloat(selectedItem.price).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from closing
                        addToCart({ ...selectedItem, restaurant_id: restaurant.id });
                        closeModal();
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <CartSidebar />
    </div>
  );
} 