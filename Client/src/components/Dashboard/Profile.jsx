import React, { useState, useEffect } from 'react';



function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloginPeriod, setReloginPeriod] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const images = [
  "https://picsum.photos/200/200?random=1",
  "https://picsum.photos/200/200?random=2",
  "https://picsum.photos/200/200?random=3",
  "https://picsum.photos/200/200?random=4",
];
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    // Load saved image from localStorage
    const savedImage = localStorage.getItem("userAvatar");
    if (savedImage) {
      setCurrentImage(savedImage);
    } else {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setCurrentImage(randomImage);
      localStorage.setItem("userAvatar", randomImage);
    }

    // Change image every 10 minutes
    const interval = setInterval(() => {
      const newImage = images[Math.floor(Math.random() * images.length)];
      setCurrentImage(newImage);
      localStorage.setItem("userAvatar", newImage);
    }, 10 * 60 * 1000); // 10 min in ms

    return () => clearInterval(interval);
  }, []);



    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('Testnet_auth_token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            const data = await response.json();
            setUserInfo(data);
            setReloginPeriod(data.reloginPeriod || 60);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Never';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const updateReloginPeriod = async () => {
        if (!reloginPeriod || reloginPeriod <= 0) {
            setUpdateMessage('Please enter a valid period in minutes');
            return;
        }

        setUpdating(true);
        setUpdateMessage('');

        try {
            const token = localStorage.getItem('Testnet_auth_token');
            const response = await fetch('http://localhost:5000/api/settings/relogin-period', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ period: parseInt(reloginPeriod) }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update relogin period');
            }

            setUpdateMessage('Relogin period updated successfully!');
            setUserInfo(prev => ({ ...prev, reloginPeriod: parseInt(reloginPeriod) }));

            // Clear success message after 3 seconds
            setTimeout(() => setUpdateMessage(''), 3000);
        } catch (err) {
            setUpdateMessage(`Error: ${err.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-8">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden">
                            {currentImage ? (
                                <img
                                src={currentImage}
                                alt="user avatar"
                                className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-black">
                                {userInfo?.address
                                    ? userInfo.address.slice(2, 4).toUpperCase()
                                    : "U"}
                                </span>
                            )}
                            </div>
                        </div>
                        <div className="ml-6">
                            <h1 className="text-2xl font-bold text-white">
                                {userInfo?.ensName || 'Anonymous User'}
                            </h1>
                            <p className="text-violet-100 mt-1">
                                {formatAddress(userInfo?.address)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Wallet Address Card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">Wallet Address</h3>
                                    <p className="text-sm text-gray-600 font-mono">{formatAddress(userInfo?.address)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Login Count Card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">Total Logins</h3>
                                    <p className="text-2xl font-bold text-gray-900">{userInfo?.loginCount || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Last Login Card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">Last Login</h3>
                                    <p className="text-sm text-gray-600">{formatDate(userInfo?.lastLogin)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Relogin Period Card */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">Session Duration</h3>
                                    <p className="text-sm text-gray-600">{formatDuration(userInfo?.reloginPeriod || 60)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ENS Section */}
                    {userInfo?.ensName && (
                        <div className="mt-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">ENS Information</h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="ml-2 text-sm font-medium text-blue-900">
                                        ENS Name: {userInfo.ensName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Session Settings */}
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Session Settings</h2>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Relogin Period</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Set how long your authentication session should last before requiring you to sign in again.
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 max-w-xs">
                                            <label htmlFor="relogin-period" className="sr-only">
                                                Relogin period in minutes
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id="relogin-period"
                                                    min="1"
                                                    max="10080"
                                                    value={reloginPeriod}
                                                    onChange={(e) => setReloginPeriod(e.target.value)}
                                                    className="block w-full pr-16 border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                                    placeholder="60"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">minutes</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={updateReloginPeriod}
                                            disabled={updating}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update'
                                            )}
                                        </button>
                                    </div>

                                    {/* Quick preset buttons */}
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
                                        <div className="flex space-x-2">
                                            {[
                                                { label: '30 min', value: 30 },
                                                { label: '1 hour', value: 60 },
                                                { label: '4 hours', value: 240 },
                                                { label: '1 day', value: 1440 },
                                                { label: '1 week', value: 10080 }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    onClick={() => setReloginPeriod(preset.value)}
                                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Update message */}
                                    {updateMessage && (
                                        <div className={`mt-3 p-2 rounded-md text-sm ${updateMessage.includes('Error')
                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                : 'bg-green-50 text-green-700 border border-green-200'
                                            }`}>
                                            {updateMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-end">
                        <button
                        onClick={async () => {
                            const icon = document.getElementById("refresh-icon");
                            icon.classList.add("animate-spin");
                            await fetchUserInfo();
                            setTimeout(() => icon.classList.remove("animate-spin"), 1000);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        >
                        <svg
                            id="refresh-icon"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh Profile
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;