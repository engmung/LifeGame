import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
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
  const [accountStatus, setAccountStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  useEffect(() => {
    setLocalSettings(settings);
    
    // 사용자 상태 확인
    const checkUserStatus = async () => {
      if (settings.characterName) {
        try {
          const response = await api.getUserStatus(settings.characterName);
          if (response.status === 'success' && response.data) {
            setAccountStatus(response.data.status || 'Inactive');
          }
        } catch (error) {
          console.error('Error fetching user status:', error);
        }
      }
    };
    
    checkUserStatus();
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
  
      // 로딩 상태 활성화
      setIsSaving(true);
  
      const checkResponse = await api.checkUser(localSettings);
      
      if (checkResponse.status === 'exists') {
        setExistingUserData(checkResponse.data);
        setShowConfirmation(true);
        setIsSaving(false); // 로딩 상태 비활성화
        return;
      }
  
      const response = await api.createUser(localSettings);
      updateSettings(localSettings);
      
      // 계정 상태 업데이트
      if (response.status === 'success') {
        setAccountStatus('Inactive');
        alert('설정이 저장되었습니다. 관리자 승인 후 활동 기록 및 질문 생성이 가능합니다.');
      } else {
        alert('설정이 저장되었습니다.');
      }
      
      setShowConfirmation(false);
      
    } catch (error) {
      console.error('Error:', error);
      
      // 항상 노션 통합 오류로 간주하고 명확한 메시지 표시
      alert('노션 페이지에 API가 연결되지 않았습니다.\n노션 페이지에서 우측 상단 ...과 연결을 통해 연결해주세요. \n\n문제가 계속 발생시, 디스코드로 연락주세요.');
    } finally {
      // 로딩 상태 비활성화
      setIsSaving(false);
    }
  };

  const handleConfirm = async (confirmed) => {
    if (confirmed) {
      try {
        // 로딩 상태 활성화
        setIsSaving(true);
  
        const response = await api.createUser({
          ...localSettings,
          confirmUpdate: true
        });
        updateSettings(localSettings);
        
        // 상태 업데이트
        setAccountStatus(response.data?.status || 'Inactive');
        alert('설정이 업데이트되었습니다.');
        
        // 확인 대화상자 닫고 설정창으로 돌아가기
        setShowConfirmation(false);
      } catch (error) {
        console.error('Error:', error);
        alert('설정 업데이트에 실패했습니다.');
        // 오류가 발생해도 확인 대화상자 닫기
        setShowConfirmation(false);
      } finally {
        // 로딩 상태 비활성화
        setIsSaving(false);
      }
    } else {
      // 사용자가 "아니오"를 선택한 경우 - 확인 대화상자만 닫음
      setShowConfirmation(false);
      // 사용자 이름을 변경하라는 메시지 표시
      alert('다른 사용자 이름으로 등록해 주세요.');
    }
  };

  const renderUserTab = () => (
    <div className="space-y-4">
      {accountStatus && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          accountStatus === 'Active' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-amber-50 text-amber-700'
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span>
            계정 상태: <strong>{accountStatus === 'Active' ? '활성화됨' : '비활성화됨'}</strong>
            {accountStatus !== 'Active' && (
              <span className="block text-xs mt-1">관리자 승인 후 활동 기록 및 질문 생성이 가능합니다.</span>
            )}
          </span>
        </div>
      )}
      
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
            <p className="font-medium text-amber-600">이미 등록된 사용자 이름입니다.</p>
            <p>
              노션 페이지: 
              <a 
                href={existingUserData?.notionUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 ml-2"
              >
                링크
              </a>
            </p>
            <div className="bg-amber-50 p-3 rounded border border-amber-200">
              <p className="text-amber-700 mb-2">정말 본인의 계정이 맞습니까?</p>
              <p className="text-sm text-gray-600">
                본인이 맞다면 '예'를 선택하여 정보를 업데이트할 수 있습니다. 
                다른 사람의 계정이라면 '아니오'를 선택하여 다른 사용자 이름으로 등록해 주세요.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleConfirm(false)}
                disabled={isSaving}
              >
                아니오, 다른 이름으로 등록할게요
              </Button>
              <Button 
                onClick={() => handleConfirm(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    처리중...
                  </>
                ) : (
                  '예, 내 계정입니다'
                )}
              </Button>
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
            <Button 
              onClick={handleSave} 
              className="mt-4 w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                '모든 설정 저장'
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};