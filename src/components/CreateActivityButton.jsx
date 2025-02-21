import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useActivities } from './ActivityContext';
import { Plus } from 'lucide-react';

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const CreateActivityButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addActivity } = useActivities();
  const [activityData, setActivityData] = useState({
    title: '',
    startTime: '',
    endTime: getCurrentTime(),
    thoughts: ''
  });

  const handleDialogOpen = (open) => {
    if (open) {
      // 다이얼로그가 열릴 때마다 endTime을 현재 시간으로 업데이트
      setActivityData(prev => ({
        ...prev,
        endTime: getCurrentTime()
      }));
    }
    setIsOpen(open);
  };

  const handleSubmit = () => {
    if (!activityData.title || !activityData.startTime || !activityData.endTime) {
      alert('활동명과 시간을 모두 입력해주세요.');
      return;
    }

    // 시간 유효성 검사
    const [startHour, startMinute] = activityData.startTime.split(':').map(Number);
    const [endHour, endMinute] = activityData.endTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (startTotal >= endTotal) {
      alert('시작 시간은 종료 시간보다 이전이어야 합니다.');
      return;
    }

    addActivity(activityData);
    setActivityData({
      title: '',
      startTime: '',
      endTime: getCurrentTime(),
      thoughts: ''
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => handleDialogOpen(true)}
        className="w-full flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        활동 추가하기
      </Button>

      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새로운 활동 기록</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">활동명</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={activityData.title}
                onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="어떤 활동을 하셨나요?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">시작 시간</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={activityData.startTime}
                  onChange={(e) => setActivityData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">종료 시간</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={activityData.endTime}
                  onChange={(e) => setActivityData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">생각 / 감정</label>
              <textarea
                className="w-full p-2 border rounded min-h-[100px]"
                value={activityData.thoughts}
                onChange={(e) => setActivityData(prev => ({ ...prev, thoughts: e.target.value }))}
                placeholder="활동 중에 어떤 생각이나 감정이 들었나요?"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit}>
                추가하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};