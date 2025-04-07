import { supabase } from '../lib/supabase';

export const orderService = {
  async createOrder(orderData) {
    // Get the current user's profile
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to place an order');
    }

    // First create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        profile_id: user.id,
        total_amount: orderData.totalAmount,
        status: 'pending',
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created successfully:', order);

    // Then create the order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
      item_name: item.name,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    return order;
  },

  async getOrderById(orderId) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:profile_id (
          full_name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return null;
    }

    return { ...order, items };
  },

  async getUserOrders() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to view orders');
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching user orders:', ordersError);
      return [];
    }

    return orders;
  },

  async updateOrderStatus(orderId, status) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}; 