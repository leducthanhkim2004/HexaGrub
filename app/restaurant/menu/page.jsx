'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { restaurantService } from '../../services/restaurantService';
import { menuService } from '../../services/menuService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/Header';

export default function RestaurantMenuPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_urls: [],
    new_image_url: '',
    is_available: true
  });
  const router = useRouter();
  const { user } = useAuth();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
    
    // Create previews for the files
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews([...formData.image_urls, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle adding a URL
  const handleAddImageUrl = () => {
    if (formData.new_image_url && !formData.image_urls.includes(formData.new_image_url)) {
      const updatedUrls = [...formData.image_urls, formData.new_image_url];
      setFormData({
        ...formData,
        image_urls: updatedUrls,
        new_image_url: ''
      });
      setImagePreviews(updatedUrls);
    }
  };

  // Handle removing an image
  const handleDeleteImage = (index) => {
    const updatedUrls = [...formData.image_urls];
    updatedUrls.splice(index, 1);
    setFormData({
      ...formData,
      image_urls: updatedUrls
    });
    setImagePreviews(updatedUrls);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      if (!user) return;

      // Get user's profile with restaurant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        router.push('/restaurant/create');
        return;
      }

      // Get restaurant data
      const restaurantData = await restaurantService.getRestaurantById(profile.restaurant_id);
      setRestaurant(restaurantData);
      
      // Get menu items
      const menuData = await menuService.getMenuItemsByRestaurant(restaurantData.id);
      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('restaurant-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image. Please try again.');
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let allImageUrls = [...formData.image_urls];
      
      // Upload new files if provided
      if (uploadedFiles.length > 0) {
        try {
          const newUrls = await uploadImages(uploadedFiles);
          allImageUrls = [...allImageUrls, ...newUrls];
        } catch (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        image_urls: allImageUrls,
        is_available: formData.is_available,
        restaurant_id: restaurant.id
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, itemData);
      } else {
        await menuService.addMenuItem(itemData);
      }

      // Refresh menu items
      const updatedMenu = await menuService.getMenuItemsByRestaurant(restaurant.id);
      setMenuItems(updatedMenu || []);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_urls: [],
        new_image_url: '',
        is_available: true
      });
      setImagePreviews([]);
      setUploadedFiles([]);
      setIsEditing(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditing(true);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      image_urls: item.image_urls || [],
      new_image_url: '',
      is_available: item.is_available !== false
    });
    setImagePreviews(item.image_urls || []);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    setLoading(true);
    try {
      await menuService.deleteMenuItem(itemId);
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_urls: [],
      new_image_url: '',
      is_available: true
    });
    setImagePreviews([]);
    setUploadedFiles([]);
  };

  if (loading && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-2xl text-gray-500">Loading restaurant data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
            </h1>
            {isEditing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-gray-800 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-lg font-medium text-gray-800 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 text-lg font-medium text-gray-800 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-lg font-medium text-gray-800 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Select Category</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="main-course">Main Course</option>
                  <option value="desserts">Desserts</option>
                  <option value="drinks">Drinks</option>
                  <option value="sides">Sides</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-800 mb-2">
                  Available
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-base font-medium text-gray-800">Item is available for ordering</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-800 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 text-lg font-medium text-gray-800 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-800 mb-2">
                Images
              </label>
              
              {/* Image URL input */}
              <div className="flex mb-3">
                <input
                  type="url"
                  name="new_image_url"
                  value={formData.new_image_url}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                  className="flex-grow px-4 py-3 text-lg font-medium text-gray-800 border-2 border-gray-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-3 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700"
                >
                  Add URL
                </button>
              </div>
              
              {/* File upload */}
              <div className="mt-3">
                <label className="block text-base font-medium text-gray-800 mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-3 text-base font-medium text-gray-800 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="h-32 w-full relative border rounded-md overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Items</h2>
          
          {menuItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-xl font-medium">No menu items yet. Add your first item above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-48 relative">
                    <img
                      src={item.image_urls?.[0] || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {!item.is_available && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                        Unavailable
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <span className="text-xl font-bold text-blue-700">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-base text-gray-700 mt-2 line-clamp-2">{item.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 text-red-600 font-medium hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Delete
                      </button>
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