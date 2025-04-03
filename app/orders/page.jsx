'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    loadOrders(user.id);
  }

  async function loadOrders(userId) {
    try {
      setLoading(true);
      setError(null);

      // First get the profile for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Then get all orders with their items for this profile
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items (
            id,
            quantity,
            menu_item:menu_items (
              name,
              description,
              price
            )
          )
        `)
        .eq('profile_id', profile.id)
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

  async function cancelOrder(orderId) {
    try {
      setCancellingOrderId(orderId);
      setError(null);

      // Delete using raw SQL query to match the exact structure
      const { data, error: deleteError } = await supabase
        .rpc('delete_order', { order_id: orderId });

      if (deleteError) throw deleteError;

      // Refresh the orders list to ensure we have the latest state
      await loadOrders(user.id);

      // Show success message
      setError({ type: 'success', message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      setError({ type: 'error', message: `Failed to delete order: ${error.message}` });
    } finally {
      setCancellingOrderId(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading orders...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Order History</h1>

        {error && (
          <div className={`p-4 rounded-lg mb-6 ${
            error.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {error.message}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white 
                          ${cancellingOrderId === order.id 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                          } transition-colors`}
                      >
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 -mx-6 px-6 py-4">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600 font-medium">{item.quantity}x</span>
                          <div>
                            <h3 className="text-gray-900 font-medium">{item.menu_item.name}</h3>
                            <p className="text-sm text-gray-500">{item.menu_item.description}</p>
                          </div>
                        </div>
                        <span className="text-gray-900 font-medium">
                          ${(item.menu_item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-6 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}