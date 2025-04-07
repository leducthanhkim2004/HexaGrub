'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');
  const details = searchParams.get('details');

  const getErrorMessage = () => {
    switch (error) {
      case 'order_not_found':
        return 'The order could not be found in our system.';
      case 'invalid_signature':
        return 'The payment signature verification failed.';
      case 'database_error':
        return 'There was a problem accessing the order information.';
      case 'delete_failed':
        return 'There was a problem processing your order after payment.';
      case 'system_error':
        return 'An unexpected error occurred during payment processing.';
      default:
        return 'The payment could not be completed.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem processing your payment. Please try again.
          </p>
        </div>
        <div className="mt-8">
          <Link 
            href="/orders"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </Link>
          <Link 
            href="/"
            className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 