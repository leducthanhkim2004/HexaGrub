'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '../../components/Header';
import Link from 'next/link';

// Extract the component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  
  // Extract information from search params
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');
  const paymentDate = searchParams.get('date');
  
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">
            Your payment has been processed successfully. Thank you for your order.
          </p>
          
          {/* Payment details section */}
          <div className="border-t border-gray-200 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 gap-2 text-left max-w-md mx-auto">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="text-gray-800 font-medium">{orderId}</span>
                </div>
              )}
              
              {vnpTxnRef && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Reference:</span>
                  <span className="text-gray-800 font-medium">{vnpTxnRef}</span>
                </div>
              )}
              
              {amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-gray-800 font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                  </span>
                </div>
              )}
              
              {paymentDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="text-gray-800 font-medium">{paymentDate}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            <Link href="/orders" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300">
              View My Orders
            </Link>
            <div className="block">
              <Link href="/" className="inline-block text-blue-600 hover:text-blue-800 font-medium transition duration-300">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </>
  );
}