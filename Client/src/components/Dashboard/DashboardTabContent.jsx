import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import MyApps from './MyApps';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import {
  Bitcoin,
  Brush,
  Gamepad2,
  Smartphone,
  Lock,
  Package,
  Hospital,
  BookOpen,
  Zap
} from "lucide-react";

function TabContent({ tab, setActiveTab }) {
  const navigate = useNavigate();
  const [recentApps, setRecentApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (tab === "home") {
      fetchRecentApps();
    }
  }, [tab]);

  const fetchRecentApps = async () => {
    try {
      const token = localStorage.getItem('Testnet_auth_token');
      if (!token) {
        setLoadingApps(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/my-apps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Get the 3 most recent apps
        setRecentApps((data.apps || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch recent apps:', err);
    } finally {
      setLoadingApps(false);
    }
  };

 
const getCategoryIcon = (category) => {
  const icons = {
    "blockchain": <Bitcoin className="w-6 h-6 text-yellow-600" />,
    "Crypto": <Brush className="w-6 h-6 text-pink-500" />,
    "Gaming": <Gamepad2 className="w-6 h-6 text-green-500" />,
    "Social Media": <Smartphone className="w-6 h-6 text-blue-500" />,
    "Identity Management": <Lock className="w-6 h-6 text-orange-500" />,
    "Supply Chain": <Package className="w-6 h-6 text-indigo-600" />,
    "Healthcare": <Hospital className="w-6 h-6 text-red-500" />,
    "Education": <BookOpen className="w-6 h-6 text-purple-500" />,
    "Other": <Zap className="w-6 h-6 text-gray-500" />
  };

  return icons[category] || <Zap className="w-6 h-6 text-gray-500" />;
};

  if (tab === "home") {
    return (
      <div className="tab-content max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">Premium</div>
              <h2>Welcome to Easy Web3 Auth Suite</h2>
              <p>Easily Setup Decentralized Authentication in Your React Project With Simple Modules and resources.</p>
              <div className="hero-buttons">
                <button 
                  onClick={() => navigate('/backend-setup')}
                  className="btn btn-primary"
                >
                  Explore Docs
                </button>
                <button 
                  onClick={() => navigate('/register-app')}
                  className="btn btn-outline text-white">
                
                  Create New App
                </button>
              </div>
            </div>
            <div className="hero-decoration">
              <div className="spinning-circles">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
                <div className="circle circle-4"></div>
                <div className="circle circle-5"></div>
              </div>
            </div>
          </div>
        </section>
        {/* Quick Stats */}
        <section className="section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Total Apps</h3>
                  <p className="text-2xl font-bold">{recentApps.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Active Apps</h3>
                  <p className="text-2xl font-bold">{recentApps.filter(app => app.isActive).length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">This Month</h3>
                  <p className="text-2xl font-bold">{recentApps.reduce((sum, app) => sum + (app.usage?.monthlyRequests || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Apps */}
        <section className="section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <button 
              onClick={() => setActiveTab('Apps')}
              className="btn btn-ghost"
            >
              View All
            </button>
          </div>
          
          {loadingApps ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : recentApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentApps.map((app) => (
                <div key={app.appId} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-violet-100 to-purple-200 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-3">
                          {getCategoryIcon(app.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{app.appName}</h3>
                          <p className="text-sm text-gray-500">{app.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {app.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {app.developerName}
                      </div>
                      {app.organizationName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {app.organizationName}
                        </div>
                      )}
                    </div>

                    {app.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('registered_app_id', app.appId);
                            navigate('/app-setup');
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-md transition-colors"
                          title="Setup & Documentation"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Setup
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('registered_app_id', app.appId);
                            navigate('/app-setup?tab=settings');
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                          title="Edit & Settings"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Create your first dApp to get started with SIWE authentication.</p>
              <button
                onClick={() => navigate('/register-app')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First App
              </button>
            </div>
          )}
        </section>

        
      </div>
    );
  }

  if (tab === "Apps") {
    return (
      <div className="tab-content">
        <MyApps />
      </div>
    );
  }

  if (tab === "Profile") {
    return (
      <div className="tab-content">
        <Profile />
      </div>
    );
  }

  return <div>Content for {tab}</div>;
}

export default TabContent;
