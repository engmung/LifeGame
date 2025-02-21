import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { useActivities } from './ActivityContext';

export const ActivityList = () => {
  const { activities, deleteActivity } = useActivities();

  if (activities.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500">
        아직 기록된 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {activities.map((activity) => (
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
                <Button variant="ghost" size="icon" onClick={() => {/* TODO: Edit */}}>
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
                {activity.thoughts}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};