import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Auth() {
  const [account, setAccount] = useState("");
  const [signature, setSignature] = useState("");
  const [challenge, setChallenge] = useState("");
  const [authStatus, setAuthStatus] = useState("Not authenticated");
  const [ip, setIp] = useState("127.0.0.1");
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return setAuthStatus("MetaMask not found!");
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

    try {
      const res = await fetch(`http://localhost:5000/api/challenge/${account}`);
      const data = await res.json();
      if (data.error) return setAuthStatus(data.error);
      setChallenge(data.challenge);

      const sig = await signer.signMessage(data.challenge);
      setSignature(sig);

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
        localStorage.setItem("jwt", result.token);
        setAuthStatus("Authentication SUCCESS!");
        // Background IP registration
        fetch("http://localhost:5000/api/register-ip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account, ip }),
        }).catch(err => console.error("Background IP registration failed:", err));
        setTimeout(() => navigate("/success"), 1000);
      } else {
        setAuthStatus(`Authentication FAILED: ${result.error}`);
      }
    } catch (err) {
      setAuthStatus("Signing failed");
      console.error("Sign challenge error:", err);
    }
  };

  return (
    <div className="container">
      <h2>DID Blockchain Auth Demo</h2>
      <button onClick={connectWallet} className="btn">Connect Wallet</button>
      <p className="info">Address: {account}</p>
      <button onClick={signChallenge} className="btn" disabled={!account}>
        Sign Challenge (DID Auth)
      </button>
      <p className="info">Challenge: {challenge}</p>
      <p className="info">Signature: {signature}</p>
      <p className="info">IP: <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} /></p>
      <p className="status">{authStatus}</p>
    </div>
  );
}

export default Auth;