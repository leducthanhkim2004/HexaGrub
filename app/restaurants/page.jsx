'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantService } from '../services/restaurantService';
import Header from '../components/Header';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Restaurants</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={restaurant.cover_image_url || '/placeholder-restaurant.jpg'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  {restaurant.logo_url && (
                    <img
                      src={restaurant.logo_url}
                      alt={`${restaurant.name} logo`}
                      className="absolute bottom-0 left-4 transform translate-y-1/2 w-16 h-16 rounded-full border-4 border-white"
                    />
                  )}
                </div>
                <div className="p-4 pt-8">
                  <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>
                  <div className="flex items-center text-gray-500">
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No restaurants found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 