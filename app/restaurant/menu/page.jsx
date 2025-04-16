'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
  const [imageUrls, setImageUrls] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      image_urls: [],
      new_image_url: '',
      image_files: null,
      is_available: true
    }
  });

  // Watch the image inputs for preview
  const watchImageUrl = watch('new_image_url');
  const watchImageFiles = watch('image_files');
  const watchImageUrls = watch('image_urls');

  // Update previews when URL or files change
  useEffect(() => {
    const newPreviews = [...(watchImageUrls || [])];
    
    // Add URL preview if there's a new URL
    if (watchImageUrl) {
      newPreviews.push(watchImageUrl);
    }
    
    // Add file previews
    if (watchImageFiles?.length) {
      const fileArray = Array.from(watchImageFiles);
      setUploadedFiles(fileArray);
      
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    setImagePreviews(newPreviews);
  }, [watchImageUrl, watchImageFiles, watchImageUrls]);

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

  const onSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      let allImageUrls = [...(formData.image_urls || [])];
      
      // Add new URL if provided
      if (formData.new_image_url) {
        allImageUrls.push(formData.new_image_url);
      }
      
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
        // If updating and there are new images, delete the old ones
        if ((uploadedFiles.length > 0 || formData.new_image_url) && editingItem.image_urls?.length) {
          try {
            const oldImagePaths = editingItem.image_urls.map(url => 
              `menu-items/${url.split('/').pop()}`
            );
            await supabase.storage
              .from('restaurant-images')
              .remove(oldImagePaths);
          } catch (deleteError) {
            console.error('Error deleting old images:', deleteError);
            // Continue with update even if delete fails
          }
        }
        await menuService.updateMenuItem(editingItem.id, itemData);
      } else {
        await menuService.addMenuItem(itemData);
      }

      // Refresh menu items
      const updatedMenu = await menuService.getMenuItemsByRestaurant(restaurant.id);
      setMenuItems(updatedMenu || []);
      
      // Reset form and previews
      reset();
      setImagePreviews([]);
      setUploadedFiles([]);
      setImageUrls([]);
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
    setImagePreviews(item.image_urls || []);
    // Set form values
    Object.entries(item).forEach(([key, value]) => {
      if (key === 'price') {
        setValue(key, value.toString());
      } else if (key === 'image_urls') {
        setValue(key, value || []);
      } else {
        setValue(key, value);
      }
    });
    setIsEditing(true);
  };

  const handleDeleteImage = (index) => {
    const currentUrls = watch('image_urls') || [];
    const newUrls = [...currentUrls];
    newUrls.splice(index, 1);
    setValue('image_urls', newUrls);
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleAddImageUrl = () => {
    const newUrl = watch('new_image_url');
    if (newUrl) {
      const currentUrls = watch('image_urls') || [];
      setValue('image_urls', [...currentUrls, newUrl]);
      setValue('new_image_url', '');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await menuService.deleteMenuItem(itemId);
      const updatedMenu = await menuService.getMenuItemsByRestaurant(restaurant.id);
      setMenuItems(updatedMenu || []);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    reset();
    setImagePreviews([]);
    setUploadedFiles([]);
    setImageUrls([]);
    setIsEditing(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Menu</h1>
            <button
              onClick={() => router.push('/restaurant/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Item Form */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('price', { 
                          required: 'Price is required',
                          min: { value: 0, message: 'Price must be greater than 0' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        {...register('category', { required: 'Category is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Add Image URL
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            {...register('new_image_url')}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Upload Images
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          {...register('image_files')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          You can select multiple images (max 5MB each)
                        </p>
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Images ({imagePreviews.length})
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('is_available')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Available for Order
                      </label>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Menu Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {item.image_urls?.length > 0 ? (
                          <div className="relative h-24 w-24">
                            <img
                              src={item.image_urls[0]}
                              alt={item.name}
                              className="h-24 w-24 object-cover rounded-md"
                            />
                            {item.image_urls.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded-full">
                                +{item.image_urls.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Category: {item.category}</span>
                          <span className={`text-sm ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
                            {item.is_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        <div className="mt-4 flex space-x-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No menu items yet. Add your first item using the form.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 