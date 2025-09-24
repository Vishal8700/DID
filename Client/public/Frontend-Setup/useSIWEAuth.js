import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { jwtDecode } from 'jwt-decode';

// Default backend API URL (configurable via env or props)
const DEFAULT_API_URL = 'http://localhost:5000';

// Custom hook for SIWE authentication
const useSIWEAuth = ({ apiUrl = DEFAULT_API_URL, onAuthSuccess } = {}) => {
  const [account, setAccount] = useState('');
  const [ensName, setEnsName] = useState(null);
  const [challenge, setChallenge] = useState('');
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem('Testnet_auth_token') || '');
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
              setAuthStatus('Session expired. Please sign in again.');
              setToken('');
              localStorage.removeItem('Testnet_auth_token');
            }
          }
        } catch (err) {
          console.error('Invalid token on mount:', err);
          setToken('');
          localStorage.removeItem('Testnet_auth_token');
        }
      }
    };
    checkAuthOnMount();
  }, [token]);

  // Connect to MetaMask wallet
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setAuthStatus('MetaMask not found! Please install MetaMask.');
      return false;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setAuthStatus('Wallet connected successfully!');

      // Optional ENS resolution
      try {
        const ensRes = await fetch(`${apiUrl}/api/resolve-ens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
          signal: AbortSignal.timeout(10000),
        });
        const ensData = await ensRes.json();
        if (ensData.error && ensData.error.includes('Invalid JSON')) {
          console.warn('ENS resolution failed due to Invalid JSON from Infura');
          setEnsName(null);
        } else if (ensData.ensName) {
          setEnsName(ensData.ensName);
        }
      } catch (err) {
        console.error('ENS resolution error:', err);
        setEnsName(null);
      }
      return true;
    } catch (err) {
      setAuthStatus('Failed to connect wallet. Please try again.');
      console.error('Wallet connection error:', err);
      return false;
    }
  }, [apiUrl]);

  // Authenticate with SIWE
  const authenticate = useCallback(async () => {
    if (!account) {
      setAuthStatus('Please connect your wallet.');
      return false;
    }

    setIsLoading(true);
    setAuthStatus('');
    try {
      const res = await fetch(`${apiUrl}/api/challenge/${account}?t=${Date.now()}`, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (data.error) {
        setAuthStatus(`Error: ${data.error}`);
        setIsLoading(false);
        return false;
      }
      setChallenge(data.challenge);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      if (currentAddress.toLowerCase() !== account.toLowerCase()) {
        setAuthStatus('Account mismatch detected. Please reconnect your wallet or switch to the correct account in MetaMask.');
        setAccount(currentAddress);
        setIsLoading(false);
        return false;
      }

      const sig = await signer.signMessage(data.challenge);
      setSignature(sig);

      const authRes = await fetch(`${apiUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account, signature: sig }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await authRes.json();
      console.log('Auth response:', result);
      if (result.success) {
        if (result.isNewUser) {
          setAuthStatus('🎉 Welcome! Your wallet has been successfully registered.');
        } else {
          setAuthStatus('✅ Welcome back! Authentication successful.');
        }

        if (result.token) {
          localStorage.setItem('Testnet_auth_token', result.token);
          setToken(result.token);
          try {
            const decoded = jwtDecode(result.token);
            if (decoded && decoded.exp) {
              const expTime = decoded.exp * 1000;
              const now = Date.now();
              if (expTime > now) {
                setTimeout(() => {
                  setIsAuthenticated(true);
                  onAuthSuccess?.();
                }, 1500);
                return true;
              } else {
                setAuthStatus('Received token is already expired.');
              }
            }
          } catch (err) {
            setAuthStatus('Invalid token received from server.');
            console.error('Token decode error:', err);
          }
        } else {
          setAuthStatus('Server did not return a token.');
        }
      } else {
        setAuthStatus(`Authentication failed: ${result.error || 'Unknown error'}`);
        if (result.error?.includes('expired')) {
          setAuthStatus('Challenge expired. Please try again.');
        } else if (result.error?.includes('Signature does not match')) {
          setAuthStatus('Signature mismatch. Please ensure the correct account is selected in MetaMask and reconnect.');
        }
      }
      return false;
    } catch (err) {
      setAuthStatus('Authentication failed. Please try again.');
      if (err.name === 'TimeoutError') {
        setAuthStatus('Request timed out. Please check your connection and try again.');
      }
      console.error('Auth error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [account, apiUrl, onAuthSuccess]);

  // Handle MetaMask account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newAddress = await signer.getAddress();
        if (newAddress.toLowerCase() !== account?.toLowerCase()) {
          setAccount(newAddress);
          setAuthStatus('Account changed. Please reconnect or sign in again.');
          setEnsName(null);
          setChallenge('');
          setSignature('');
          setToken('');
          localStorage.removeItem('Testnet_auth_token');
          setIsAuthenticated(false);
        }
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [account]);

  // Monitor token expiration
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp) {
            const expTime = decoded.exp * 1000;
            const now = Date.now();
            if (expTime <= now) {
              setAuthStatus('Session expired. Please sign in again.');
              setToken('');
              localStorage.removeItem('Testnet_auth_token');
              setIsAuthenticated(false);
            }
          }
        } catch (err) {
          console.error('Token check error:', err);
        }
      }
    };
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  return {
    account,
    ensName,
    challenge,
    signature,
    isLoading,
    authStatus,
    token,
    isAuthenticated,
    connectWallet,
    authenticate,
    setAuthStatus,
  };
};

export default useSIWEAuth;