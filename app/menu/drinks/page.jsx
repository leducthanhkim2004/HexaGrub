'use client';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import { menuService } from '../../services/menuService';
import "../style.css";

export default function DrinksPage() {
  const { addToCart } = useCart();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrinks() {
      const items = await menuService.getMenuItemsByCategory('drinks');
      setDrinks(items);
      setLoading(false);
    }
    loadDrinks();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Drinks</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drinks.map((item) => (
            <div key={item.id} className="item_Container">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-4">
                <h3 className="item_Name">{item.name}</h3>
                <p className="item_Description">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="item_Price">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 