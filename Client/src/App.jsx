import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestnetAuth from './components/NewAuth';
import Dashboard from './components/Dashboard/Dashboard';
import AppRegistration from './components/AppRegistration';
import AppSetup from './components/AppSetup';
import SIWEDocs from './components/SIWEDOC';
import Success from './components/Success';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/success" element={<Success />} />
          <Route path="/" element={<TestnetAuth /> } />
          <Route path="/backend-setup" element={<SIWEDocs/>} />
          <Route path="/dashboard" element={<Dashboard/> } />
          <Route path="/register-app" element={<AppRegistration/> } />
          <Route path="/app-setup" element={<AppSetup/> } />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
