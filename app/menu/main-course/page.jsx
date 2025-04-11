'use client';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import { menuService } from '../../services/menuService';
import '../style.css';

export default function MainCoursePage() {
  const { addToCart } = useCart();
  const [mainCourses, setMainCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function loadMainCourses() {
      try {
        const items = await menuService.getMenuItemsByCategory('main-course');
        // Process the data to ensure consistent image handling
        const processedItems = items.map(item => ({
          ...item,
          // Ensure image_urls is always an array
          image_urls: Array.isArray(item.image_urls) ? item.image_urls : 
                     item.image_urls ? [item.image_urls] : 
                     item.image_url ? [item.image_url] : []
        }));
        setMainCourses(processedItems);
      } catch (error) {
        console.error('Error loading main courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMainCourses();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl text-gray-600">Loading main courses...</div>
          </div>
        </main>
      </div>
    );
  }

  if (mainCourses.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-2xl text-gray-600">No main courses found. Please check back later.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-black mb-6">Signature Main Courses</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the heart of Vietnamese cuisine with our signature main dishes,
              each one telling a story of tradition and flavor.
            </p>
          </div>
        </div>
      </section>

      {/* Main Courses Listing Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainCourses.map((item) => (
              <div key={item.id}>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-64 w-full overflow-hidden cursor-pointer" onClick={() => openModal(item)}>
                    <img
                      src={getImageUrl(item.image_urls)}
                      alt={item.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
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
                  <div className="p-6 h-48 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-black mb-3">{item.name}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xl font-bold text-black">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="inline-block px-4 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative">
              <img
                src={getImageUrl(selectedItem.image_urls, currentImageIndex)}
                alt={selectedItem.name}
                className="w-full h-[60vh] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              {selectedItem.image_urls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedItem.image_urls.length}
                  </div>
                </>
              )}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold text-black mb-4">{selectedItem.name}</h2>
              <p className="text-gray-600 mb-6">{selectedItem.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-black">${selectedItem.price.toFixed(2)}</span>
                <button
                  onClick={() => {
                    addToCart(selectedItem);
                    closeModal();
                  }}
                  className="inline-block px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 