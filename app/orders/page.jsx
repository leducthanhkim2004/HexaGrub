'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import PaymentButton from '../components/PaymentButton';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadOrders();
    
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `profile_id=eq.${user.id}`
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    // Refresh orders every 30 seconds as a fallback
    const interval = setInterval(loadOrders, 30000);

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setError(null);
      // Fetch both pending and completed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurant_id (
            name
          ),
          order_items (
            *,
            menu_items (
              name
            )
          )
        `)
        .eq('profile_id', user.id)
        .in('status', ['pending', 'completed'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(orders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadOrders();
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .rpc('delete_order', {
          order_id: orderId
        });

      if (error) throw error;

      // Show success message and refresh orders
      alert('Order cancelled successfully');
      loadOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(err.message || 'Failed to cancel order. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Payment Successful
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Pending Payment
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const successfulOrders = orders.filter(order => order.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home Page
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
            disabled={loading}
          >
            <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Pending Orders Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Orders</h2>
          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id} - {order.restaurant?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Items:</span>
                        <div className="ml-2">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item) => (
                              <div key={item.id}>
                                {item.quantity}x {item.menu_items?.name || item.item_name || 'Item'} (${parseFloat(item.price_at_time).toFixed(2)})
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">No items</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Cancel Order
                          </button>
                          <PaymentButton
                            orderId={order.id}
                            amount={order.total_amount}
                            orderInfo={`Order #${order.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Successful Orders Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Orders</h2>
          {successfulOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No completed orders</p>
            </div>
          ) : (
            <div className="space-y-6">
              {successfulOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id} - {order.restaurant?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Items:</span>
                        <div className="ml-2">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item) => (
                              <div key={item.id}>
                                {item.quantity}x {item.menu_items?.name || item.item_name || 'Item'} (${parseFloat(item.price_at_time).toFixed(2)})
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">No items</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}