import { supabase } from '@/utils/supabase/client'

export const menuService = {
  async getMenuItemsByCategory(category) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .order('name')
    
    if (error) {
      console.error('Error fetching menu items:', error)
      return []
    }
    
    return data
  },

  async getMenuItemsByRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', 'name')
    
    if (error) {
      console.error('Error fetching menu items:', error)
      throw new Error('Failed to fetch menu items')
    }
    
    return data || []
  },

  async getAllCategories() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category')
      .distinct()
    
    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    
    return data.map(item => item.category)
  },

  async addMenuItem(menuItem) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([menuItem])
      .select()
    
    if (error) {
      console.error('Error adding menu item:', error)
      return null
    }
    
    return data[0]
  },

  async updateMenuItem(id, updates) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating menu item:', error)
      return null
    }
    
    return data[0]
  },

  async deleteMenuItem(id) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting menu item:', error)
      return false
    }
    
    return true
  },

  async insertSampleMenuItems(restaurantId) {
    const sampleMenuItems = [
      {
        restaurant_id: restaurantId,
        name: "Classic Burger",
        description: "Juicy beef patty with fresh lettuce, tomatoes, and our special sauce",
        price: 12.99,
        category: "Main Course",
        image_urls: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce, parmesan cheese, croutons, and Caesar dressing",
        price: 8.99,
        category: "Appetizers",
        image_urls: ["https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Margherita Pizza",
        description: "Fresh mozzarella, tomatoes, and basil on our crispy crust",
        price: 14.99,
        category: "Main Course",
        image_urls: ["https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Chocolate Cake",
        description: "Rich chocolate cake with chocolate ganache",
        price: 6.99,
        category: "Desserts",
        image_urls: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "French Fries",
        description: "Crispy golden fries with sea salt",
        price: 4.99,
        category: "Sides",
        image_urls: ["https://images.unsplash.com/photo-1630384066958-6131f9ae4b5d?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Chicken Wings",
        description: "Spicy buffalo wings with blue cheese dip",
        price: 10.99,
        category: "Appetizers",
        image_urls: ["https://images.unsplash.com/photo-1608039829572-78524f79c4c7?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Vegetable Pasta",
        description: "Fresh vegetables with al dente pasta in tomato sauce",
        price: 13.99,
        category: "Main Course",
        image_urls: ["https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3"],
        is_available: true
      },
      {
        restaurant_id: restaurantId,
        name: "Ice Cream Sundae",
        description: "Vanilla ice cream with chocolate sauce and whipped cream",
        price: 5.99,
        category: "Desserts",
        image_urls: ["https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3"],
        is_available: true
      }
    ];

    const { data, error } = await supabase
      .from('menu_items')
      .insert(sampleMenuItems)
      .select();

    if (error) {
      console.error('Error inserting sample menu items:', error);
      throw new Error('Failed to insert sample menu items');
    }

    return data;
  }
} 