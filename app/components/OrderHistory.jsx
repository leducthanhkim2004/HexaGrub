'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function OrderHistory({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders with their items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-gray-900">
                Order #{order.id.slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-t">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">{item.quantity}x</span>
                  <span className="text-gray-900">{item.name}</span>
                </div>
                <span className="text-gray-900">${(item.price_at_time * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 