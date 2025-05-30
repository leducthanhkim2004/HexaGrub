'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '@/utils/supabase/client';
import Header from '../../components/Header';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function EditRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cover_image_url: '',
    logo_url: ''
  });

  // Image upload and crop states
  const [showLogoCropper, setShowLogoCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoCrop, setLogoCrop] = useState();
  const [coverCrop, setCoverCrop] = useState();
  const logoImageRef = useRef(null);
  const coverImageRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.restaurant_id) {
        router.push('/restaurant/create');
        return;
      }

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', profile.restaurant_id)
        .single();

      if (error) throw error;

      setRestaurant(restaurant);
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        cover_image_url: restaurant.cover_image_url || '',
        logo_url: restaurant.logo_url || ''
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError(error.message);
    } finally {
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

  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
        setShowLogoCropper(true);
      } else {
        setCoverPreview(reader.result);
        setShowCoverCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop, type) => {
    if (type === 'logo') {
      setLogoCrop(crop);
    } else {
      setCoverCrop(crop);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const uploadImage = async (blob, type) => {
    try {
      const fileExt = 'jpg';
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `restaurants/${restaurant.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-images')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleCropSave = async (type) => {
    try {
      const image = type === 'logo' ? logoImageRef.current : coverImageRef.current;
      const crop = type === 'logo' ? logoCrop : coverCrop;
      
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingCover(true);
      }

      const croppedImage = await getCroppedImg(
        image,
        crop,
        type === 'logo' ? 'logo.jpg' : 'cover.jpg'
      );

      const publicUrl = await uploadImage(croppedImage, type);

      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'cover_image_url']: publicUrl
      }));

      if (type === 'logo') {
        setShowLogoCropper(false);
        setLogoPreview(null);
      } else {
        setShowCoverCropper(false);
        setCoverPreview(null);
      }
    } catch (error) {
      console.error('Error saving cropped image:', error);
      setError('Failed to save image. Please try again.');
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('restaurants')
        .update(formData)
        .eq('id', restaurant.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push('/restaurant/dashboard'), 1500);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchRestaurant();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Edit Restaurant</h1>
            <button
              onClick={() => router.push('/restaurant/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Restaurant updated successfully!</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Restaurant Images */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Logo Image
                    <span className="text-gray-500 text-xs ml-2">
                      (Recommended: 400x400px, Square)
                    </span>
                  </label>
                  <div className="mb-2 relative w-32 h-32 mx-auto">
                    <img
                      src={formData.logo_url || '/placeholder-logo.png'}
                      alt="Restaurant logo"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'logo')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Click to upload logo"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white text-sm">Click to change</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Cover Image
                    <span className="text-gray-500 text-xs ml-2">
                      (Recommended: 1200x400px, 3:1 ratio)
                    </span>
                  </label>
                  <div className="mb-2 relative w-full h-32">
                    <img
                      src={formData.cover_image_url || '/placeholder-cover.png'}
                      alt="Restaurant cover"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'cover')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Click to upload cover image"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white text-sm">Click to change</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
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
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/restaurant/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingLogo || uploadingCover}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Logo Cropper Modal */}
      {showLogoCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 max-w-xl w-full">
            <h3 className="text-lg font-semibold mb-4">Crop Logo Image</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Drag to reposition. Resize using the corners.
              </p>
              <ReactCrop
                crop={logoCrop}
                onChange={(_, percentCrop) => setLogoCrop(percentCrop)}
                onComplete={(c) => handleCropComplete(c, 'logo')}
                aspect={1}
                circularCrop
              >
                <img
                  ref={logoImageRef}
                  src={logoPreview}
                  alt="Logo crop"
                  className="max-h-[400px]"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowLogoCropper(false);
                  setLogoPreview(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCropSave('logo')}
                disabled={uploadingLogo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingLogo ? 'Saving...' : 'Save Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Cropper Modal */}
      {showCoverCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
            <h3 className="text-lg font-semibold mb-4">Crop Cover Image</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Drag to reposition. Resize using the corners.
              </p>
              <ReactCrop
                crop={coverCrop}
                onChange={(_, percentCrop) => setCoverCrop(percentCrop)}
                onComplete={(c) => handleCropComplete(c, 'cover')}
                aspect={3}
              >
                <img
                  ref={coverImageRef}
                  src={coverPreview}
                  alt="Cover crop"
                  className="max-h-[400px]"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCoverCropper(false);
                  setCoverPreview(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCropSave('cover')}
                disabled={uploadingCover}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingCover ? 'Saving...' : 'Save Crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 