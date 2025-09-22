import React from 'react';
import { apps } from "../../data/app";
import Profile from './Profile';


function TabContent({ tab }) {
  if (tab === "home") {
    return (
      <div className="tab-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">Premium</div>
              <h2>Welcome to Easy Web3 Auth Suite</h2>
              <p>Easily Setup Decentralized Authantication in Your React Project With Simple Modules and resources.</p>
              <div className="hero-buttons">
                <button className="btn btn-primary">Explore Docs</button>
                <button className="btn btn-outline">Take a Tour</button>
              </div>
            </div>
            <div className="hero-decoration">
              <div className="spinning-circles">
                <div className="circle circle-1"></div>
                <div className="circle circle-2"></div>
                <div className="circle circle-3"></div>
                <div className="circle circle-4"></div>
                <div className="circle circle-5"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Apps */}
        <section className="section">
          <div className="section-header">
            <h2>Recent Apps</h2>
            <button className="btn btn-ghost">View All</button>
          </div>
          <div className="grid grid-4">
            {apps.filter(app => app.recent).map((app) => (
              <div key={app.name} className="card app-card">
                <div className="card-header">
                  <div className="app-icon">{app.icon}</div>
                  <button className="btn btn-icon">⭐</button>
                </div>
                <div className="card-content">
                  <h3>{app.name}</h3>
                  <p>{app.description}</p>
                </div>
                <div className="card-footer">
                  <button className="btn btn-secondary">Open</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        
         
       
      </div>
    );
  }

  if (tab === "Profile") {
    return (
      <div className="tab-content">
        <Profile />
      </div>
    );
  }

  return <div>Content for {tab}</div>;
}

export default TabContent;
