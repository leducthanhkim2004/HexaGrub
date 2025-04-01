'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { supabase } from '../lib/supabase';

export default function CheckoutForm({ onClose }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      setError('Please log in to place an order');
    } else {
      setUser(user);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Please log in to place an order');
      }

      const orderData = {
        items: cart,
        totalAmount: getCartTotal(),
      };

      await orderService.createOrder(orderData);
      
      // Clear the cart and close the sidebar
      clearCart();
      onClose();
      
      // Show success message
      alert('Order placed successfully! We will contact you shortly.');
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md">
          Please log in to place an order
        </div>
        <button
          onClick={() => {/* Implement login redirect */}}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold">Total:</span>
          <span className="font-bold">${getCartTotal().toFixed(2)}</span>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isSubmitting
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white py-2 px-4 rounded transition-colors`}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
} 