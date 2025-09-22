import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import NotificationBox from './NotificationBox';
import "./Header.css";

function Header({ activeTab, setActiveTab, notifications, onNotificationOpenChange }) {
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState("");
  const tabs = ["home", "Apps", "Profile"];

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

  const handleLogout = () => {
    localStorage.removeItem("Testnet_auth_token");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-4 md:mx-6 lg:mx-8 px-4 md:px-6 lg:px-8">
        {/* Single row with brand, navigation, and actions */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Brand */}
            <div className="flex items-center">
            <div className="flex-shrink-0">
            <img 
              src="./icon.png" 
              alt="Icon" 
              className="h-8 w-8 object-contain"
            />
          </div>

              <h1 className="ml-2 text-xl font-bold text-gray-900">DID Auth</h1>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: User info and actions */}

          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
              <span>Connected:</span>
              <span className="font-mono text-violet-600">
                {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "N/A"}
              </span>
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100" title="Cloud Storage">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 17.58A5 5 0 0018 9h-1.26A8 8 0 104 16.25" />
                <path d="M16 16h1a4 4 0 000-8h-1.26" />
              </svg>
            </button>

            <NotificationBox onOpenChange={onNotificationOpenChange} />

            <button
              onClick={() => navigate('/register-app')}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              title="Register New App"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New App
            </button>

            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-2">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === tab
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;