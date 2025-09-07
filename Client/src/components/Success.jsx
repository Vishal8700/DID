import { useEffect, useState } from "react";

function Success() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      fetch("http://localhost:5000/api/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setUserInfo(data))
        .catch(() => setUserInfo({ error: "Failed to load user info" }));
    }
  }, []);

  return (
    <div className="container">
      <h2 style={{ color: "#1976d2" }}>✅ Login Successful!</h2>
      <p className="status" style={{ color: "#393" }}>
        You’re now authenticated with your blockchain wallet.<br />
        Welcome to your private area!
      </p>
      {userInfo && !userInfo.error && (
        <div>
          <p>Address: {userInfo.address}</p>
          <p>Login Count: {userInfo.loginCount}</p>
          <p>Last Login: {new Date(userInfo.lastLogin).toLocaleString()}</p>
          {userInfo.ensName && <p>ENS Name: {userInfo.ensName}</p>}
        </div>
      )}
      {userInfo?.error && <p style={{ color: "red" }}>{userInfo.error}</p>}
    </div>
  );
}

export default Success;