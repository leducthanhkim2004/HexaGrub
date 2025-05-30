import { supabase } from '@/utils/supabase/client';

export const orderService = {
  async createOrder(orderData) {
    try {
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Not authenticated');

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      if (!profile.address) {
        throw new Error('Please set up your delivery address in your profile');
      }

      // Validate that all items are from the same restaurant
      const restaurantId = orderData.items[0]?.restaurant_id;
      if (!restaurantId) {
        throw new Error('Invalid order: no restaurant ID found');
    }

      const allSameRestaurant = orderData.items.every(item => item.restaurant_id === restaurantId);
      if (!allSameRestaurant) {
        throw new Error('All items must be from the same restaurant');
      }

      // Create the order using session.user.id instead of profile.id
    const { data: order, error: orderError } = await supabase
      .from('orders')
        .insert([
          {
            profile_id: session.user.id,
            restaurant_id: restaurantId,
            total_amount: orderData.total_amount,
        status: 'pending',
            delivery_address: profile.address
          }
        ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

      // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
        item_name: item.name
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
        // Attempt to rollback the order creation
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id);
      throw new Error('Failed to create order items');
    }

    return order;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  },

  async getOrdersByUser() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Not authenticated');

      const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
          restaurant:restaurants (
            name,
            image_url
        )
      `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrdersByRestaurant(restaurantId) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Not authenticated');

      // Check if user is the restaurant owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', session.user.id)
        .single();
    
      if (!profile || profile.restaurant_id !== restaurantId) {
        throw new Error('You are not authorized to view these orders');
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
          profiles (
            full_name,
            email,
            phone_number
          )
      `)
        .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      return orders;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Not authenticated');

      // Get the order to check restaurant ownership
      const { data: order } = await supabase
        .from('orders')
        .select('restaurant_id')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if user is the restaurant owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.restaurant_id !== order.restaurant_id) {
        throw new Error('You are not authorized to update this order');
      }

      const { data, error } = await supabase
      .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
      console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }
}; 