'use client';
import React, { useEffect } from "react";
import Header from "./components/Header";
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });
    
    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            alt="Restaurant atmosphere"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 py-40">
          <div className="max-w-3xl text-center">
            <p className="text-white text-lg mb-4 tracking-wide">Restaurant Est. 2024</p>
            <h1 className="text-white text-5xl md:text-7xl font-light mb-8 leading-tight">
              Your Go-to Spot for<br />
              <span className="font-black">Vietnamese Cuisine</span>
            </h1>
          </div>
        </div>
        {/* Decorative scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Section divider */}
      <div className="w-full h-24 bg-gradient-to-b from-gray-900 to-white"></div>

      {/* Appetizers Section */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-300 -translate-x-10">
              <h2 className="text-5xl font-black text-black mb-6">Appetizers.</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Start your culinary journey with our exquisite selection of Vietnamese appetizers,
                crafted with authentic ingredients and traditional techniques.
              </p>
              <Link 
                href="/menu/appetizers" 
                className="inline-block px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                Discover More
              </Link>
            </div>
            <div className="relative h-[500px] overflow-hidden animate-on-scroll opacity-0 transition-all duration-700 delay-500 translate-x-10">
              <img
                alt="Appetizers"
                className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 rounded-lg shadow-2xl"
                src="https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=2070&auto=format&fit=crop"
              />
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gray-50 z-10 rounded-tl-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider - decorative pattern */}
      <div className="relative h-32 bg-white overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="flex justify-center items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Main Course Section */}
      <section className="py-28 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative h-[500px] overflow-hidden animate-on-scroll opacity-0 transition-all duration-700 delay-300 -translate-x-10">
              <img
                alt="Main Course"
                className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 rounded-lg shadow-2xl"
                src="https://plus.unsplash.com/premium_photo-1672742955666-34dc33980048?w=600&auto=format&fit=crop"
              />
              <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-white z-10 rounded-tr-2xl"></div>
            </div>
            <div className="order-1 md:order-2 animate-on-scroll opacity-0 transition-all duration-700 delay-500 translate-x-10">
              <h2 className="text-5xl font-black text-black mb-6">Main Course.</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Experience the heart of Vietnamese cuisine with our signature main dishes,
                each one telling a story of tradition and flavor.
              </p>
              <Link 
                href="/menu/main-course" 
                className="inline-block px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider - decorative pattern */}
      <div className="relative h-32 bg-gray-50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="flex justify-center items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Drinks Section */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-300 -translate-x-10">
              <h2 className="text-5xl font-black text-black mb-6">Drinks.</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Refresh and delight with our curated selection of beverages, from traditional
                Vietnamese coffee to creative signature cocktails.
              </p>
              <Link 
                href="/menu/drinks" 
                className="inline-block px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                View Drinks
              </Link>
            </div>
            <div className="relative h-[500px] overflow-hidden animate-on-scroll opacity-0 transition-all duration-700 delay-500 translate-x-10">
              <img
                alt="Drinks"
                className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 rounded-lg shadow-2xl"
                src="https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop"
              />
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gray-50 z-10 rounded-tl-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider - decorative pattern */}
      <div className="relative h-32 bg-white overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
          <div className="flex justify-center items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Desserts Section */}
      <section className="py-28 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative h-[500px] overflow-hidden animate-on-scroll opacity-0 transition-all duration-700 delay-300 -translate-x-10">
              <img
                alt="Dessert"
                className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 rounded-lg shadow-2xl"
                src="https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1974&auto=format&fit=crop"
              />
              <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-white z-10 rounded-tr-2xl"></div>
            </div>
            <div className="order-1 md:order-2 animate-on-scroll opacity-0 transition-all duration-700 delay-500 translate-x-10">
              <h2 className="text-5xl font-black text-black mb-6">Desserts.</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Complete your dining experience with our delicate desserts that balance
                traditional Vietnamese flavors with modern techniques.
              </p>
              <Link 
                href="/menu/desserts" 
                className="inline-block px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                Sweet Endings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Section */}
      <section className="py-24 bg-[#f8f3e9]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll opacity-0 transition-all duration-700">
            <h2 className="text-7xl font-serif font-black text-black mb-6">Drop By for a Bite.</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-center max-w-4xl mx-auto">
            <div className="text-center md:w-1/2 md:pr-12 animate-on-scroll opacity-0 transition-all duration-700 delay-300 -translate-y-10">
              <h3 className="text-3xl font-serif mb-6  text-black  py-2 px-4 inline-block font-bold">Address</h3>
              <p className="text-black font-medium text-lg mt-4">123 Restaurant Street</p>
              <p className="text-black font-medium text-lg">Ho Chi Minh City, Vietnam</p>
            </div>
            <div className="hidden md:block w-px bg-gray-400 mx-auto"></div>
            <div className="text-center md:w-1/2 md:pl-12 mt-12 md:mt-0 animate-on-scroll opacity-0 transition-all duration-700 delay-500 -translate-y-10">
              <h3 className="text-3xl font-serif mb-6  text-black  py-2 px-4 inline-block font-bold">Opening Hours</h3>
              <p className="text-black font-medium text-lg mt-4">Mon - Fri: 9am - 10pm</p>
              <p className="text-black font-medium text-lg">Saturday: 10am - 10pm</p>
              <p className="text-black font-medium text-lg">Sunday: 10am - 9pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="grid grid-cols-2 md:grid-cols-4">
        <div className="relative h-[400px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800" 
            alt="Restaurant ambiance" 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-700"></div>
        </div>
        <div className="relative h-[400px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1576749872435-ff88a71c1ae2?w=800" 
            alt="Food presentation" 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-700"></div>
        </div>
        <div className="relative h-[400px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=800" 
            alt="Drink preparation" 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-700"></div>
        </div>
        <div className="relative h-[400px] overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800" 
            alt="Restaurant interior" 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-700"></div>
        </div>
      </section>

      {/* Add this style tag to the page for animations */}
      <style jsx global>{`
        .animate-on-scroll {
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .animate-in {
          opacity: 1 !important;
          transform: translate(0, 0) !important;
        }
      `}</style>
    </div>
  );
}
