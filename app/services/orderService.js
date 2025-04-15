import { supabase } from '../lib/supabase';

export const orderService = {
  async createOrder(orderData) {
    // Get the current user's profile
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to place an order');
    }

    // Validate that all items are from the same restaurant
    const restaurantId = orderData.items[0]?.restaurant_id;
    if (!restaurantId) {
      throw new Error('Order must contain items from a restaurant');
    }

    const allSameRestaurant = orderData.items.every(item => item.restaurant_id === restaurantId);
    if (!allSameRestaurant) {
      throw new Error('All items must be from the same restaurant');
    }

    // First create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        profile_id: user.id,
        restaurant_id: restaurantId,
        total_amount: orderData.totalAmount,
        status: 'pending',
        delivery_address: orderData.deliveryAddress,
        delivery_instructions: orderData.deliveryInstructions,
        estimated_delivery_time: new Date(Date.now() + 30 * 60000) // Default 30 minutes
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

  async getOrdersByUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to view orders');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants (
          id,
          name,
          logo_url
        ),
        order_items (
          id,
          quantity,
          price_at_time,
          item_name
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }

    return data;
  },

  async getOrdersByRestaurant(restaurantId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to view orders');
    }

    // Check if user is the restaurant owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('restaurant_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.restaurant_id !== restaurantId) {
      throw new Error('You are not authorized to view these orders');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name,
          email,
          phone_number
        ),
        order_items (
          id,
          quantity,
          price_at_time,
          item_name
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant orders:', error);
      throw new Error('Failed to fetch restaurant orders');
    }

    return data;
  },

  async updateOrderStatus(orderId, newStatus) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to update order status');
    }

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
      .eq('id', user.id)
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
  }
}; 