'use client';

import { Inter } from 'next/font/google';
import './globals.css'
import { CartProvider } from './context/CartContext'
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Pre-fetch user profile to avoid loading states
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Pre-fetch user profile on auth state change
        try {
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
} 