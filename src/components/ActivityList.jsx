import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { useActivities } from './ActivityContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ActivityList = () => {
  const { activities, deleteActivity, updateActivity } = useActivities();
  const [isEditing, setIsEditing] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const handleEditClick = (activity) => {
    setIsEditing(true);
    setEditingActivity({...activity });
  };

  const handleEditChange = (field, value) => {
    setEditingActivity(prev => ({...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    updateActivity(editingActivity.id, editingActivity);
    setIsEditing(false);
    setEditingActivity(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingActivity(null);
  };

  if (activities.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500">
        아직 기록된 활동이 없습니다.
      </div>
    );
  }

  // 현재 날짜 기준으로 시간 값을 Date 객체로 변환하는 함수
  const getTimeAsDate = (timeStr) => {
    const today = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  };

  // 활동 종료 시간을 기준으로 내림차순 정렬
  const sortedActivities = [...activities].sort((a, b) => {
    const aTime = getTimeAsDate(a.endTime);
    const bTime = getTimeAsDate(b.endTime);
    return bTime - aTime;  // 내림차순 정렬 (최신순)
  });

  return (
    <div className="mt-8 space-y-4">
      {sortedActivities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{activity.title}</h3>
                <p className="text-sm text-gray-600">
                  {activity.startTime} - {activity.endTime}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(activity)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteActivity(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {activity.thoughts && (
              <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                <p>{activity.thoughts}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>활동 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">활동명</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editingActivity?.title || ''}
                onChange={(e) => handleEditChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">시작 시간</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={editingActivity?.startTime || ''}
                  onChange={(e) => handleEditChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">종료 시간</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded"
                  value={editingActivity?.endTime || ''}
                  onChange={(e) => handleEditChange('endTime', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">생각 / 감정</label>
              <textarea
                className="w-full p-2 border rounded min-h-[100px]"
                value={editingActivity?.thoughts || ''}
                onChange={(e) => handleEditChange('thoughts', e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>취소</Button>
              <Button onClick={handleSaveEdit}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};