import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useUserSettings } from './UserContext'; // 수정된 임포트
import { api } from '@/lib/api';

export const CharacterSettingsDialog = () => {
  const { settings, updateSettings } = useUserSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('character'); // 'character' or 'notion'
  
  const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    try {
      if (!localSettings.characterName || !localSettings.mbti) {
        alert('캐릭터 이름과 MBTI는 필수입니다.');
        return;
      }
      if (!localSettings.notionApiKey || !localSettings.notionPageUrl) {
        alert('Notion API Key와 Page URL은 필수입니다.');
        return;
      }

      const response = await api.createCharacter(localSettings);
      updateSettings(localSettings);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const renderCharacterTab = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label>Character Name (ID)</label>
        <input 
          type="text"
          className="border p-2 rounded"
          value={localSettings.characterName || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, characterName: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <label>MBTI</label>
        <select 
          className="border p-2 rounded"
          value={localSettings.mbti || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, mbti: e.target.value })}
        >
          <option value="">Select MBTI</option>
          {MBTI_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label>Goals</label>
        <textarea
          className="border p-2 rounded min-h-[80px]"
          value={localSettings.goals || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, goals: e.target.value })}
          placeholder="What are your goals?"
        />
      </div>
      <div className="grid gap-2">
        <label>Preferences</label>
        <textarea
          className="border p-2 rounded min-h-[80px]"
          value={localSettings.preferences || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, preferences: e.target.value })}
          placeholder="What are your preferences?"
        />
      </div>
    </div>
  );

  const renderNotionTab = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label>Notion API Key</label>
        <input 
          type="password"
          className="border p-2 rounded"
          value={localSettings.notionApiKey || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, notionApiKey: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <label>Notion Page URL</label>
        <input 
          type="text"
          className="border p-2 rounded"
          value={localSettings.notionPageUrl || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, notionPageUrl: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4">
          <User className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Character Settings</DialogTitle>
        </DialogHeader>
        <div className="flex space-x-4 border-b mb-4">
          <button
            className={`py-2 px-4 ${activeTab === 'character' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('character')}
          >
            Character
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'notion' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('notion')}
          >
            Notion Settings
          </button>
        </div>
        {activeTab === 'character' ? renderCharacterTab() : renderNotionTab()}
        <Button onClick={handleSave} className="mt-4">Save All Settings</Button>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSettingsDialog;