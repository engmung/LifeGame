import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Loader2, Trash2 } from 'lucide-react';
import { useQuests, useUserSettings } from './QuestContext';
import { api } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

export const QuestCard = ({ quest, onClick }) => {
  const { inProgressQuest, selectedQuests, toggleQuestSelection } = useQuests();
  const isInProgress = inProgressQuest?.id === quest.id;
  const isSelected = selectedQuests.includes(quest.id);

  const handleSelect = (e) => {
    e.stopPropagation();
    toggleQuestSelection(quest.id);
  };

  return (
    <Card 
      className={`relative h-full cursor-pointer transition-colors ${
        isInProgress ? 'bg-blue-50 hover:bg-blue-100' : 
        isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(quest)}
    >
      <div 
        className="absolute top-2 right-2 z-10"
        onClick={handleSelect}
      >
        <Checkbox 
          checked={isSelected}
          className="h-5 w-5"
        />
      </div>
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

export const DeleteQuestsButton = () => {
  const { selectedQuests, deleteSelectedQuests } = useQuests();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (selectedQuests.length === 0) {
      alert('삭제할 퀘스트를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedQuests.length}개의 퀘스트를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteSelectedQuests();
      alert('선택한 퀘스트가 삭제되었습니다.');
    } catch (error) {
      alert('퀘스트 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="destructive"
      size="sm"
      disabled={selectedQuests.length === 0 || isDeleting}
      className="ml-2"
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          삭제 중...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          선택 삭제 ({selectedQuests.length})
        </>
      )}
    </Button>
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
  const { updateQuests } = useQuests();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuest = async () => {
    try {
      if (!settings.characterName) {
        alert('캐릭터 이름을 먼저 설정해주세요.');
        return;
      }

      if (!confirm('새로운 퀘스트를 생성하시겠습니까? (개발자 전용)')) return;

      setIsGenerating(true);
      await api.generateQuests(settings.characterName);
      
      // Fetch newly generated quests
      const result = await api.getQuests(settings.characterName);
      if (result.status === 'success') {
        const newQuests = result.data.map(quest => ({
          id: quest.id,
          title: quest.title,
          type: quest.type,
          description: quest.description,
          difficulty: quest.difficulty,
          exp: quest.exp,
          gold: quest.gold
        }));
        
        updateQuests(newQuests);
        alert('새로운 퀘스트가 생성되었습니다.');
      }
    } catch (error) {
      console.error('Error generating quests:', error);
      alert('퀘스트 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateQuest}
      size="lg"
      variant="outline"
      className="w-full mt-2"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          퀘스트 생성 중...
        </>
      ) : (
        "퀘스트 생성하기 (개발자 전용)"
      )}
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

      const result = await api.getQuests(settings.characterName);
      if (result.status === 'success') {
        // 기존 퀘스트 데이터 구조에 맞게 변환
        const newQuests = result.data.map(quest => ({
          id: quest.id,
          title: quest.title,
          type: quest.type,
          description: quest.description,
          difficulty: quest.difficulty,
          exp: quest.exp,
          gold: quest.gold
        }));
        
        updateQuests(newQuests);
        alert('새로운 퀘스트가 로드되었습니다.');
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
      alert('퀘스트 불러오기에 실패했습니다.');
    }
  };

  return (
    <Button 
      onClick={handleCreateQuest}
      size="lg"
      variant="outline"
      className="w-full"
    >
      <Book className="mr-2 h-4 w-4" />
      퀘스트 불러오기
    </Button>
  );
};
