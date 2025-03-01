import React from 'react';
import { UserSettingsProvider } from './components/UserContext';
import { ActivityProvider } from './components/ActivityContext';
import { SettingsDialog } from './components/SettingsDialog';
import { ActivityList } from './components/ActivityList';
import { CreateActivityButton } from './components/CreateActivityButton';
import { GenerateTimelineButton } from './components/GenerateTimelineButton';
import { GenerateQuestionsButton } from './components/GenerateQuestionsButton';
import { Analytics } from "@vercel/analytics/react"

const App = () => {
  return (
    <UserSettingsProvider>
      <ActivityProvider>
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="fixed top-4 right-4 flex gap-2">
            <SettingsDialog />
            <GenerateTimelineButton />
            <GenerateQuestionsButton />
          </div>
          <div className="mt-16">
            <CreateActivityButton />
            <ActivityList />
          </div>
        </div>
        <Analytics />
      </ActivityProvider>
    </UserSettingsProvider>
  );
};

export default App;