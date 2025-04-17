'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantService } from '../../services/restaurantService';
import Header from '../../components/Header';
import Image from 'next/image';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../../../utils/supabase/client';

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Image upload states
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoCrop, setLogoCrop] = useState(null);
  const [coverCrop, setCoverCrop] = useState(null);
  const [showLogoCropper, setShowLogoCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const logoImageRef = useRef(null);
  const coverImageRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cover_image_url: '',
    logo_url: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Check if user already has a restaurant
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile?.restaurant_id) {
        router.push('/restaurant-admin');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Failed to verify authentication');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result);
        setShowLogoCropper(true);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result);
        setShowCoverCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop, type) => {
    if (type === 'logo') {
      setLogoCrop(crop);
    } else {
      setCoverCrop(crop);
    }
  };

  const handleCropSave = async (type) => {
    const imageRef = type === 'logo' ? logoImageRef : coverImageRef;
    const crop = type === 'logo' ? logoCrop : coverCrop;
    
    if (!imageRef.current || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    
    if (type === 'logo') {
      setLogoPreview(croppedImageUrl);
      setShowLogoCropper(false);
    } else {
      setCoverPreview(croppedImageUrl);
      setShowCoverCropper(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.name || !formData.address) {
        throw new Error('Name and address are required');
      }

      if (!logoFile || !coverFile) {
        throw new Error('Logo and cover image are required');
      }

      // Create restaurant first
      const restaurant = await restaurantService.createRestaurant(formData);

      // Upload images after restaurant creation
      if (logoFile && coverFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        formData.append('cover', coverFile);
        formData.append('restaurantId', restaurant.id);

        // Upload images to Supabase storage
        await restaurantService.uploadRestaurantImages(formData);
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push('/restaurant-admin');
      }, 2000);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Register Your Restaurant</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Restaurant created successfully! Redirecting to admin panel...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-gray-50 shadow-md rounded-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Logo Image *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500">Recommended size: 200x200 pixels</p>
                  {logoPreview && !showLogoCropper && (
                    <div className="relative w-32 h-32">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Cover Image *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500">Recommended size: 1200x400 pixels</p>
                  {coverPreview && !showCoverCropper && (
                    <div className="relative w-full h-32">
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Image Cropping Modals */}
            {showLogoCropper && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
                  <h3 className="text-lg font-semibold mb-4">Crop Logo Image</h3>
                  <ReactCrop
                    crop={logoCrop}
                    onChange={(c) => handleCropComplete(c, 'logo')}
                    aspect={1}
                  >
                    <img
                      ref={logoImageRef}
                      src={logoPreview}
                      alt="Logo crop"
                      className="max-h-[400px]"
                    />
                  </ReactCrop>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoCropper(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropSave('logo')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Crop
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCoverCropper && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
                  <h3 className="text-lg font-semibold mb-4">Crop Cover Image</h3>
                  <ReactCrop
                    crop={coverCrop}
                    onChange={(c) => handleCropComplete(c, 'cover')}
                    aspect={3}
                  >
                    <img
                      ref={coverImageRef}
                      src={coverPreview}
                      alt="Cover crop"
                      className="max-h-[400px]"
                    />
                  </ReactCrop>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCoverCropper(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropSave('cover')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Crop
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Restaurant'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 