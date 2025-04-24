'use client';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function CheckoutForm({ onClose }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Please log in to place an order');
      }

      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Check if all items are from the same restaurant
      const restaurantId = cart[0].restaurant_id;
      const allSameRestaurant = cart.every(item => item.restaurant_id === restaurantId);
      if (!allSameRestaurant) {
        throw new Error('All items must be from the same restaurant');
      }

      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurant_id: item.restaurant_id
        })),
        total_amount: getCartTotal()
      };

      const order = await orderService.createOrder(orderData);
      
      if (order) {
      // Clear the cart and close the sidebar
      clearCart();
      onClose();
      
        // Redirect to orders page
        router.push('/orders');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
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
          onClick={() => router.push('/login')}
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

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Order Summary</h3>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || cart.length === 0}
        className={`w-full ${
          isSubmitting || cart.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white py-2 px-4 rounded transition-colors`}
      >
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
} 