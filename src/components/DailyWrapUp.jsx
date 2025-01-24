import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Book, Loader2 } from 'lucide-react';
import { useUserSettings } from './QuestContext';
import { api } from '@/lib/api';

// 타임라인 아이템 컴포넌트
const TimelineItem = ({ activity }) => (
  <div className="mb-8 flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-2 h-2 bg-blue-600 rounded-full" />
      <div className="w-0.5 h-full bg-blue-200" />
    </div>
    <div className="flex-1">
      <Card className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{activity.name}</h3>
          <span className="text-sm text-gray-500">
            {activity.start} - {activity.end}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          소요 시간: {activity.duration}분
        </p>
        {activity.review && (
          <div className="text-sm bg-gray-50 p-2 rounded">
            {activity.review}
          </div>
        )}
      </Card>
    </div>
  </div>
);

export const DailyWrapUpDialog = () => {
  const { settings } = useUserSettings();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateWrapUp = async () => {
    if (!settings.characterName) {
      alert('캐릭터 이름을 먼저 설정해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getDailyWrapUp(settings.characterName, selectedDate);
      setActivities(data.activities);
      
      if (data.notionPageUrl) {
        const shouldOpen = confirm('노션 페이지가 생성되었습니다. 지금 열어보시겠습니까?');
        if (shouldOpen) {
          window.open(data.notionPageUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-28">
          <Book className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>하루 마무리</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">날짜 선택</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleGenerateWrapUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '마무리 생성'
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded">
              {error}
            </div>
          )}

          {activities && (
            <div className="mt-4">
              <h3 className="font-semibold mb-4">활동 타임라인</h3>
              <div className="relative ml-4">
                {activities.map((activity, index) => (
                  <TimelineItem key={index} activity={activity} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};