import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const QuestContext = createContext();
const UserContext = createContext();

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) throw new Error('useQuests must be used within a QuestProvider');
  return context;
};

export const useUserSettings = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserSettings must be used within a UserSettingsProvider');
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

  const [selectedQuests, setSelectedQuests] = useState([]);
  const { settings } = useUserSettings();

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
  };

  const toggleQuestSelection = (questId) => {
    setSelectedQuests(prev => 
      prev.includes(questId) 
        ? prev.filter(id => id !== questId)
        : [...prev, questId]
    );
  };

  const deleteSelectedQuests = async () => {
    try {
      await api.deleteQuests(settings.characterName, selectedQuests);
      setQuests(prev => prev.filter(quest => !selectedQuests.includes(quest.id)));
      setSelectedQuests([]);
    } catch (error) {
      console.error('Error deleting quests:', error);
      throw error;
    }
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
    setCompletedQuests(prev => prev.filter(quest => quest.id !== questId));
  };

  return (
    <QuestContext.Provider 
      value={{ 
        quests, 
        completedQuests, 
        inProgressQuest,
        selectedQuests,
        completeQuest,
        startQuest,
        cancelQuest,
        updateQuests,
        deleteCompletedQuest,
        toggleQuestSelection,
        deleteSelectedQuests
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