'use client';
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import { menuService } from '../../services/menuService';
import '../style.css';
export default function DessertsPage() {
  const { addToCart } = useCart();
  const [desserts, setDesserts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDesserts() {
      const items = await menuService.getMenuItemsByCategory('desserts');
      setDesserts(items);
      setLoading(false);
    }
    loadDesserts();
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
      <main className="container mx-auto px-10 py-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Desserts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {desserts.map((item) => (
            <div key={item.id} className="bg-gray rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-30 aspect-h-10">
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