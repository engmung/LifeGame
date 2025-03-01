import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Loader2 } from 'lucide-react';
import { useUserSettings } from './UserContext';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const GenerateQuestionsButton = () => {
  const { settings } = useUserSettings();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = React.useState(false);

  const handleGenerateQuestions = async () => {
    if (!settings.characterName) {
      alert('설정에서 캐릭터 이름을 먼저 설정해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      setShowLoadingDialog(true); // 로딩 다이얼로그 표시
      
      const result = await api.generateQuestions(settings.characterName);
      
      setShowLoadingDialog(false); // 로딩 다이얼로그 닫기
      
      if (result.notionPageUrl) {
        const shouldOpen = confirm('성찰 질문이 생성되었습니다. 노션 페이지를 여시겠습니까?');
        if (shouldOpen) {
          window.open(result.notionPageUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      
      setShowLoadingDialog(false); // 로딩 다이얼로그 닫기
      
      // 비활성화된 계정 오류 처리
      if (error.response && error.response.status === 403) {
        alert('계정이 아직 활성화되지 않았습니다. 관리자의 승인을 기다려주세요.');
      } else {
        alert('질문 생성에 실패했습니다.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
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

      {/* 로딩 다이얼로그 */}
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>질문 생성 중...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center">
              AI가 일기를 분석하고 성찰 질문을 생성하고 있습니다.<br/>
              이 과정은 약 30초 정도 소요됩니다.<br/>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};