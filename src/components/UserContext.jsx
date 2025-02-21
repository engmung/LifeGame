import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUserSettings = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserSettings must be used within a UserSettingsProvider');
  return context;
};

export const UserSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notionApiKey: '',
    notionPageUrl: '',
    characterName: '',
    mbti: '',
    goals: '',
    preferences: ''
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
  };

  return (
    <UserContext.Provider value={{ settings, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
};