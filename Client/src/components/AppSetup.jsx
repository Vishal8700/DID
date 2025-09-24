import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ServerCog,
  Palette,
  BookOpen,
  Settings
} from "lucide-react";
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { useNotifications } from '../contexts/NotificationContext';
function AppSetup() {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  const { addAppDeletedNotification, addAppUpdatedNotification } = useNotifications();
  const [appData, setAppData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);
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

      const response = await fetch(`http://localhost:5000/api/app/${appId}`, {
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

  const handleDownload = async (type) => {
    setIsDownloading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would download actual files
      const link = document.createElement('a');
      link.href = '#';
      link.download = `siwe-${type}-template.zip`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
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

      const response = await fetch(`http://localhost:5000/api/apps/${appData.appId}`, {
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

      const response = await fetch(`http://localhost:5000/api/apps/${appData.appId}`, {
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

  const tabs = [
    { id: "overview", name: "Overview", icon: <Home className="w-5 h-5" /> },
    { id: "backend", name: "Backend Setup", icon: <ServerCog className="w-5 h-5" /> },
    { id: "frontend", name: "Frontend Setup", icon: <Palette className="w-5 h-5" /> },
    { id: "api", name: "API Reference", icon: <BookOpen className="w-5 h-5" /> },
    { id: "settings", name: "Settings", icon: <Settings className="w-5 h-5" /> }
  ];

  if (isLoading || !appData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
          <p className="text-white text-lg">Loading application data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-white">{appData.name}</h1>
                    <p className="text-sm text-slate-400">Setup & Documentation</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Setup</h3>
                <nav className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>

                {/* App Credentials */}
                <div className="mt-8 p-4 bg-black/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3">App Credentials</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400">App ID</label>
                      <div className="flex items-center mt-1">
                        <code className="text-xs text-violet-300 bg-black/50 px-2 py-1 rounded flex-1 mr-2">
                          {appData.appId}
                        </code>
                        <button className="text-slate-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">API Key</label>
                      <div className="flex items-center mt-1">
                        <code className="text-xs text-violet-300 bg-black/50 px-2 py-1 rounded flex-1 mr-2">
                          {appData.apiKey.slice(0, 20)}...
                        </code>
                        <button className="text-slate-400 hover:text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-4">🎉 Congratulations!</h2>
                      <p className="text-slate-300 text-lg">
                        Your application <span className="text-violet-400 font-semibold">{appData.name}</span> has been successfully registered. 
                        You can now integrate SIWE authentication into your project.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-xl p-6 border border-violet-500/30">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2m8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-white ml-4">Backend Template</h3>
                        </div>
                        <p className="text-slate-300 mb-4">Complete Node.js backend with SIWE authentication, MongoDB integration, and API endpoints.</p>
                        <button
                          onClick={() => handleDownload('backend')}
                          disabled={isDownloading}
                          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          {isDownloading ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download Backend
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-white ml-4">Frontend Template</h3>
                        </div>
                        <p className="text-slate-300 mb-4">React frontend with MetaMask integration, authentication flow, and responsive UI components.</p>
                        <button
                          onClick={() => handleDownload('frontend')}
                          disabled={isDownloading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          {isDownloading ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download Frontend
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-semibold text-yellow-400">Next Steps</h4>
                          <ul className="mt-2 text-slate-300 space-y-1">
                            <li>• Download and extract the template files</li>
                            <li>• Configure your environment variables</li>
                            <li>• Install dependencies with npm install</li>
                            <li>• Start developing your dApp!</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'backend' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Backend Setup Guide</h2>
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Installation</h3>
                        <pre className="bg-black/50 rounded p-3 text-green-400 text-sm overflow-x-auto">
{`npm install express cors siwe jsonwebtoken mongoose dotenv express-rate-limit ethers`}
                        </pre>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Environment Variables</h3>
                        <pre className="bg-black/50 rounded p-3 text-violet-400 text-sm overflow-x-auto">
{`PORT=5000
JWT_SECRET=your-secret-key-change-this
MONGODB_URI=your-mongodb-atlas-uri
INFURA_KEY=your-infura-project-id`}
                        </pre>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
                        <pre className="bg-black/50 rounded p-3 text-blue-400 text-sm overflow-x-auto">
{`npm start
# Server will run on http://localhost:5000`}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'frontend' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Frontend Setup Guide</h2>
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Installation</h3>
                        <pre className="bg-black/50 rounded p-3 text-green-400 text-sm overflow-x-auto">
{`npm install react react-dom ethers jwt-decode react-router-dom`}
                        </pre>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Configuration</h3>
                        <pre className="bg-black/50 rounded p-3 text-violet-400 text-sm overflow-x-auto">
{`// Update API endpoint in auth components
const API_BASE_URL = 'http://localhost:5000';`}
                        </pre>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Development</h3>
                        <pre className="bg-black/50 rounded p-3 text-blue-400 text-sm overflow-x-auto">
{`npm run dev
# Frontend will run on http://localhost:5173`}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">API Reference</h2>
                    <div className="space-y-4">
                      {[
                        { method: 'GET', endpoint: '/api/challenge/:address', desc: 'Generate SIWE challenge' },
                        { method: 'POST', endpoint: '/api/auth', desc: 'Verify signature and issue JWT' },
                        { method: 'GET', endpoint: '/api/userinfo', desc: 'Get user information (protected)' },
                        { method: 'POST', endpoint: '/api/resolve-ens', desc: 'Resolve ENS name' }
                      ].map((api, index) => (
                        <div key={index} className="bg-black/30 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold mr-3 ${
                              api.method === 'GET' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                              {api.method}
                            </span>
                            <code className="text-violet-400">{api.endpoint}</code>
                          </div>
                          <p className="text-slate-300 text-sm">{api.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-4">⚙️ Project Settings</h2>
                      <p className="text-slate-300 text-lg">
                        Manage your application settings, update project details, or delete your project.
                      </p>
                    </div>

                    {/* Update Project Section */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-white">Update Project Details</h3>
                          <p className="text-slate-300">Modify your application information and settings</p>
                        </div>
                      </div>

                      {!isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/30 rounded-lg p-4">
                              <label className="text-sm text-slate-400">App Name</label>
                              <p className="text-white font-medium">{appData.name}</p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-4">
                              <label className="text-sm text-slate-400">Developer</label>
                              <p className="text-white font-medium">{appData.developer}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleEditStart}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Project Details
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">App Name</label>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter app name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">Developer Name</label>
                              <input
                                type="text"
                                value={editForm.developer || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, developer: e.target.value }))}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter developer name"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">Description</label>
                            <textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              placeholder="Enter app description"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-2">Category</label>
                            <select
                              value={editForm.category || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <div className="flex space-x-3">
                            <button
                              onClick={handleEditSave}
                              disabled={isSaving}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                              {isSaving ? (
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Save Changes
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-xl p-6 border border-red-500/30">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-white">Danger Zone</h3>
                          <p className="text-slate-300">Permanently delete this project and all associated data</p>
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <h4 className="text-lg font-semibold text-red-400 mb-2">⚠️ Warning</h4>
                        <ul className="text-slate-300 space-y-1 text-sm">
                          <li>• This action cannot be undone</li>
                          <li>• All project data will be permanently deleted</li>
                          <li>• API keys will be immediately revoked</li>
                          <li>• All associated integrations will stop working</li>
                        </ul>
                      </div>

                      <button
                        onClick={handleDeleteStart}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-red-500/30 p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-white">Delete Project</h3>
                <p className="text-slate-300">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-300 mb-4">
                Are you sure you want to delete <span className="font-semibold text-red-400">{appData.name}</span>? 
                This will permanently delete the project and all associated data.
              </p>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-300 text-sm font-medium mb-2">
                  To confirm deletion, please type the exact app name:
                </p>
                <p className="text-red-400 font-mono text-sm mb-3">{appData.name}</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-black/50 border border-red-500/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type app name here..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting || deleteConfirmText !== appData.name}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Forever
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
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
