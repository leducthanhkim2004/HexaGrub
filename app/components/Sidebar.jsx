'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-xl font-bold text-gray-800 block">
          HexaGrub
        </Link>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center ring-2 ring-gray-200">
            <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-gray-900 font-bold text-lg">My Account</h2>
            <button className="text-gray-800 text-sm hover:text-gray-900 transition-colors font-medium">Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-6">
        <div className="space-y-6">
          {/* My Account Section */}
          <div>
            <div className="flex items-center space-x-3 p-3 text-gray-900 font-bold bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Account</span>
            </div>
            <div className="mt-2 space-y-1">
              <Link 
                href="/profile" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Orders Section */}
          <div>
            <div className="flex items-center space-x-3 p-3 text-gray-900 font-bold bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Orders</span>
            </div>
            <div className="mt-2 space-y-1">
              <Link 
                href="/orders" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Order History
              </Link>
            </div>
          </div>

          {/* Menu Section */}
          <div>
            <div className="flex items-center space-x-3 p-3 text-gray-900 font-bold bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Menu</span>
            </div>
            <div className="mt-2 space-y-1">
              <Link 
                href="/menu/appetizers" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Appetizers
              </Link>
              <Link 
                href="/menu/main-course" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Main Course
              </Link>
              <Link 
                href="/menu/drinks" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Drinks
              </Link>
              <Link 
                href="/menu/desserts" 
                className="block pl-10 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors font-medium"
              >
                Desserts
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}