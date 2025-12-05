import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ServerCog,
  Palette,
  BookOpen,
  Settings,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Zap,
  Globe,
  Database,
  Code,
  Terminal,
  ArrowLeft,
  RefreshCw,
  Key,
  Package,
  Monitor,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { useNotifications } from '../contexts/NotificationContext';
import { API_URL } from '../config/api';

function AppSetup() {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  const { addAppDeletedNotification, addAppUpdatedNotification } = useNotifications();
  const [appData, setAppData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const appId = localStorage.getItem('registered_app_id');
    if (!appId) {
      navigate('/register-app');
      return;
    }
    
    // Check URL parameters for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'backend', 'frontend', 'api', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Fetch real app data from API
    fetchAppData(appId);
  }, [navigate]);

  const fetchAppData = async (appId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('Testnet_auth_token');
      if (!token) {
        error('Authentication required');
        navigate('/dashboard');
        return;
      }

      const response = await fetch(`${API_URL}/api/app/${appId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppData({
          id: data.app.appId,
          name: data.app.appName,
          developer: data.app.developerName,
          apiKey: data.app.apiKey,
          appId: data.app.appId,
          description: data.app.description || '',
          category: data.app.category || 'Other',
          email: data.app.email,
          organizationName: data.app.organizationName,
          profession: data.app.profession,
          isActive: data.app.isActive,
          createdAt: data.app.createdAt
        });
      } else if (response.status === 404) {
        error('Application not found');
        navigate('/dashboard');
      } else {
        throw new Error('Failed to fetch app data');
      }
    } catch (err) {
      console.error('Failed to fetch app data:', err);
      error('Failed to load application data');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      name: appData.name,
      developer: appData.developer,
      description: appData.description || '',
      category: appData.category || 'Other'
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('Testnet_auth_token');
      if (!token) {
        error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/api/apps/${appData.appId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedApp = await response.json();
        // Update local state with new data
        setAppData(prev => ({ 
          ...prev, 
          name: editForm.name,
          developer: editForm.developer,
          description: editForm.description,
          category: editForm.category
        }));
        setIsEditing(false);
        setEditForm({});
        success('App updated successfully!');
        // Add to notification center
        addAppUpdatedNotification(editForm.name);
      } else {
        throw new Error('Failed to update app');
      }
    } catch (error) {
      console.error('Update failed:', error);
      error('Failed to update app. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStart = () => {
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== appData.name) {
      error('Please type the exact app name to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('Testnet_auth_token');
      if (!token) {
        error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/api/apps/${appData.appId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('registered_app_id');
        success('App deleted successfully!');
        // Add to notification center
        addAppDeletedNotification(appData.name);
        navigate('/dashboard');
      } else {
        throw new Error('Failed to delete app');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      error('Failed to delete app. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    success(`${label} copied to clipboard!`);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: Home, description: "Project summary and quick start" },
    { id: "backend", name: "Backend", icon: ServerCog, description: "Server setup and configuration" },
    { id: "frontend", name: "Frontend", icon: Palette, description: "Client integration guide" },
    { id: "api", name: "API Docs", icon: BookOpen, description: "Complete API reference" },
    { id: "npm", name: "NPM Package", icon: Package, description: "Package documentation", isExternal: true, url: "https://www.npmjs.com/package/@gitalien/auth_package" },
    { id: "settings", name: "Settings", icon: Settings, description: "Project configuration" }
  ];

  if (isLoading || !appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading your project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Back Button (always visible) */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Divider & Project Details (hidden on mobile) */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-px h-6 bg-slate-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold text-slate-900">{appData.name}</h1>
                  <p className="text-sm text-slate-500">Project Configuration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section (hidden on mobile) */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Active
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>

        </div>
      </div>
    </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="space-y-6 sticky top-24">
              {/* Navigation */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Navigation</h3>
                </div>
                <nav className="p-2">
                  {tabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (tab.isExternal) {
                            window.open(tab.url, '_blank');
                          } else {
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all group ${
                          activeTab === tab.id && !tab.isExternal
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 mr-3 ${
                          activeTab === tab.id && !tab.isExternal ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{tab.name}</div>
                          <div className="text-xs text-slate-500 truncate">{tab.description}</div>
                        </div>
                        {tab.isExternal && (
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        )}
                        {activeTab === tab.id && !tab.isExternal && (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Project Credentials */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center">
                    <Key className="w-4 h-4 text-slate-400 mr-2" />
                    <h3 className="text-sm font-semibold text-slate-900">API Credentials</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">App ID</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-slate-100 text-slate-800 px-2 py-1.5 rounded font-mono">
                        {appData.appId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(appData.appId, 'App ID')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">API Key</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-xs bg-slate-100 text-slate-800 px-2 py-1.5 rounded font-mono">
                        {appData.apiKey.slice(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(appData.apiKey, 'API Key')}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Project Stats</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Created</span>
                    <span className="font-medium text-slate-900">Jan 1, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Category</span>
                    <span className="font-medium text-slate-900">{appData.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-slate-200">
              {activeTab === 'overview' && (
                <div className="p-8">
                  {/* Hero Section */}
                  <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">🎉 Project Ready!</h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                      Your application <span className="font-semibold text-blue-600">{appData.name}</span> is successfully registered 
                      and ready for SIWE authentication integration.
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    {[
                      {
                        title: "Backend Setup",
                        description: "Configure your server with our auth package",
                        icon: ServerCog,
                        color: "from-green-500 to-emerald-600",
                        action: () => setActiveTab('backend'),
                        time: "5 min"
                      },
                      {
                        title: "Frontend Guide",
                        description: "Integrate React components and wallet connection",
                        icon: Monitor,
                        color: "from-blue-500 to-cyan-600",
                        action: () => setActiveTab('frontend'),
                        time: "10 min"
                      },
                      {
                        title: "API Reference",
                        description: "Complete documentation and examples",
                        icon: BookOpen,
                        color: "from-purple-500 to-pink-600",
                        action: () => setActiveTab('api'),
                        time: "Reference"
                      },
                      {
                        title: "NPM Package",
                        description: "View package on NPM registry",
                        icon: Package,
                        color: "from-orange-500 to-red-600",
                        action: () => window.open('https://www.npmjs.com/package/@gitalien/auth_package', '_blank'),
                        time: "External"
                      }
                    ].map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="group cursor-pointer" onClick={item.action}>
                          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {item.time}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                              <span>Get Started</span>
                              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Features Overview */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">What's Included</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { icon: Shield, title: "SIWE Authentication", desc: "Secure wallet-based login system" },
                        { icon: Key, title: "JWT Management", desc: "Token-based session handling" },
                        { icon: Globe, title: "ENS Resolution", desc: "Resolve .eth domain names" },
                        { icon: Database, title: "User Analytics", desc: "Login tracking and statistics" }
                      ].map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={index} className="text-center">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">{feature.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{feature.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Installation */}
                  <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Terminal className="w-5 h-5 text-green-400 mr-3" />
                        <h4 className="text-lg font-semibold text-white">Quick Install</h4>
                      </div>
                      <span className="px-3 py-1 bg-blue-600 text-blue-100 text-xs font-medium rounded-full">v1.2.0</span>
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 mb-4">
                      <code className="text-green-400 font-mono text-sm">npm install @gitalien/auth_package@1.2.0</code>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Complete SIWE authentication solution with MongoDB integration, JWT tokens, and production-ready security features.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'backend' && (
                <div className="p-8">
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <ServerCog className="w-6 h-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">Backend Integration</h2>
                    </div>
                    <p className="text-slate-600 text-lg">
                      Set up SIWE authentication on your server using our auth package
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                        <h3 className="text-lg font-semibold text-slate-900">Install the Package</h3>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 mb-4">
                        <code className="text-green-400 font-mono text-sm">npm install @gitalien/auth_package@1.2.0</code>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                        <h3 className="text-lg font-semibold text-slate-900">Environment Configuration</h3>
                      </div>
                      <p className="text-slate-600 mb-4">Create a <code className="bg-slate-200 px-2 py-1 rounded text-sm">.env</code> file in your project root:</p>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-purple-400 font-mono text-sm">{`# Required Configuration
MONGODB_URI=mongodb://localhost:27017/your-app-name
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Optional (for ENS resolution)
INFURA_KEY=your-infura-project-id-here

# Server Configuration
PORT=5000`}</pre>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                        <h3 className="text-lg font-semibold text-slate-900">Server Setup</h3>
                      </div>
                      <p className="text-slate-600 mb-4">Add this to your <code className="bg-slate-200 px-2 py-1 rounded text-sm">server.js</code> file:</p>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
                        <pre className="text-blue-400 font-mono text-sm">{`const express = require('express');
const dotenv = require('dotenv');
const { initializeSwecAuth, authenticateJWT } = require('@gitalien/auth_package');

dotenv.config();
const app = express();

// Basic middleware
app.use(express.json());

// Initialize SIWE authentication
const authRouter = initializeSwecAuth({
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
  domain: 'localhost:5000',
  uri: 'http://localhost:5000',
  chainId: 1, // 1 for Ethereum, 137 for Polygon
  infuraKey: process.env.INFURA_KEY, // Optional for ENS
});

// Mount auth routes - all endpoints available at /api/*
app.use('/api', authRouter);

// Example: Protect your existing routes
app.get('/api/user/profile', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
  res.json({ 
    address: req.user.address,
    message: 'This is your protected profile data' 
  });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));`}</pre>
                      </div>
                    </div>

                    {/* Available Endpoints */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Available API Endpoints</h3>
                      </div>
                      <div className="grid gap-3">
                        {[
                          { method: 'GET', endpoint: '/api/challenge/:address', desc: 'Get SIWE challenge' },
                          { method: 'POST', endpoint: '/api/auth', desc: 'Verify signature and get JWT token' },
                          { method: 'GET', endpoint: '/api/userinfo', desc: 'Get user profile (protected)' },
                          { method: 'GET', endpoint: '/api/stats/users', desc: 'Get platform statistics' },
                          { method: 'POST', endpoint: '/api/resolve-ens', desc: 'Resolve ENS names' }
                        ].map((api, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold mr-3 ${
                              api.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {api.method}
                            </span>
                            <code className="text-slate-700 mr-3">{api.endpoint}</code>
                            <span className="text-slate-600">{api.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'frontend' && (
                <div className="p-8">
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Palette className="w-6 h-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">Frontend Integration</h2>
                    </div>
                    <p className="text-slate-600 text-lg">
                      Complete React integration guide for wallet authentication
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Dependencies */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <Package className="w-5 h-5 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Install Dependencies</h3>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <code className="text-green-400 font-mono text-sm">npm install ethers jwt-decode</code>
                      </div>
                    </div>

                    {/* React Component */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <Code className="w-5 h-5 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Authentication Component</h3>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96">
                        <pre className="text-blue-400 font-mono text-sm">{`import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

function WalletAuth() {
  const [account, setAccount] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      setAuthStatus("MetaMask not found! Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setAuthStatus("Wallet connected successfully!");
    } catch (err) {
      setAuthStatus("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", err);
    }
  };

  // Authenticate with SIWE
  const authenticate = async () => {
    if (!account) {
      setAuthStatus("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setAuthStatus("");

    try {
      // Step 1: Get challenge from your auth package
      const challengeRes = await fetch(\`http://localhost:5000/api/challenge/\${account}\`);
      const challengeData = await challengeRes.json();
      
      if (challengeData.error) {
        setAuthStatus(\`Error: \${challengeData.error}\`);
        setIsLoading(false);
        return;
      }

      // Step 2: Sign the challenge
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(challengeData.challenge);

      // Step 3: Send signature for verification
      const authRes = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature }),
      });

      const result = await authRes.json();

      if (result.success && result.token) {
        localStorage.setItem("auth_token", result.token);
        setToken(result.token);
        setAuthStatus("✅ Authentication successful!");
        setIsAuthenticated(true);
      } else {
        setAuthStatus(\`Authentication failed: \${result.error || "Unknown error"}\`);
      }
    } catch (err) {
      setAuthStatus("Authentication failed. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Component render logic here...
}

export default WalletAuth;`}</pre>
                      </div>
                    </div>

                    {/* Usage Examples */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-center mb-4">
                        <Terminal className="w-5 h-5 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Making Authenticated Requests</h3>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-purple-400 font-mono text-sm">{`// Making authenticated API calls
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(\`http://localhost:5000\${endpoint}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.reload();
    return;
  }
  
  return response.json();
};

// Usage examples
const getUserInfo = () => makeAuthenticatedRequest('/api/userinfo');
const updateSettings = (data) => makeAuthenticatedRequest('/api/settings', {
  method: 'POST',
  body: JSON.stringify(data)
});`}</pre>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-4">
                        <Info className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Integration Features</h3>
                      </div>
                      <div className="grid gap-3">
                        {[
                          'MetaMask wallet connection',
                          'SIWE challenge/response authentication',
                          'JWT token management with expiration',
                          'ENS name resolution',
                          'Account switching detection',
                          'Session persistence with localStorage',
                          'Complete error handling'
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-slate-700">
                            <CheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="p-8">
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">API Reference</h2>
                    </div>
                    <p className="text-slate-600 text-lg">
                      Complete API documentation for the auth package
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Authentication Endpoints */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-900 flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        Authentication
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          {
                            method: 'GET',
                            endpoint: '/api/challenge/:address',
                            description: 'Generate SIWE challenge for wallet address',
                            example: 'GET /api/challenge/0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8',
                            response: `{
  "challenge": "localhost:5000 wants you to sign in with your Ethereum account:\\n0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8\\n\\nPlease sign in.\\n\\nURI: http://localhost:5000\\nVersion: 1\\nChain ID: 1\\nNonce: Kj8B3QwP6gXvN2mR\\nIssued At: 2024-01-15T10:30:00.000Z"
}`
                          },
                          {
                            method: 'POST',
                            endpoint: '/api/auth',
                            description: 'Verify signature and issue JWT token',
                            example: `POST /api/auth
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8",
  "signature": "0x..."
}`,
                            response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewUser": false,
  "message": "Authentication successful"
}`
                          }
                        ].map((api, index) => (
                          <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-white">
                              <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold mr-3 ${
                                  api.method === 'GET' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {api.method}
                                </span>
                                <code className="text-slate-800 font-mono">{api.endpoint}</code>
                              </div>
                              <p className="text-slate-600 text-sm mt-2">{api.description}</p>
                            </div>
                            <div className="p-6 space-y-4">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2">Example Request</h5>
                                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                  <pre className="text-green-400 font-mono text-xs">{api.example}</pre>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold text-slate-700 mb-2">Example Response</h5>
                                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                  <pre className="text-blue-400 font-mono text-xs">{api.response}</pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Protected Endpoints */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-slate-900 flex items-center">
                        <Key className="w-5 h-5 text-blue-600 mr-2" />
                        Protected Routes
                      </h3>
                      
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center text-orange-800">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <span className="font-medium text-sm">These endpoints require a valid JWT token in the Authorization header</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-white">
                          <div className="flex items-center">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold mr-3 bg-green-100 text-green-800">
                              GET
                            </span>
                            <code className="text-slate-800 font-mono">/api/userinfo</code>
                            <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Protected</span>
                          </div>
                          <p className="text-slate-600 text-sm mt-2">Get authenticated user profile and statistics</p>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <h5 className="text-sm font-semibold text-slate-700 mb-2">Example Request</h5>
                            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                              <pre className="text-green-400 font-mono text-xs">{`GET /api/userinfo
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</pre>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-slate-700 mb-2">Example Response</h5>
                            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                              <pre className="text-blue-400 font-mono text-xs">{`{
  "address": "0x742d35Cc6634C0532925a3b8D9C9C0532925a3b8",
  "ensName": "example.eth",
  "loginCount": 15,
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "reloginPeriod": 60,
  "createdAt": "2024-01-01T00:00:00.000Z"
}`}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-8">
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Settings className="w-6 h-6 text-blue-600 mr-3" />
                      <h2 className="text-2xl font-bold text-slate-900">Project Settings</h2>
                    </div>
                    <p className="text-slate-600 text-lg">
                      Manage your project configuration and settings
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Project Information */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-900">Project Information</h3>
                          {!isEditing && (
                            <button
                              onClick={handleEditStart}
                              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        {!isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-slate-500">Project Name</label>
                              <p className="text-slate-900 font-medium">{appData.name}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-slate-500">Developer</label>
                              <p className="text-slate-900 font-medium">{appData.developer}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-slate-500">Category</label>
                              <p className="text-slate-900 font-medium">{appData.category}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-slate-500">Status</label>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-sm font-medium text-slate-500">Description</label>
                              <p className="text-slate-900">{appData.description || 'No description provided'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                                <input
                                  type="text"
                                  value={editForm.name || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter project name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Developer Name</label>
                                <input
                                  type="text"
                                  value={editForm.developer || ''}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, developer: e.target.value }))}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter developer name"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                              <select
                                value={editForm.category || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="DeFi">DeFi</option>
                                <option value="NFT Marketplace">NFT Marketplace</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Identity Management">Identity Management</option>
                                <option value="Supply Chain">Supply Chain</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                              <textarea
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                placeholder="Enter project description"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleEditSave}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                              >
                                {isSaving ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={handleEditCancel}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                          <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Delete Project</h4>
                          <p className="text-sm text-slate-600 mb-4">
                            Once you delete this project, there is no going back. This action cannot be undone.
                          </p>
                          <div className="bg-red-50 rounded-lg p-4 mb-4">
                            <h5 className="text-sm font-semibold text-red-800 mb-2">This will permanently delete:</h5>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• All project data and configuration</li>
                              <li>• API keys and credentials</li>
                              <li>• All associated integrations</li>
                              <li>• Usage analytics and logs</li>
                            </ul>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteStart}
                          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border border-slate-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900">Delete Project</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-slate-600">
                <p className="mb-4">
                  Are you sure you want to delete <span className="font-semibold text-red-600">{appData.name}</span>? 
                  This will permanently remove the project and all associated data.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-xs font-medium mb-2">
                    To confirm deletion, please type the exact project name:
                  </p>
                  <p className="text-red-600 font-mono text-sm font-semibold">{appData.name}</p>
                </div>
                
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type project name here..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || deleteConfirmText !== appData.name}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default AppSetup;