import React, { useState } from 'react';
import './Dashboard.css';
import Header from './Header.jsx';
import TabContent from './DashboardTabContent.jsx';
import ChatbotSidebar from './ChatbotSidebar.jsx';

function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [notifications] = useState(5);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const shouldBlur = isNotificationOpen || isChatbotOpen;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`animated-background transition-all duration-300 ${
        shouldBlur ? 'blur-sm' : ''
      }`}></div>

      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onNotificationOpenChange={setIsNotificationOpen}
      />

      {/* Main Content */}
      <main className={`pt-6 px-6 md:px-8 lg:px-12 mx-4 md:mx-6 lg:mx-8 transition-all duration-300 ${
        shouldBlur ? 'blur-sm' : ''
      }`}>
        <TabContent tab={activeTab} setActiveTab={setActiveTab} />
      </main>

      {/* AI Documentation Assistant */}
      <ChatbotSidebar onOpenChange={setIsChatbotOpen} />
    </div>
  );
}

export default Dashboard;
