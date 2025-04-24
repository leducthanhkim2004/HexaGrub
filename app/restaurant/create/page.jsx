'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restaurantService } from '../../services/restaurantService';
import Header from '../../components/Header';
import Image from 'next/image';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form validation schema
const schema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export default function CreateRestaurantPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // React Hook Form
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
    }
  });

  // Image upload states
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoCrop, setLogoCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [coverCrop, setCoverCrop] = useState({ unit: '%', width: 100, aspect: 16 / 9 });
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
  }, [user]);

  const checkAuth = async () => {
    try {
      if (authLoading) return;
      
      if (!user) {
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
      setError('Failed to verify authentication. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result);
        setShowLogoCropper(true);
      } else {
        setCoverFile(file);
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

  const handleCropSave = async (type) => {
    try {
      const imageRef = type === 'logo' ? logoImageRef : coverImageRef;
      const crop = type === 'logo' ? logoCrop : coverCrop;
      
      if (!imageRef.current || !crop) {
        throw new Error('Please select an area to crop');
      }

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
    } catch (error) {
      setError(`Error cropping ${type} image: ${error.message}`);
    }
  };

  const onSubmit = async (formData) => {
    try {
      if (!logoFile || !coverFile) {
        throw new Error('Please upload both logo and cover images');
      }

      setLoading(true);
      setError('');

      const restaurant = await restaurantService.createRestaurant(formData);

      if (!restaurant?.id) {
        throw new Error('Failed to create restaurant. Please try again.');
      }

      // Upload images
      const imageFormData = new FormData();
      imageFormData.append('logo', logoFile);
      imageFormData.append('cover', coverFile);
      imageFormData.append('restaurantId', restaurant.id);

      await restaurantService.uploadRestaurantImages(imageFormData);

      setSuccess(true);
      reset(); // Reset form
      
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push('/restaurant-admin');
      }, 2000);
    } catch (error) {
      console.error('Error creating restaurant:', error);
      setError(error.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Restaurant</h1>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the details below to set up your restaurant profile.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Restaurant created successfully! Redirecting...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Restaurant Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                type="text"
                id="address"
                {...register('address')}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Restaurant Logo *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {showLogoCropper ? (
                    <div className="space-y-4 w-full">
                      <ReactCrop
                        src={logoPreview}
                        onImageLoaded={(img) => {
                          logoImageRef.current = img;
                          return false;
                        }}
                        crop={logoCrop}
                        onChange={(crop) => handleCropComplete(crop, 'logo')}
                        aspect={1}
                        className="max-h-48 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleCropSave('logo')}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Crop
                      </button>
                    </div>
                  ) : logoPreview ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-48 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change Logo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="logo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a logo</span>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {showCoverCropper ? (
                    <div className="space-y-4 w-full">
                      <ReactCrop
                        src={coverPreview}
                        onImageLoaded={(img) => {
                          coverImageRef.current = img;
                          return false;
                        }}
                        crop={coverCrop}
                        onChange={(crop) => handleCropComplete(crop, 'cover')}
                        aspect={16 / 9}
                        className="max-h-48 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleCropSave('cover')}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Crop
                      </button>
                    </div>
                  ) : coverPreview ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="max-h-48 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change Cover
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="cover-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a cover</span>
                          <input
                            id="cover-upload"
                            name="cover-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleImageUpload(e, 'cover')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  if (Object.keys(errors).length > 0 || logoFile || coverFile) {
                    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
                      router.push('/');
                    }
                  } else {
                    router.push('/');
                  }
                }}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading || success
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : success ? (
                  'Created!'
                ) : (
                  'Create Restaurant'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 