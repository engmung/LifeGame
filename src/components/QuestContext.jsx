import React, { createContext, useContext, useState, useEffect } from 'react';

// Quest Context
const QuestContext = createContext();
const UserContext = createContext();

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
};

export const useUserSettings = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

export const QuestProvider = ({ children }) => {
  const [quests, setQuests] = useState(() => {
    const savedQuests = localStorage.getItem('quests');
    return savedQuests ? JSON.parse(savedQuests) : [];
  });
  
  const [completedQuests, setCompletedQuests] = useState(() => {
    const savedCompletedQuests = localStorage.getItem('completedQuests');
    return savedCompletedQuests ? JSON.parse(savedCompletedQuests) : [];
  });
  
  const [inProgressQuest, setInProgressQuest] = useState(() => {
    const savedInProgressQuest = localStorage.getItem('inProgressQuest');
    return savedInProgressQuest ? JSON.parse(savedInProgressQuest) : null;
  });

  useEffect(() => {
    localStorage.setItem('quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('completedQuests', JSON.stringify(completedQuests));
  }, [completedQuests]);

  useEffect(() => {
    localStorage.setItem('inProgressQuest', JSON.stringify(inProgressQuest));
  }, [inProgressQuest]);

  const updateQuests = (newQuests) => {
    setQuests(newQuests);
    localStorage.setItem('quests', JSON.stringify(newQuests));
  };

  const completeQuest = (quest, review) => {
    const completedQuest = {
      ...quest,
      completedAt: new Date().toISOString(),
      review
    };
    setCompletedQuests(prev => [...prev, completedQuest]);
    setQuests(prev => prev.filter(q => q.id !== quest.id));
    setInProgressQuest(null);
  };

  const startQuest = (quest) => {
    setInProgressQuest(quest);
  };

  const cancelQuest = () => {
    setInProgressQuest(null);
  };

  const deleteCompletedQuest = (questId) => {
    const updatedQuests = completedQuests.filter(quest => quest.id !== questId);
    setCompletedQuests(updatedQuests);
    localStorage.setItem('completedQuests', JSON.stringify(updatedQuests));
  };

  return (
    <QuestContext.Provider 
      value={{ 
        quests, 
        completedQuests, 
        inProgressQuest,
        completeQuest,
        startQuest,
        cancelQuest,
        updateQuests,
        deleteCompletedQuest
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export const UserSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    notionApiKey: '',
    notionPageUrl: '',
    characterName: '',
    mbti: '',
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