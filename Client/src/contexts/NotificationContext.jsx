import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('did_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
      } catch (err) {
        console.error('Failed to parse saved notifications:', err);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('did_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper functions for specific notification types
  const addLoginNotification = (userAddress) => {
    addNotification({
      type: 'login',
      title: 'Successful Login',
      message: `Logged in with wallet ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      icon: '🔐',
      color: 'green'
    });
  };

  const addAppCreatedNotification = (appName, appId) => {
    addNotification({
      type: 'app_created',
      title: 'New App Created',
      message: `Successfully created "${appName}" application`,
      icon: '🚀',
      color: 'blue',
      metadata: { appId, appName }
    });
  };

  const addAppSetupNotification = (appName) => {
    addNotification({
      type: 'app_setup',
      title: 'App Setup Complete',
      message: `"${appName}" is now ready for integration`,
      icon: '⚙️',
      color: 'purple'
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addLoginNotification,
    addAppCreatedNotification,
    addAppSetupNotification,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
