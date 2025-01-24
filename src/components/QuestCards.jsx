import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuests, useUserSettings } from './QuestContext';

export const QuestCard = ({ quest, onClick }) => {
  const { inProgressQuest } = useQuests();
  const isInProgress = inProgressQuest?.id === quest.id;

  return (
    <Card 
      className={`h-full cursor-pointer transition-colors ${
        isInProgress ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(quest)}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{quest.title}</h3>
        <p className="text-sm text-gray-600">{quest.type}</p>
        {isInProgress && (
          <div className="mt-2 text-xs text-blue-600 font-medium">
            In Progress...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const QuestOverlay = ({ mainCount, subCount }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded-lg text-sm">
      <p>Main Quests: {mainCount}</p>
      <p>Sub Quests: {subCount}</p>
    </div>
  );
};

export const GenerateQuestButton = () => {
  const { settings } = useUserSettings();

  const handleGenerateQuest = async () => {
    try {
      if (!settings.characterName) {
        alert('캐릭터 이름을 먼저 설정해주세요.');
        return;
      }

      if (!confirm('새로운 퀘스트를 생성하시겠습니까? (개발자 전용)')) return;

      // 서버에서 퀘스트 생성
      const response = await fetch(`http://localhost:8000/quests/generate/${encodeURIComponent(settings.characterName)}`);
      if (!response.ok) {
        throw new Error('Failed to generate quests');
      }
      
      alert('퀘스트가 생성되었습니다. 불러오기 버튼을 눌러주세요.');
      
    } catch (error) {
      console.error('Error generating quests:', error);
      alert('퀘스트 생성에 실패했습니다.');
    }
  };

  return (
    <Button 
      onClick={handleGenerateQuest}
      size="lg"
      variant="outline"
      className="w-full mt-2"
    >
      퀘스트 생성하기 (개발자 전용)
    </Button>
  );
};

export const CreateQuestButton = () => {
  const { updateQuests } = useQuests();
  const { settings } = useUserSettings();

  const handleCreateQuest = async () => {
    try {
      if (!settings.characterName) {
        alert('캐릭터 이름을 먼저 설정해주세요.');
        return;
      }

      if (!confirm('현재 퀘스트를 모두 새로운 퀘스트로 교체하시겠습니까?')) return;

      // 서버에서 퀘스트 조회
      const response = await fetch(`http://localhost:8000/quests/${encodeURIComponent(settings.characterName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quests');
      }
      
      const result = await response.json();
      if (result.status === 'success') {
        // 기존 퀘스트 데이터 구조에 맞게 변환
        const newQuests = result.data.map(quest => ({
          id: quest.id,
          title: quest.title,
          type: quest.type,
          description: quest.description
        }));
        updateQuests(newQuests);
      } else {
        throw new Error(result.message || 'Failed to load quests');
      }
    } catch (error) {
      console.error('Error loading quests:', error);
      alert('퀘스트를 불러오는데 실패했습니다.');
    }
  };

  return (
    <Button 
      onClick={handleCreateQuest}
      size="lg"
      className="w-full"
    >
      퀘스트 생성하기
    </Button>
  );
};