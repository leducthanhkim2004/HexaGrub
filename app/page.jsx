'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { restaurantService } from './services/restaurantService';
import { supabase } from '../utils/supabase/client';
import Header from "./components/Header";
import Link from 'next/link';
import CartSidebar from './components/CartSidebar';

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="w-full px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-8 mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Discover Local Restaurants
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Order from your favorite restaurants and get food delivered to your doorstep.
          </p>
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-xl font-medium text-gray-800 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
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

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => router.push(`/restaurant/${restaurant.id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={restaurant.cover_image_url || '/placeholder-restaurant.jpg'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-8 left-4">
                  <img
                    src={restaurant.logo_url || '/placeholder-logo.jpg'}
                    alt={`${restaurant.name} logo`}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-md"
                  />
                </div>
              </div>
              <div className="p-4 pt-12">
                <h2 className="text-xl font-semibold text-black mb-2">{restaurant.name}</h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{restaurant.description}</p>
                <p className="text-gray-500 text-sm">{restaurant.address}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
