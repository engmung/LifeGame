import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { QuestTimer } from './QuestDialogs';
import { useUserSettings } from './QuestContext';

export const CustomQuestCard = () => {
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(() => {
    return localStorage.getItem('currentActivityName') || '';
  });
  const [isStarted, setIsStarted] = useState(() => {
    return localStorage.getItem('currentActivityName') ? true : false;
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [review, setReview] = useState('');
  const [timerData, setTimerData] = useState(null);
  const { settings } = useUserSettings();

  // Open dialog when activity is in progress
  useEffect(() => {
    if (isStarted) {
      setIsOpen(true);
    }
  }, [isStarted]);

  const resetState = () => {
    setIsStarted(false);
    setIsCompleted(false);
    setReview('');
    setTimerData(null);
    localStorage.removeItem('timer_custom');
    localStorage.removeItem('currentActivityName');
    if (!isOpen) {
      setActivityName('');
    }
  };

  const handleStartQuest = () => {
    if (!activityName.trim()) {
      alert('활동명을 입력해주세요.');
      return;
    }
    localStorage.setItem('currentActivityName', activityName);
    setIsStarted(true);
  };

  const handleComplete = async (timerData) => {
    setIsCompleted(true);
    setTimerData(timerData);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/activities/log/${settings.characterName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityName: activityName,
          timerDetails: timerData,
          review: review
        })
      });

      if (!response.ok) throw new Error('Failed to log activity');
      
      alert('활동이 기록되었습니다.');
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('활동 기록에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    resetState();
  };

  return (
    <>
      <Card 
        className={`h-full cursor-pointer ${isStarted ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[200px]">
          {isStarted ? (
            <>
              <h3 className="font-semibold">{activityName}</h3>
              <p className="text-sm text-blue-600 mt-2">진행 중...</p>
            </>
          ) : (
            <>
              <Plus className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">커스텀 퀘스트</h3>
              <p className="text-sm text-gray-600">나만의 활동 기록하기</p>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && !isCompleted && isStarted) {
          setIsOpen(true);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isStarted ? activityName : '커스텀 활동'}</DialogTitle>
          </DialogHeader>
          
          {isCompleted ? (
            <div className="grid gap-4">
              <label className="font-medium">활동 후기</label>
              <textarea 
                className="min-h-[100px] p-2 border rounded"
                placeholder="활동에 대한 후기를 작성해주세요..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  취소
                </Button>
                <Button onClick={handleSubmit}>
                  완료
                </Button>
              </div>
            </div>
          ) : !isStarted ? (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">활동명</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="활동명을 입력하세요"
                />
              </div>
              <Button onClick={handleStartQuest}>시작하기</Button>
            </div>
          ) : (
            <QuestTimer
              onComplete={handleComplete}
              onCancel={handleCancel}
              questId="custom"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomQuestCard;