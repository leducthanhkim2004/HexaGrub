'use client';
import React from "react";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="bg-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="text-center py-8">
        <img
          alt="Restaurant logo"
          className="mx-auto mb-4 w-14 h-14"
          src="https://plus.unsplash.com/premium_photo-1675865396004-c7b86406affe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U291dGglMjBWaWV0bmFtJTIwZmxhZ3xlbnwwfHwwfHx8MA%3D%3D"
          style={{ width: "180px", height: "180px",borderRadius: "50%" }}
        />
        <h1>
          Welcome To HexaGrub
        </h1>
        <p className="sologan">
          Welcome To IRestaurant - Where Every Meal Is An Experience!
        </p>
        <button className="mt-4 px-6 py-2 bg-white text-black border border-black rounded">
          Order Now
        </button>
      </main>

      {/* Menu Section */}
      <section className="bg-white py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
          <div className="text-center">
            <img
              alt="Appetizers"
              className="mx-auto mb-2"
              src="https://images.unsplash.com/photo-1577906096429-f73c2c312435?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              style={{ width: "200px", height: "200px",borderRadius: "10px",borderColor: "black" }}
            />
            <a
              href="/menu/appetizers"
              className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
              style={{ fontSize: "20px" }}
            >
              Appetizers
            </a>
          </div>
          <div className="text-center">
            <img
              alt="Main Course"
              className="mx-auto mb-2"
              src="https://plus.unsplash.com/premium_photo-1672742955666-34dc33980048?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFpbiUyMGNvdXJzZXxlbnwwfHwwfHx8MA%3D%3D"
              style={{ width: "200px", height: "200px",borderRadius: "10px",borderColor: "black" }}
            />
            <a
              href="/menu/main-course"
              className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
              style={{ fontSize: "20px" }}
            >
              Main Course
            </a>
          </div>
          <div className="text-center">
            <img
              alt="Drinks"
              className="mx-auto mb-2"
              src="https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fERyaW5rfGVufDB8fDB8fHww"
              style={{ width: "200px", height: "200px",borderRadius: "10px",borderColor: "black" }}
            />
            <a
              href="/menu/drinks"
              className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
              style={{ fontSize: "20px" }}
            >
              Drinks
            </a>
          </div>
          <div className="text-center">
            <img
              alt="Dessert"
              className="mx-auto mb-2"
              src="https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              style={{ width: "200px", height: "200px",borderRadius: "10px",borderColor: "black" }}
            />
            <a
              href="/menu/desserts"
              className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
              style={{ fontSize: "20px" }}
            >
              Dessert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
