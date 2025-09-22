import React from "react";

function TabsHeader({ activeTab, setActiveTab }) {
  const tabs = ["home", "Profile"];

  return (
    <div className="flex justify-start mt-6 mb-8">
      <div className="inline-flex bg-white border border-gray-200 rounded-full shadow-sm p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 
              ${
                activeTab === tab
                  ? "bg-violet-600 text-white shadow"
                  : "text-gray-700 hover:text-violet-600 hover:bg-gray-100"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabsHeader;
