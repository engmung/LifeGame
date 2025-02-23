import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Loader2 } from 'lucide-react';
import { useUserSettings } from './UserContext';
import { api } from '@/lib/api';

export const GenerateQuestionsButton = () => {
  const { settings } = useUserSettings();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateQuestions = async () => {
    if (!settings.characterName) {
      alert('설정에서 캐릭터 이름을 먼저 설정해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      const result = await api.generateQuestions(settings.characterName);
      
      if (result.notionPageUrl) {
        const shouldOpen = confirm('성찰 질문이 생성되었습니다. 노션 페이지를 여시겠습니까?');
        if (shouldOpen) {
          window.open(result.notionPageUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('질문 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleGenerateQuestions}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <HelpCircle className="h-6 w-6" />
      )}
    </Button>
  );
};