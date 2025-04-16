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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileRef = useRef(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let mounted = true;
    let authListener = null;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          if (session?.user) {
            console.log('Session found:', session.user.id);
            setUser(session.user);
          } else {
            console.log('No session found');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state listener
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-gray-900">
                HexaGrub
              </Link>
            </div>

            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
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
            </nav>
          </div>
        </div>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ToastContainer />
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </>
  );
}