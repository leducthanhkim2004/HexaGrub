'use client';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CheckoutForm from './CheckoutForm';

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">
            {isCheckingOut ? 'Checkout' : 'Shopping Cart'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {isCheckingOut ? (
          <CheckoutForm onClose={onClose} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col p-4 border-b border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-black">{item.name}</h3>
                        <p className="text-sm text-black">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-2 text-black">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-black">Total:</span>
                  <span className="font-bold text-black">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <CheckoutForm onClose={onClose} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 