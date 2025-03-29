"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Header() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login"); // Redirect to the login page
  };

  return (
    <header className="bg-gradient-to-r from-pink-300 to-blue-300 text-center py-4">
      <div className="text-sm text-gray-700" style={{ fontSize: "22px" }}>
        SUNDAY - THURSDAY: 11:30AM - 11PM | FRIDAY & SATURDAY: 11:30AM - 12AM 
      </div>
      <div className="flex justify-end space-x-4 pr-4">
        {/* Login Button */}
        <button
          className="flex items-center justify-center w-10 h-10 bg-white text-black border border-black rounded-full hover:bg-gray-200"
          style={{ cursor: "pointer" }}
          onClick={handleLoginRedirect}
        >
          <i className="fas fa-user" style={{ fontSize: "18px" }}></i>
        </button>

        {/* Shopping Cart Icon */}
        <button
          className="flex items-center justify-center w-10 h-10 bg-white text-black border border-black rounded-full hover:bg-gray-200"
          style={{ cursor: "pointer" }}
        >
          <i className="fas fa-shopping-cart" style={{ fontSize: "18px" }}></i>
        </button>
      </div>
    </header>
  );
}