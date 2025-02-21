import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserSettings } from './UserContext';

const ActivityContext = createContext();

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivities must be used within an ActivityProvider');
  return context;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem('activities');
    return savedActivities ? JSON.parse(savedActivities) : [];
  });

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activity) => {
    setActivities(prev => [...prev, {
      id: Date.now().toString(),
      ...activity,
      createdAt: new Date().toISOString()
    }]);
  };

  const updateActivity = (id, updates) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    );
  };

  const deleteActivity = (id) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <ActivityContext.Provider 
      value={{ 
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        clearActivities
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};