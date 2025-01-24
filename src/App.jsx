import React, { useState } from 'react';
import { QuestProvider, UserSettingsProvider, useQuests } from './components/QuestContext';
import { DailyWrapUpDialog } from './components/DailyWrapUp';
import { 
  SettingsDialog, 
  MBTIDialog, 
  QuestHistoryDialog,
  QuestDetailDialog 
} from './components/QuestDialogs';
import { 
  QuestCard, 
  QuestOverlay, 
  CreateQuestButton ,
  GenerateQuestButton
} from './components/QuestCards';

// MainContent component to use hooks
const MainContent = () => {
  const { quests } = useQuests();
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
    setDetailOpen(true);
  };

  return (
    <div className="relative">
      <div className="mt-16">
        <CreateQuestButton />
        <GenerateQuestButton />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {quests.length === 0 ? (
          <div className="flex justify-center items-center min-h-[60vh] col-span-2">
            <CreateQuestButton />
          </div>
        ) : (
          quests.map((quest) => (
            <QuestCard 
              key={quest.id} 
              quest={quest}
              onClick={handleQuestClick}
            />
          ))
        )}
      </div>

      {selectedQuest && (
        <QuestDetailDialog
          quest={selectedQuest}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      <QuestOverlay 
        mainCount={quests.filter(q => q.type === "Main Quest").length}
        subCount={quests.filter(q => q.type === "Sub Quest").length}
      />
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <UserSettingsProvider>
      <QuestProvider>
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="fixed top-4 right-4 flex gap-2">
            <SettingsDialog />
            <MBTIDialog />
            <QuestHistoryDialog />
            <DailyWrapUpDialog />
          </div>
          <MainContent />
        </div>
      </QuestProvider>
    </UserSettingsProvider>
  );
};

export default App;