// Complete frontend example that works with @gitalien/auth_package
// This matches the implementation from your NewAuth.jsx

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

function SIWEAuth() {
  const [account, setAccount] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [challenge, setChallenge] = useState("");
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthOnMount = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const expTime = decoded.exp * 1000;
            const now = Date.now();
            if (expTime > now) {
              setIsAuthenticated(true);
              return;
            } else {
              setAuthStatus("Session expired. Please sign in again.");
              setToken("");
              localStorage.removeItem("auth_token");
            }
          }
        } catch (err) {
          console.error("Invalid token on mount:", err);
          setToken("");
          localStorage.removeItem("auth_token");
        }
      }
    };
    checkAuthOnMount();
  }, [token]);

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
      
      // Optional: Resolve ENS name using your auth package
      try {
        const ensRes = await fetch("http://localhost:5000/api/resolve-ens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
          signal: AbortSignal.timeout(10000),
        });
        const ensData = await ensRes.json();
        if (ensData.error && ensData.error.includes("Invalid JSON")) {
          console.warn("ENS resolution failed due to Invalid JSON from Infura");
          setEnsName(null);
        } else if (ensData.ensName) {
          setEnsName(ensData.ensName);
        }
      } catch (err) {
        console.error("ENS resolution error:", err);
        setEnsName(null);
      }
    } catch (err) {
      setAuthStatus("Failed to connect wallet. Please try again.");
      console.error("Wallet connection error:", err);
    }
  };

  // Main authentication function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      setAuthStatus("Please connect your wallet.");
      return;
    }

    setIsLoading(true);
    setAuthStatus("");
    try {
      // Step 1: Get challenge from your auth package
      const res = await fetch(`http://localhost:5000/api/challenge/${account}?t=${Date.now()}`, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (data.error) {
        setAuthStatus(`Error: ${data.error}`);
        setIsLoading(false);
        return;
      }
      setChallenge(data.challenge);

      // Step 2: Sign the challenge
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      if (currentAddress.toLowerCase() !== account.toLowerCase()) {
        setAuthStatus("Account mismatch detected. Please reconnect your wallet or switch to the correct account in MetaMask.");
        setAccount(currentAddress);
        setIsLoading(false);
        return;
      }

      const sig = await signer.signMessage(data.challenge);
      setSignature(sig);

      // Step 3: Send to your auth package for verification
      const authRes = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature: sig }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await authRes.json();
      console.log("Auth response:", result);
      
      if (result.success) {
        if (result.isNewUser) {
          setAuthStatus("🎉 Welcome! Your wallet has been successfully registered.");
        } else {
          setAuthStatus("✅ Welcome back! Authentication successful.");
        }
        
        if (result.token) {
          localStorage.setItem("auth_token", result.token);
          setToken(result.token);
          console.log("Token stored:", result.token);
          try {
            const decoded = jwtDecode(result.token);
            if (decoded && decoded.exp) {
              const expTime = decoded.exp * 1000;
              const now = Date.now();
              if (expTime > now) {
                setTimeout(() => {
                  setIsAuthenticated(true);
                }, 1500);
                return;
              } else {
                setAuthStatus("Received token is already expired.");
              }
            }
          } catch (err) {
            setAuthStatus("Invalid token received from server.");
            console.error("Token decode error:", err);
          }
        } else {
          setAuthStatus("Server did not return a token.");
        }
      } else {
        setAuthStatus(`Authentication failed: ${result.error || "Unknown error"}`);
        if (result.error?.includes("expired")) {
          setAuthStatus("Challenge expired. Please try again.");
        } else if (result.error?.includes("Signature does not match")) {
          setAuthStatus("Signature mismatch. Please ensure the correct account is selected in MetaMask and reconnect.");
        }
      }
    } catch (err) {
      setAuthStatus("Authentication failed. Please try again.");
      if (err.name === "TimeoutError") {
        setAuthStatus("Request timed out. Please check your connection and try again.");
      }
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newAddress = await signer.getAddress();
        if (newAddress.toLowerCase() !== account?.toLowerCase()) {
          setAccount(newAddress);
          setAuthStatus("Account changed. Please reconnect or sign in again.");
          setEnsName(null);
          setChallenge("");
          setSignature("");
          setToken("");
          localStorage.removeItem("auth_token");
          setIsAuthenticated(false);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [account]);

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp) {
          const expTime = decoded.exp * 1000;
          const now = Date.now();
          if (expTime <= now) {
            setAuthStatus("Session expired. Please sign in again.");
            setToken("");
            localStorage.removeItem("auth_token");
            setIsAuthenticated(false);
          }
        }
      }
    };
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Logout function
  const logout = () => {
    setToken("");
    setAccount("");
    setIsAuthenticated(false);
    setEnsName(null);
    setChallenge("");
    setSignature("");
    localStorage.removeItem("auth_token");
    setAuthStatus("Logged out successfully");
  };

  // Authenticated view
  if (isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2>🎉 Welcome to Your App!</h2>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px', 
          margin: '20px 0' 
        }}>
          <p><strong>Connected as:</strong> {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
          <p><strong>Address:</strong> {account}</p>
          {ensName && <p><strong>ENS:</strong> {ensName}</p>}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              // Example: Fetch user info from your auth package
              fetch('http://localhost:5000/api/userinfo', {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(res => res.json())
              .then(data => console.log('User info:', data))
              .catch(err => console.error('Error:', err));
            }}
            style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Get User Info
          </button>
          
          <button 
            onClick={logout}
            style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Login view (matches your design)
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Left side - Image/Branding */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Secure Wallet Auth</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Connect your Ethereum wallet for secure, passwordless authentication
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#333' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Connect your Ethereum wallet to get started
            </p>
          </div>

          {/* Info box */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            marginBottom: '30px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
              🔐 <strong>Wallet-based Authentication:</strong> No passwords needed! 
              Your wallet serves as both your login and identity.
            </p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>
              ✨ <strong>New user?</strong> Just connect your wallet and you're automatically registered!
            </p>
          </div>

          {/* Status message */}
          {authStatus && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '6px',
              backgroundColor: authStatus.includes("failed") || authStatus.includes("Error") || authStatus.includes("expired") || authStatus.includes("timed out") || authStatus.includes("mismatch") ? '#ffebee' : '#e8f5e8',
              border: '1px solid ' + (authStatus.includes("failed") || authStatus.includes("Error") || authStatus.includes("expired") || authStatus.includes("timed out") || authStatus.includes("mismatch") ? '#f44336' : '#4caf50'),
              color: authStatus.includes("failed") || authStatus.includes("Error") || authStatus.includes("expired") || authStatus.includes("timed out") || authStatus.includes("mismatch") ? '#c62828' : '#2e7d32'
            }}>
              {authStatus}
            </div>
          )}

          {/* Account info */}
          {account && (
            <div style={{
              padding: '15px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>
                Connected: {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              type="button"
              onClick={connectWallet}
              disabled={isLoading || account}
              style={{
                padding: '15px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: account ? '#4caf50' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isLoading || account) ? 'default' : 'pointer',
                opacity: (isLoading || account) ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? "Connecting..." : account ? "✅ Wallet Connected" : "Connect Wallet"}
            </button>

            <button
              type="submit"
              disabled={isLoading || !account}
              style={{
                padding: '15px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isLoading || !account) ? 'default' : 'pointer',
                opacity: (isLoading || !account) ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? "Authenticating..." : "🔐 Authenticate with Wallet"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
            <p>Powered by @gitalien/auth_package</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SIWEAuth;
