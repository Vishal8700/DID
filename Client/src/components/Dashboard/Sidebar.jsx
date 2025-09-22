


import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { jwtDecode } from "jwt-decode";

// SVG Icons
const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
    <path d="M96 480l32-128 128-32-32 128-128 32zm352-352l32-32-48-48-32 32 48 48zm-96 0l32-32-48-48-32 32 48 48zm-160 160l32-32-48-48-32 32 48 48z"/>
  </svg>
);

const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
    <path d="M487.4 315.7l-42.6-24.6c2.5-12.2 3.9-24.9 3.9-37.9s-1.4-25.7-3.9-37.9l42.6-24.6c15.1-8.7 20.4-28.1 11.7-43.2l-45.3-78.4c-8.7-15.1-28.1-20.4-43.2-11.7l-42.6 24.6c-19.8-17-42.8-30.3-68.1-39.4V24c0-17.7-14.3-32-32-32h-90.5c-17.7 0-32 14.3-32 32v49.1c-25.3 9.1-48.3 22.4-68.1 39.4L62.4 88.5c-15.1-8.7-34.5-3.4-43.2 11.7L-26.1 178.6c-8.7 15.1-3.4 34.5 11.7 43.2l42.6 24.6c-2.5 12.2-3.9 24.9-3.9 37.9s1.4 25.7 3.9 37.9l-42.6 24.6c-15.1 8.7-20.4 28.1-11.7 43.2l45.3 78.4c8.7 15.1 28.1 20.4 43.2 11.7l42.6-24.6c19.8 17 42.8 30.3 68.1 39.4V488c0 17.7 14.3 32 32 32h90.5c17.7 0 32-14.3 32-32v-49.1c25.3-9.1 48.3-22.4 68.1-39.4l42.6 24.6c15.1 8.7 34.5 3.4 43.2-11.7l45.3-78.4c8.7-15.1 3.4-34.5-11.7-43.2zM256 336c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"/>
  </svg>
);

const TimesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="20" height="20" fill="currentColor">
    <path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7 265.4 105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256 310.6 361.4z"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20" fill="currentColor">
    <path d="M541 229.16l-61-53.74V56a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v24.66L314.52 10.3c-12.5-11-31.53-11-44 0L35 229.16a12 12 0 0 0-1.16 17l21.41 23.61a12 12 0 0 0 17 1.15L96 236.62V456a24 24 0 0 0 24 24h112V328a24 24 0 0 1 24-24h64a24 24 0 0 1 24 24v152h112a24 24 0 0 0 24-24V236.62l23.78 34.31a12 12 0 0 0 17 1.15l21.41-23.61a12 12 0 0 0-1.19-17z"/>
  </svg>
);

const AppsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
    <path d="M96 96h96v96H96V96zm224 0h96v96h-96V96zM96 320h96v96H96v-96zm224 0h96v96h-96v-96z"/>
  </svg>
);

const FilesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
    <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.3 0-24-10.7-24-24zm121-31L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6c0-6.4-2.5-12.5-7-17z"/>
  </svg>
);

const ProjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
    <path d="M64 64h384v64H64V64zm0 160h384v64H64v-64zm0 160h384v64H64v-64z"/>
  </svg>
);

const LearnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
    <path d="M320 32L0 192l320 160 320-160L320 32zm0 96l192 96-192 96-192-96 192-96zm0 224v128l-96-48v-80l96 48zm128-48v80l-96 48V304l96-48v80z"/>
  </svg>
);

const CommunityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor">
    <path d="M96 128a64 64 0 1 1 128 0 64 64 0 1 1-128 0zm224 0a64 64 0 1 1 128 0 64 64 0 1 1-128 0zm224 0a64 64 0 1 1 128 0 64 64 0 1 1-128 0zM96 416v-32c0-53 43-96 96-96h32c53 0 96 43 96 96v32H96zm224 0v-32c0-53 43-96 96-96h32c53 0 96 43 96 96v32H320z"/>
  </svg>
);

const ChevronDownIcon = ({ expanded }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    width="16" 
    height="16" 
    fill="currentColor" 
    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <path d="M207.029 381.476L12.686 187.133c-12.497-12.497-12.497-32.758 0-45.255l22.627-22.627c12.497-12.497 32.758-12.497 45.255 0L224 284.745 367.432 119.251c12.497-12.497 32.758-12.497 45.255 0l22.627 22.627c12.497 12.497 12.497 32.758 0 45.255L240.971 381.476c-12.497 12.497-32.758 12.497-45.942 0z"/>
  </svg>
);

function Sidebar({ sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const token = localStorage.getItem("Testnet_auth_token") || "";

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          console.log("User info fetched:", data);
          setUserInfo(data);
        } catch (err) {
          console.error("Failed to fetch user info:", err);
        }
      }
    };
    fetchUserInfo();
  }, [token]);

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Sidebar items
  const sidebarItems = [
    { title: "Home", icon: HomeIcon, isActive: true },
    // { 
    //   title: "Apps", icon: AppsIcon, badge: "", items: [
    //     { title: "All Apps", url: "#" },
    //     { title: "Recent", url: "#" },
    //     { title: "Updates", url: "#", badge: "" },
    //     { title: "Installed", url: "#" },
    //   ]
    // },
    { 
      title: "Docs", icon: FilesIcon, items: [
        { title: "Video", url: "#" },
        { title: "Frontend Setup", url: "#", badge: "" },
        { title: "Backend Setup", url: "/backend-setup" },
      ]
    },
    { 
      title: "User", icon: ProjectsIcon, badge: "", items: [
        { title: "Metamask", url: "#", badge: "" },
        { title: "Login session", url: "#" },
      ]
    },
    
    
  ];

  return (
    <div>
      {/* Mobile Overlay */}
      {(mobileMenuOpen || isSettingsOpen) && <div className="mobile-overlay" 
      onClick={() => {
          setMobileMenuOpen(false);
          setIsSettingsOpen(false);
        }}></div>}

      {/* Sidebar Mobile */}
      <div className={`sidebar sidebar-mobile ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <DotLottieReact
                src="https://lottie.host/7e16a409-77c5-492f-9b89-707af0ea8f6b/0LgDipTIby.lottie"
                loop
                autoplay
                style={{ width: 40, height: 40 }}
              />
            </div>
            <div className="sidebar-logo-text"><h2>EASY</h2><p>Web 3</p></div>
          </div>
          <button className="btn btn-icon" onClick={() => setMobileMenuOpen(false)}><TimesIcon /></button>
        </div>

        <div className="sidebar-nav">
          {sidebarItems.map(item => (
            <div key={item.title} className="nav-item">
              <button className={`nav-button ${item.isActive ? 'active' : ''}`} onClick={() => item.items && toggleExpanded(item.title)}>
                <div className="nav-button-content">
                  <span className="nav-icon">{item.icon && <item.icon />}</span>
                  <span>{item.title}</span>
                </div>
                {item.badge && <div className="badge badge-outline">{item.badge}</div>}
                {item.items && <ChevronDownIcon expanded={expandedItems[item.title]} />}
              </button>
              {item.items && expandedItems[item.title] && (
                <div className="nav-subitems">
                  {item.items.map(subItem => (
                    <a key={subItem.title} href={subItem.url} className="nav-subitem">
                      {subItem.title}
                      {subItem.badge && <div className="badge badge-outline">{subItem.badge}</div>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

         <div className="sidebar-footer">
          <button className="nav-button" onClick={toggleSettings}>
            <div className="nav-button-content">
              <span className="nav-icon">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="20"
                    height="20"
                    fill="currentColor"
                  >
                    <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 
                            208-93.1 208-208S370.9 48 256 48zm0 96a32 32 0 1 1 0 64 
                            32 32 0 1 1 0-64zm40 272h-80c-13.3 0-24-10.7-24-24s10.7-24 
                            24-24h16v-88h-16c-13.3 0-24-10.7-24-24s10.7-24 
                            24-24h40c13.3 0 24 10.7 24 24v112h16c13.3 0 24 10.7 24 24s-10.7 
                            24-24 24z"/>
                  </svg>

              </span>
              <span>info</span>
            </div>
          </button>
          <button 
            className="nav-button user-button"
            onMouseEnter={(e) => userInfo?.address && copyToClipboard(userInfo.address)}
          >
            <div className="nav-button-content">
              <div className="avatar">{userInfo?.address ? `${userInfo.address.slice(0, 2)}` : "JD"}</div>
              <span>{userInfo?.address ? `${userInfo.address.slice(0, 6)}...${userInfo.address.slice(-4)}` : "John Doe"}</span>
            </div>
            <div className="badge badge-outline">Pro</div>
          </button>
        </div>

        {/* Floating Settings Menu */}
        {isSettingsOpen && (
          <div className="settings-menu">
            <div className="settings-content">
              <h3 className="settings-title">info</h3>
              {userInfo ? (
                <div className="settings-details">
                  <div>
                    <span className="settings-label">Address:</span>
                    <p className="settings-value">{userInfo.address || "N/A"}</p>
                  </div>
                  <div>
                    <span className="settings-label">ENS Name:</span>
                    <p className="settings-value">{userInfo.ensName || "No ENS name"}</p>
                  </div>
                  <div>
                    <span className="settings-label">Login Count:</span>
                    <p className="settings-value">{userInfo.loginCount || 0}</p>
                  </div>
                  <div>
                    <span className="settings-label">Last Login:</span>
                    <p className="settings-value">{userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString() : "N/A"}</p>
                  </div>
                  <div>
                    <span className="settings-label">Relogin Period:</span>
                    <p className="settings-value">{userInfo.reloginPeriod || 60} minutes</p>
                  </div>
                </div>
              ) : (
                <p>Loading user info...</p>
              )}
              <button className="close-settings" onClick={toggleSettings}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 210.7 265.4 105.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256 310.6 361.4z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Desktop */}
      <div className={`sidebar sidebar-desktop ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <DotLottieReact
                src="https://lottie.host/7e16a409-77c5-492f-9b89-707af0ea8f6b/0LgDipTIby.lottie"
                loop
                autoplay
                style={{ width: 40, height: 40 }}
              />
            </div>
            <div className="sidebar-logo-text"><h2>Easy Web3</h2><p>Decentralized Auth Provider</p></div>
          </div>
        </div>

        <div className="sidebar-nav">
          {sidebarItems.map(item => (
            <div key={item.title} className="nav-item">
              <button className={`nav-button ${item.isActive ? 'active' : ''}`} onClick={() => item.items && toggleExpanded(item.title)}>
                <div className="nav-button-content">
                  <span className="nav-icon">{item.icon && <item.icon />}</span>
                  <span>{item.title}</span>
                </div>
                {item.badge && <div className="badge badge-outline">{item.badge}</div>}
                {item.items && <ChevronDownIcon expanded={expandedItems[item.title]} />}
              </button>
              {item.items && expandedItems[item.title] && (
                <div className="nav-subitems">
                  {item.items.map(subItem => (
                    <a key={subItem.title} href={subItem.url} className="nav-subitem">
                      {subItem.title}
                      {subItem.badge && <div className="badge badge-outline">{subItem.badge}</div>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="nav-button" onClick={toggleSettings}>
            <div className="nav-button-content">
              <span className="nav-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 
                        208-93.1 208-208S370.9 48 256 48zm0 96a32 32 0 1 1 0 64 
                        32 32 0 1 1 0-64zm40 272h-80c-13.3 0-24-10.7-24-24s10.7-24 
                        24-24h16v-88h-16c-13.3 0-24-10.7-24-24s10.7-24 
                        24-24h40c13.3 0 24 10.7 24 24v112h16c13.3 0 24 10.7 24 24s-10.7 
                        24-24 24z"/>
              </svg>

              </span>
              <span>Info</span>
            </div>
          </button>
          <button 
            className="nav-button user-button"
            onMouseEnter={(e) => userInfo?.address && copyToClipboard(userInfo.address)}
          >
            <div className="nav-button-content">
              <div className="avatar">{userInfo?.address ? `${userInfo.address.slice(0, 2)}` : "JD"}</div>
              <span>{userInfo?.address ? `${userInfo.address.slice(0, 6)}...${userInfo.address.slice(-4)}` : "John Doe"}</span>
            </div>
            <div className="badge badge-outline">Pro</div>
          </button>
        </div>

        {/* Floating Settings Menu */}
        {isSettingsOpen && (

        <div className="settings-overlay">
          <div className="settings-dropdown">
            <div className="settings-header">
              <div className="user-profile">
                <div className="user-avatar">
                  {userInfo?.address ? `${userInfo.address.slice(0, 2)}` : "SF"}
                </div>
                <div className="user-details">
                  <h3>Someone Famous</h3>
                  <p>Software Developer</p>
                </div>
              </div>
            </div>
            
            <div className="settings-menu-content">
              {userInfo ? (
                <>
                  <div className="settings-info-item">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{userInfo.address || "N/A"}</span>
                  </div>
                  
                  <div className="settings-info-item">
                    <span className="info-label">ENS Name:</span>
                    <span className="info-value">{userInfo.ensName || "No ENS name"}</span>
                  </div>
                  
                  <div className="settings-info-item">
                    <span className="info-label">Login Count:</span>
                    <span className="info-value">{userInfo.loginCount || 0}</span>
                  </div>
                  
                  <div className="settings-info-item">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">
                      {userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  
                  <div className="settings-info-item">
                    <span className="info-label">Relogin Period:</span>
                    <span className="info-value">{userInfo.reloginPeriod || 60} minutes</span>
                  </div>
                </>
              ) : (
                <div className="loading-text">Loading user info...</div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Sidebar;