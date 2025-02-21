import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';
import { useActivities } from './ActivityContext';
import { useUserSettings } from './UserContext';
import { api } from '@/lib/api';

export const GenerateTimelineButton = () => {
  const { activities, clearActivities } = useActivities();
  const { settings } = useUserSettings();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateTimeline = async () => {
    if (activities.length === 0) {
      alert('기록된 활동이 없습니다.');
      return;
    }

    if (!settings.characterName) {
      alert('설정에서 캐릭터 이름을 먼저 설정해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await api.generateTimeline(settings.characterName, activities);
      
      if (result.notionPageUrl) {
        const shouldOpen = confirm('타임라인이 생성되었습니다. 노션 페이지를 여시겠습니까?');
        if (shouldOpen) {
          window.open(result.notionPageUrl, '_blank');
        }
      }
      
      clearActivities(); // 활동 목록 초기화
    } catch (error) {
      console.error('Error generating timeline:', error);
      alert('타임라인 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGenerateTimeline}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <BookOpen className="h-6 w-6" />
      )}
    </Button>
  );
};