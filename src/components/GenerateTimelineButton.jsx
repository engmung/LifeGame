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
      
      // 오류 응답 분석
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || '';
        
        // 비활성화된 계정 오류 처리
        if (status === 403 || (detail && detail.includes('not active'))) {
          const discordLink = "https://discord.gg/aszh8Yh9"; // 디스코드 서버 초대 링크로 변경
          const confirmMessage = `계정이 아직 활성화되지 않았습니다.\n\n관리자의 승인이 필요합니다. 디스코드에서 관리자에게 연락하여 승인을 요청하시겠습니까?\n\n사용자 이름: ${settings.characterName}`;
          
          if (confirm(confirmMessage)) {
            window.open(discordLink, '_blank');
          }
        } else {
          // 기타 오류 처리
          alert(`타임라인 생성에 실패했습니다.\n\n${detail || '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}`);
        }
      } else {
        // 기타 예상치 못한 오류
        alert(`타임라인 생성에 실패했습니다.\n\n${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
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