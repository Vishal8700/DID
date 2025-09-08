import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Header.css";

function Header({ setSidebarOpen, sidebarOpen, setMobileMenuOpen, notifications }) {
  const [userAddress, setUserAddress] = useState("");

  // Fetch user address from token on mount
  useEffect(() => {
    const token = localStorage.getItem("Testnet_auth_token") || "";
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserAddress(decoded.address || "N/A");
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUserAddress("N/A");
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 border-b border-gray-200 backdrop-blur-md px-4 md:px-6">
      <div className="flex-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>

        <div className="flex items-center gap-3">
          <button className="btn btn-icon" title="Cloud Storage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M20 17.58A5 5 0 0018 9h-1.26A8 8 0 104 16.25" />
              <path d="M16 16h1a4 4 0 000-8h-1.26" />
            </svg>
          </button>

          <button className="btn btn-icon" title="Messages">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z" />
            </svg>
          </button>

          <button className="relative btn btn-icon" title="Notifications">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>          
        </div>
      </div>
    </header>
  );
}

export default Header;