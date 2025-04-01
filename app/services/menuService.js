import { supabase } from '../lib/supabase'

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
  }
} 