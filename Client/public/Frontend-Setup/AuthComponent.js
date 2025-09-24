import React from 'react';
import { useSIWEAuth } from './useSIWEAuth';
import Dashboard from './Dashboard'; // Adjust path as needed

const AuthComponent = ({ apiUrl = 'http://localhost:5000' }) => {
  const {
    account,
    ensName,
    isLoading,
    authStatus,
    isAuthenticated,
    connectWallet,
    authenticate,
  } = useSIWEAuth({
    apiUrl,
    onAuthSuccess: () => console.log('Authentication successful!'),
  });

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Image Side */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
          alt="Team collaboration"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full opacity-50 animate-pulse absolute top-1/4 left-1/4"></div>
          <div className="w-16 h-16 bg-purple-500 rounded-full opacity-50 animate-pulse absolute top-1/2 right-1/3"></div>
          <div className="w-10 h-10 bg-indigo-500 rounded-full opacity-50 animate-pulse absolute bottom-1/4 left-1/2"></div>
        </div>
      </div>
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="ml-2 text-2xl font-bold text-gray-800">Testnet</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Testnet</h1>
            <p className="text-gray-600 mb-4">Connect your Ethereum wallet to get started</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700 mb-2">
                🔐 <strong>Wallet-based Authentication:</strong> No passwords needed! Your wallet serves as both your login and identity.
              </p>
              <p className="text-sm text-gray-700">
                ✨ <strong>New user?</strong> Just connect your wallet and you're automatically registered!
              </p>
            </div>
          </div>
          {authStatus && (
            <div
              className={`p-4 rounded-lg mb-4 text-sm ${
                authStatus.includes('failed') ||
                authStatus.includes('Error') ||
                authStatus.includes('expired') ||
                authStatus.includes('timed out') ||
                authStatus.includes('mismatch')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {authStatus}
            </div>
          )}
          {account && (
            <div className="mb-4 text-center text-gray-700">
              <p>Connected: {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
            </div>
          )}
          <div className="space-y-4">
            <button
              type="button"
              onClick={connectWallet}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading || account
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
              disabled={isLoading || account}
            >
              {isLoading ? 'Connecting...' : account ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
            <button
              type="button"
              onClick={authenticate}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading || !account
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors`}
              disabled={isLoading || !account}
            >
              {isLoading ? 'Authenticating...' : 'Authenticate with Wallet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;