import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Auth() {
  const [account, setAccount] = useState("");
  const [signature, setSignature] = useState("");
  const [challenge, setChallenge] = useState("");
  const [authStatus, setAuthStatus] = useState("Not authenticated");
  const navigate = useNavigate();

  // Correct challenge for ethers v6
  const generateChallenge = () => ethers.hexlify(ethers.randomBytes(32));

  const connectWallet = async () => {
    if (!window.ethereum) {
      setAuthStatus("MetaMask not found!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setAuthStatus("Wallet connected!");
    } catch {
      setAuthStatus("Connection error");
    }
  };

  const signChallenge = async () => {
  if (!account) return;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Step 1: Get challenge from backend
  const res = await fetch(`http://localhost:5000/api/challenge/${account}`);
  const data = await res.json();
  const challenge = data.challenge; // <-- Ensure this isn't undefined/null

  setChallenge(challenge);

  try {
    // Step 2: Sign that challenge
    const sig = await signer.signMessage(challenge);
    setSignature(sig);

    // Step 3: Send signed message and address to backend for verification
    const authRes = await fetch("http://localhost:5000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: account,
        signature: sig,
      }),
    });

    const result = await authRes.json();
    if (result.success) {
      setAuthStatus("Authentication SUCCESS!");
      setTimeout(() => navigate("/success"), 1000);
    } else {
      setAuthStatus("Authentication FAILED.");
    }
  } catch {
    setAuthStatus("Signing failed");
  }
};


  return (
    <div className="container">
      <h2>DID Blockchain Auth Demo</h2>
      <button onClick={connectWallet} className="btn">
        Connect MetaMask
      </button>
      <p className="info">Address: {account}</p>
      <button onClick={signChallenge} className="btn" disabled={!account}>
        Sign Challenge (DID Auth)
      </button>
      <p className="info">Challenge: {challenge}</p>
      <p className="info">Signature: {signature}</p>
      <p className="status">{authStatus}</p>
    </div>
  );
}

export default Auth;
