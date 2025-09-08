import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Header from './Header.jsx';
import TabsHeader from './TabsHeader';
import TabContent from './TabContent';
import Sidebar from './Sidebar.jsx';

function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [notifications] = useState(5);

  // Automatically toggle sidebar for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="app">
      <div className="animated-background"></div>

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleExpanded={toggleExpanded}
        expandedItems={expandedItems}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header 
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          notifications={notifications}
        />

        <main className="main">
          <div className="tabs-container">
            <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabContent tab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
