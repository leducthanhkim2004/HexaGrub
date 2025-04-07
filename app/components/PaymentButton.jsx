'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentButton({ orderId, amount, orderInfo }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Validate input data
      if (!orderId || !amount || !orderInfo) {
        throw new Error('Missing required payment information');
      }

      // Ensure amount is a number
      const numericAmount = Number(amount);
      if (isNaN(numericAmount)) {
        throw new Error('Invalid amount format');
      }

      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId.toString(),
          amount: numericAmount,
          orderInfo: orderInfo.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : 'Pay with VNPAY'}
    </button>
  );
} 