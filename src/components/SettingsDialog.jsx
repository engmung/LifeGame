import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserSettings } from './UserContext';
import { api } from '@/lib/api';

export const SettingsDialog = () => {
  const { settings, updateSettings } = useUserSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('user');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);
  const [showNotionGuide, setShowNotionGuide] = useState(false);
  const [showGeminiGuide, setShowGeminiGuide] = useState(false);
  
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
        alert('사용자 이름과 MBTI는 필수입니다.');
        return;
      }
      if (!localSettings.notionApiKey || !localSettings.notionPageUrl) {
        alert('Notion API Key와 Page URL은 필수입니다.');
        return;
      }
      if (!localSettings.geminiApiKey) {
        alert('Google Gemini API Key는 필수입니다.');
        return;
      }

      const checkResponse = await api.checkUser(localSettings);
      
      if (checkResponse.status === 'exists') {
        setExistingUserData(checkResponse.data);
        setShowConfirmation(true);
        return;
      }

      const response = await api.createUser(localSettings);
      updateSettings(localSettings);
      alert('설정이 저장되었습니다.');
      setShowConfirmation(false);
      
    } catch (error) {
      console.error('Error:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleConfirm = async (confirmed) => {
    if (confirmed) {
      try {
        const response = await api.createUser({
          ...localSettings,
          confirmUpdate: true
        });
        updateSettings(localSettings);
        alert('설정이 업데이트되었습니다.');
      } catch (error) {
        console.error('Error:', error);
        alert('설정 업데이트에 실패했습니다.');
      }
    }
    setShowConfirmation(false);
  };

  const renderUserTab = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label>사용자 이름</label>
        <input 
          type="text"
          className="border p-2 rounded"
          value={localSettings.characterName || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, characterName: e.target.value })}
          placeholder="사용자 이름을 입력하세요"
        />
      </div>
      <div className="grid gap-2">
        <label>MBTI</label>
        <select 
          className="border p-2 rounded"
          value={localSettings.mbti || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, mbti: e.target.value })}
        >
          <option value="">MBTI를 선택하세요</option>
          {MBTI_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label>목표</label>
        <textarea
          className="border p-2 rounded min-h-[80px]"
          value={localSettings.goals || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, goals: e.target.value })}
          placeholder="당신의 목표는 무엇인가요?"
        />
      </div>
      <div className="grid gap-2">
        <label>선호도</label>
        <textarea
          className="border p-2 rounded min-h-[80px]"
          value={localSettings.preferences || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, preferences: e.target.value })}
          placeholder="선호하는 활동이나 방식은 무엇인가요?"
        />
      </div>
    </div>
  );

  const renderAPITab = () => (
    <div className="space-y-6">
      {/* Notion Page URL */}
      <div className="grid gap-2">
        <label>Notion Page URL</label>
        <input 
          type="text"
          className="border p-2 rounded"
          value={localSettings.notionPageUrl || ''}
          onChange={(e) => setLocalSettings({ ...localSettings, notionPageUrl: e.target.value })}
          placeholder="https://www.notion.so/your-page-xxxxxxxxxxxxxxxxxxxxxxx"
        />
      </div>

      {/* Notion API 섹션 */}
      <div className="space-y-2">
        <div className="grid gap-2">
          <label>Notion API Key</label>
          <input 
            type="password"
            className="border p-2 rounded"
            value={localSettings.notionApiKey || ''}
            onChange={(e) => setLocalSettings({ ...localSettings, notionApiKey: e.target.value })}
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <button
          onClick={() => setShowNotionGuide(!showNotionGuide)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          {showNotionGuide ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          Notion API 키 얻는 방법
        </button>
        {showNotionGuide && (
          <div className="bg-blue-50 p-4 rounded-lg mt-2">
            <h3 className="text-blue-700 font-medium mb-2">Notion 통합 설정 방법</h3>
            <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
              <li>Notion 웹사이트에서 새로운 통합 생성</li>
              <li>통합에 원하는 워크스페이스 연결</li>
              <li>생성된 API 키 복사</li>
              <li>API 키를 위 입력란에 붙여넣기</li>
            </ol>
            <a 
              href="https://www.notion.so/my-integrations" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 mt-2"
            >
              Notion 통합 생성하기
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        )}
      </div>

      {/* Gemini API 섹션 */}
      <div className="space-y-2">
        <div className="grid gap-2">
          <label>Google Gemini API Key</label>
          <input 
            type="password"
            className="border p-2 rounded"
            value={localSettings.geminiApiKey || ''}
            onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
            placeholder="AI-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <button
          onClick={() => setShowGeminiGuide(!showGeminiGuide)}
          className="flex items-center text-sm text-green-600 hover:text-green-800"
        >
          {showGeminiGuide ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          Gemini API 키 얻는 방법
        </button>
        {showGeminiGuide && (
          <div className="bg-green-50 p-4 rounded-lg mt-2">
            <h3 className="text-green-700 font-medium mb-2">Gemini API 설정 방법</h3>
            <ol className="text-sm text-green-600 list-decimal list-inside space-y-1">
              <li>Google AI Studio 접속</li>
              <li>Get API Key 버튼 클릭</li>
              <li>API 키 생성</li>
              <li>생성된 키를 위 입력란에 붙여넣기</li>
            </ol>
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-sm text-green-700 hover:text-green-800 mt-2"
            >
              Google AI Studio 방문하기
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        )}
      </div>

      <div className="h-4"/>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4">
          <Settings className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>
        
        {showConfirmation ? (
          <div className="space-y-4">
            <p>이미 등록된 사용자 이름입니다.</p>
            <p>
              기존 노션 페이지: 
              <a 
                href={existingUserData?.notionUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 ml-2"
              >
                링크
              </a>
            </p>
            <p>본인이며, 설정을 업데이트하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleConfirm(false)}>취소</Button>
              <Button onClick={() => handleConfirm(true)}>업데이트</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex space-x-4 border-b mb-4">
              <button
                className={`py-2 px-4 ${activeTab === 'user' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                사용자
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'api' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('api')}
              >
                API 설정
              </button>
            </div>
            {activeTab === 'user' ? renderUserTab() : renderAPITab()}
            <Button onClick={handleSave} className="mt-4 w-full">
              모든 설정 저장
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};