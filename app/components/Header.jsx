"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';
import { supabase } from '../lib/supabase';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notify = () => toast.success('Item added to cart!', {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
});

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkRestaurantOwner(user.id);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRestaurantOwner(session.user.id);
      } else {
        setIsRestaurantOwner(false);
      }
    });

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkRestaurantOwner = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', userId)
        .single();
      
      setIsRestaurantOwner(!!profile?.restaurant_id);
    } catch (error) {
      console.error('Error checking restaurant owner status:', error);
      setIsRestaurantOwner(false);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="flex justify-between items-center px-4 py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            HexaGrub
          </Link>
          <div className="flex items-center space-x-4">
            {/* Restaurant Dashboard Button */}
            {isRestaurantOwner && (
              <button
                onClick={() => router.push('/restaurant/dashboard')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                  />
                </svg>
                Dashboard
              </button>
            )}

            {/* User Icon */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="User account"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
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
                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </button>
              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-6 py-3 text-sm text-gray-600 border-b border-gray-100">
                        {user.email}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Orders
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                notify();
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 cart-icon"
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
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ToastContainer />
    </>
  );
}