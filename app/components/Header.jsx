"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';
import { supabase } from '../lib/supabase';
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthClick = () => {
    if (user) {
      supabase.auth.signOut();
    } else {
      router.push('/login'); // Navigate to your existing login page
    }
  };

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              HexaGrub
            </Link>
            <div className="flex items-center space-x-4">
              {/* User Icon */}
              <button
                onClick={handleAuthClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 group"
                aria-label="User account"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                {user && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
                <span className="absolute top-10 right-0 bg-white px-2 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {user ? 'Sign Out' : 'Sign In'}
                </span>
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
                aria-label="Shopping cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}