import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Add this to handle token expiration

function Success() {
  const [userInfo, setUserInfo] = useState(null);
  const [reloginPeriod, setReloginPeriod] = useState(60);
  const [token, setToken] = useState(localStorage.getItem("Testnet_auth_token") || "");

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.reloginPeriod) {
            setReloginPeriod(data.reloginPeriod);
            setUserInfo(data);
          }
        } catch (err) {
          setUserInfo({ error: "Failed to load user info" });
          console.error("Failed to fetch user info:", err);
        }
      }
    };
    fetchData();
  }, [token]);

  const updateReloginPeriod = async (period) => {
    if (!token) {
      console.warn("No token available for updating relogin period.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/settings/relogin-period", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ period }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (data.success) {
        setReloginPeriod(period);
        setUserInfo(prev => prev ? { ...prev, reloginPeriod: period } : prev);
      } else {
        console.error("Failed to update relogin period:", data.error);
      }
    } catch (err) {
      console.error("Relogin period update error:", err);
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const expTime = decoded.exp * 1000;
            const now = Date.now();
            if (expTime <= now) {
              localStorage.removeItem("Testnet_auth_token");
              setToken("");
              window.location.href = "/"; // Redirect to login on expiration
            }
          }
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("Testnet_auth_token");
          setToken("");
          window.location.href = "/"; // Redirect to login on invalid token
        }
      }
    };
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Login Successful!
          </h2>
          <p className="text-green-600 text-lg leading-relaxed">
            You're now authenticated with your blockchain wallet.<br />
            Welcome to your private dashboard!
          </p>
        </div>

        {/* Dashboard Content */}
        {userInfo && !userInfo.error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">User Profile</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-600">Address:</span>
                  <p className="text-sm text-slate-900 font-mono bg-slate-50 px-3 py-2 rounded-lg mt-1 break-all">
                    {userInfo.address}
                  </p>
                </div>
                {userInfo.ensName && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">ENS Name:</span>
                    <p className="text-sm text-slate-900 font-medium bg-blue-50 px-3 py-2 rounded-lg mt-1">
                      {userInfo.ensName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Login Statistics Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Login Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Login Count:</span>
                  <span className="text-lg font-bold text-green-600">{userInfo.loginCount}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-600">Last Login:</span>
                  <p className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg mt-1">
                    {new Date(userInfo.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Settings Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Session Settings</h3>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-slate-600">Relogin Period:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={reloginPeriod}
                    onChange={(e) => setReloginPeriod(Number(e.target.value))}
                    className="w-20 p-1 border border-purple-200 rounded-lg text-center"
                  />
                  <span className="text-sm text-slate-500">minutes</span>
                </div>
              </div>
              <button
                onClick={() => updateReloginPeriod(reloginPeriod)}
                className="mt-4 w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Update Relogin Period
              </button>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">
                  Your session will automatically expire after this period of inactivity.
                </p>
              </div>
            </div>
          </div>
        ) : userInfo?.error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{userInfo.error}</p>
          </div>
        ) : (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg mr-3"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              localStorage.removeItem("Testnet_auth_token");
              window.location.href = "/";
            }}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;