import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";
import Success from "./Success";
import "./NewAuth.css";

function TestnetAuth({ onAuthSuccess }) {
  const [account, setAccount] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [challenge, setChallenge] = useState("");
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading to check auth
  const [authStatus, setAuthStatus] = useState("");
  const [token, setToken] = useState(localStorage.getItem("Testnet_auth_token") || "");
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
              setIsLoading(false);
              return;
            } else {
              setAuthStatus("Session expired. Please sign in again.");
              setToken("");
              localStorage.removeItem("Testnet_auth_token");
            }
          }
        } catch (err) {
          console.error("Invalid token on mount:", err);
          setToken("");
          localStorage.removeItem("Testnet_auth_token");
        }
      }
      setIsLoading(false);
    };
    checkAuthOnMount();
  }, [token]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      setAuthStatus("Please connect your wallet.");
      return;
    }

    setIsLoading(true);
    setAuthStatus("");
    try {
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

      const authRes = await fetch("http://localhost:5000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, signature: sig }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await authRes.json();
      console.log("Auth response:", result); // Debug the server response
      if (result.success) {
        if (result.token) {
          localStorage.setItem("Testnet_auth_token", result.token);
          setToken(result.token);
          console.log("Token stored:", result.token); // Debug token storage
          try {
            const decoded = jwtDecode(result.token);
            if (decoded && decoded.exp) {
              const expTime = decoded.exp * 1000;
              const now = Date.now();
              if (expTime > now) {
                setIsAuthenticated(true);
                setIsLoading(false);
                onAuthSuccess && onAuthSuccess();
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
          localStorage.removeItem("Testnet_auth_token");
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [account]);

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
            localStorage.removeItem("Testnet_auth_token");
            setIsAuthenticated(false);
          }
        }
      }
    };
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Success />;
  }

  return (
    <div className="auth-container">
      <div className="image-side">
        <div className="image-overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
          alt="Team collaboration"
          className="team-image"
        />
        <div className="floating-elements">
          <div className="floating-circle circle1"></div>
          <div className="floating-circle circle2"></div>
          <div className="floating-circle circle3"></div>
        </div>
      </div>
      <div className="form-side">
        <div className="form-card">
          <div className="header">
            <div className="logo-container">
              <div className="logo">
                <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="logo-text">Testnet</span>
            </div>
            <h1 className="title">Welcome to Testnet</h1>
            <p className="subtitle">Sign in with your Ethereum wallet</p>
          </div>
          {authStatus && (
            <div className={`status-message ${authStatus.includes("failed") || authStatus.includes("Error") || authStatus.includes("expired") || authStatus.includes("timed out") || authStatus.includes("mismatch") ? "error" : "success"}`}>
              {authStatus}
            </div>
          )}
          {account && (
            <div className="account-info">
              <p>Connected: {ensName || `${account.slice(0, 6)}...${account.slice(-4)}`}</p>
            </div>
          )}
          <form className="form" onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={connectWallet}
              className={`submit-button ${isLoading ? "loading" : ""} ${account ? "connected" : ""}`}
              disabled={isLoading || account}
            >
              {isLoading ? "Connecting..." : account ? "Wallet Connected" : "Connect Wallet"}
            </button>
            <button
              type="submit"
              className={`submit-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading || !account}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TestnetAuth;