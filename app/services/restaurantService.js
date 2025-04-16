import { supabase } from '../../utils/supabase/client';

export const restaurantService = {
  async createRestaurant(restaurantData) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to create a restaurant');
    }

    // First, update the user's profile to set their role as restaurant_owner
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ role: 'restaurant_owner' })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('Error updating user profile:', profileUpdateError);
      throw new Error('Failed to update user profile');
    }

    // Then create the restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert([{
        ...restaurantData,
        owner_id: user.id
      }])
      .select()
      .single();

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError);
      throw new Error('Failed to create restaurant');
    }

    // Finally, update the profile with the restaurant_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ restaurant_id: restaurant.id })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile with restaurant_id:', profileError);
      // Don't throw here, as the restaurant was created successfully
    }

    return restaurant;
  },

  async uploadRestaurantImages(formData) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be logged in to upload images');
    }

    const restaurantId = formData.get('restaurantId');
    const logoFile = formData.get('logo');
    const coverFile = formData.get('cover');

    if (!restaurantId || !logoFile || !coverFile) {
      throw new Error('Missing required files or restaurant ID');
    }

    try {
      // Upload logo
      const logoFileName = `${restaurantId}/logo${logoFile.name.substring(logoFile.name.lastIndexOf('.'))}`;
      const { data: logoData, error: logoError } = await supabase.storage
        .from('restaurant-images')
        .upload(logoFileName, logoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (logoError) throw logoError;

      // Upload cover image
      const coverFileName = `${restaurantId}/cover${coverFile.name.substring(coverFile.name.lastIndexOf('.'))}`;
      const { data: coverData, error: coverError } = await supabase.storage
        .from('restaurant-images')
        .upload(coverFileName, coverFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (coverError) throw coverError;

      // Get public URLs
      const { data: { publicUrl: logoUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(logoFileName);

      const { data: { publicUrl: coverUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(coverFileName);

      // Update restaurant with image URLs
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          logo_url: logoUrl,
          cover_image_url: coverUrl
        })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      return { logoUrl, coverUrl };
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  },

  async getRestaurantById(id) {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      throw new Error('Failed to fetch restaurant');
    }

    return data;
  },

  async getRestaurantByOwnerId(ownerId) {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('owner_id', ownerId)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      throw new Error('Failed to fetch restaurant');
    }

    return data;
  },

  async updateRestaurant(id, updates) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant:', error);
      throw new Error('Failed to update restaurant');
    }

    return data;
  },

  async getAllRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching restaurants:', error);
      throw new Error('Failed to fetch restaurants');
    }

    return data;
  },

  async getRestaurantMenu(restaurantId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('category');

    if (error) {
      console.error('Error fetching restaurant menu:', error);
      throw new Error('Failed to fetch restaurant menu');
    }

    return data;
  }
}; 