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
  const [isLoaded, setIsLoaded] = useState(false);

  // Get user-specific localStorage key
  const getNotificationKey = () => {
    const token = localStorage.getItem('Testnet_auth_token');
    if (token) {
      try {
        // Decode JWT to get user address (simple base64 decode of payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return `did_notifications_${payload.address}`;
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
    return 'did_notifications_guest'; // Fallback for non-authenticated users
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    const notificationKey = getNotificationKey();
    const savedNotifications = localStorage.getItem(notificationKey);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        console.log(`Loaded ${parsed.length} notifications from localStorage for key:`, notificationKey);
      } catch (err) {
        console.error('Failed to parse saved notifications:', err);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notifications to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      const notificationKey = getNotificationKey();
      localStorage.setItem(notificationKey, JSON.stringify(notifications));
      console.log(`Saved ${notifications.length} notifications to localStorage for key:`, notificationKey);
    }
  }, [notifications, isLoaded]);

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
    const notificationKey = getNotificationKey();
    localStorage.removeItem(notificationKey);
    console.log('Cleared all notifications for key:', notificationKey);
  };

  // Helper functions for specific notification types
  const reloadNotifications = () => {
    const notificationKey = getNotificationKey();
    const savedNotifications = localStorage.getItem(notificationKey);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        console.log(`Reloaded ${parsed.length} notifications for key:`, notificationKey);
      } catch (err) {
        console.error('Failed to parse saved notifications:', err);
      }
    } else {
      setNotifications([]);
    }
  };

  const addLoginNotification = (userAddress) => {
    // Reload notifications for the newly logged in user
    reloadNotifications();
    
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

  const addAppDeletedNotification = (appName) => {
    addNotification({
      type: 'app_deleted',
      title: 'App Deleted',
      message: `"${appName}" has been permanently deleted`,
      icon: '🗑️',
      color: 'red'
    });
  };

  const addAppUpdatedNotification = (appName) => {
    addNotification({
      type: 'app_updated',
      title: 'App Updated',
      message: `"${appName}" details have been updated successfully`,
      icon: '✏️',
      color: 'blue'
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
    reloadNotifications,
    addLoginNotification,
    addAppCreatedNotification,
    addAppSetupNotification,
    addAppDeletedNotification,
    addAppUpdatedNotification,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
