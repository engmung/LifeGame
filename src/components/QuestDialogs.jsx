import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, User, Play, Pause, CheckCircle, History, Book } from 'lucide-react';
import { useQuests, useUserSettings } from './QuestContext';
import { api } from '@/lib/api';

export const QuestTimer = ({ onComplete, onCancel, questId }) => {
  const [timerState, setTimerState] = useState(() => {
    const savedState = localStorage.getItem(`timer_${questId}`);
    return savedState ? JSON.parse(savedState) : {
      startTime: null,
      currentTime: 0,
      isRunning: false,
      pauseHistory: [],
      lastPauseStart: null
    };
  });

  const timerRef = useRef(null);

  // 타이머 상태가 변경될 때마다 저장
  useEffect(() => {
    localStorage.setItem(`timer_${questId}`, JSON.stringify(timerState));
  }, [timerState, questId]);

  // 실제 경과 시간 계산
  const calculateElapsedTime = () => {
    if (!timerState.startTime) return 0;

    const totalPausedTime = timerState.pauseHistory.reduce(
      (total, pause) => total + (pause.endTime - pause.startTime),
      0
    );

    const currentPauseTime = timerState.lastPauseStart 
      ? Date.now() - timerState.lastPauseStart 
      : 0;

    const totalTime = Date.now() - timerState.startTime - totalPausedTime - currentPauseTime;
    return Math.floor(totalTime / 1000);
  };

  useEffect(() => {
    if (timerState.isRunning) {
      timerRef.current = setInterval(() => {
        const elapsed = calculateElapsedTime();
        setTimerState(prev => ({ ...prev, currentTime: elapsed }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState.isRunning]);

  const startTimer = () => {
    if (!timerState.startTime) {
      setTimerState(prev => ({
        ...prev,
        startTime: Date.now(),
        isRunning: true
      }));
    } else if (timerState.lastPauseStart) {
      setTimerState(prev => ({
        ...prev,
        pauseHistory: [
          ...prev.pauseHistory,
          {
            startTime: prev.lastPauseStart,
            endTime: Date.now()
          }
        ],
        lastPauseStart: null,
        isRunning: true
      }));
    }
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      lastPauseStart: Date.now(),
      isRunning: false
    }));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleComplete = () => {
    const finalTimerState = {
      startTime: timerState.startTime,
      endTime: Date.now(),
      totalTime: timerState.currentTime,
      pauseHistory: timerState.lastPauseStart ? [
        ...timerState.pauseHistory,
        {
          startTime: timerState.lastPauseStart,
          endTime: Date.now()
        }
      ] : timerState.pauseHistory
    };
    
    onComplete(finalTimerState);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="text-center p-4">
      <div className="text-4xl font-mono mb-4">{formatTime(timerState.currentTime)}</div>
      <div className="flex justify-center gap-2">
        <Button
          variant={timerState.isRunning ? "outline" : "default"}
          onClick={timerState.isRunning ? pauseTimer : startTimer}
        >
          {timerState.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        {timerState.currentTime > 0 && (
          <>
            <Button variant="default" onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
            <Button variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
      {timerState.pauseHistory.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Paused {timerState.pauseHistory.length} times
        </div>
      )}
    </div>
  );
};

export const QuestHistoryDialog = () => {
  const { completedQuests, deleteCompletedQuest } = useQuests();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (timerDetails) => {
    if (!timerDetails) return 'No time recorded';
    
    const totalSeconds = Math.floor(timerDetails.totalTime);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleDelete = (questId) => {
    if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
    deleteCompletedQuest(questId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-16">
          <History className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quest History</DialogTitle>
        </DialogHeader>
        {completedQuests.length === 0 ? (
          <p className="text-center text-gray-500">No completed quests yet.</p>
        ) : (
          completedQuests.map((quest) => (
            <Card key={quest.id + quest.completedAt} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{quest.title}</h3>
                  <p className="text-sm text-gray-600">{quest.type}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>Started: {formatDate(quest.timerDetails?.startTime)}</p>
                    <p>Completed: {formatDate(quest.timerDetails?.endTime)}</p>
                    <p>Total Time: {formatDuration(quest.timerDetails)}</p>
                    {quest.timerDetails?.pauseHistory?.length > 0 && (
                      <div className="mt-1">
                        <p>Pauses ({quest.timerDetails.pauseHistory.length}):</p>
                        <div className="ml-2 text-xs">
                          {quest.timerDetails.pauseHistory.map((pause, index) => (
                            <p key={index}>
                              {formatDate(pause.startTime)} - {formatDate(pause.endTime)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {quest.review && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm">{quest.review}</p>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(quest.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              </div>
            </Card>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export const QuestDetailDialog = ({ quest, open, onOpenChange }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [review, setReview] = useState('');
  const [timerData, setTimerData] = useState(null);
  const { completeQuest, startQuest, cancelQuest } = useQuests();
  const { settings } = useUserSettings();

  useEffect(() => {
    if (open) {
      startQuest(quest);
    }
  }, [open]);

  const handleTimerComplete = (finalTimerState) => {
    setTimerData(finalTimerState);
    setIsCompleted(true);
  };

  const handleCancel = () => {
    cancelQuest();
    setIsCompleted(false);
    setReview('');
    setTimerData(null);
    if (quest?.id) {
      localStorage.removeItem(`timer_${quest.id}`);
    }
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      if (!timerData) {
        console.error('No timer data available');
        alert('타이머 데이터가 없습니다.');
        return;
      }

      const questData = {
        quest,
        timerDetails: timerData,
        review
      };

      await api.completeQuest(settings.characterName, questData);
      completeQuest(quest, review);
      onOpenChange(false);
    } catch (error) {
      console.error('Error completing quest:', error);
      alert('퀘스트 완료에 실패했습니다.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{quest.title}</DialogTitle>
        </DialogHeader>
        
        {isCompleted ? (
          <div className="grid gap-4">
            <label className="font-medium">Quest Review</label>
            <textarea 
              className="min-h-[100px] p-2 border rounded"
              placeholder="Write your quest review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Complete
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">{quest.type}</div>
              <p className="text-gray-700">{quest.description}</p>
            </div>
            <QuestTimer 
              onComplete={handleTimerComplete} 
              onCancel={handleCancel} 
              questId={quest.id}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
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

      await api.generateQuests(settings.characterName);
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
  return (
    <Button 
      size="lg"
      variant="outline"
      className="w-full"
    >
      <Book className="mr-2 h-4 w-4" />
      퀘스트 만들기
    </Button>
  );
};