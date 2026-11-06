import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/common/CommandPalette';
import { TaskModal } from './components/common/TaskModal';
import { TaskDetailsDrawer } from './components/common/TaskDetailsDrawer';
import { LandingPage } from './pages/LandingPage';

// Pages
import { Dashboard } from './pages/Dashboard';
import { MyDay } from './pages/MyDay';
import { AllTasks } from './pages/AllTasks';
import { SmartScheduler } from './pages/SmartScheduler';
import { MinHeapVisualizer } from './pages/MinHeapVisualizer';
import { CalendarPage } from './pages/Calendar';
import { Timeline } from './pages/Timeline';
import { FocusStudio } from './pages/FocusStudio';
import { HabitsGoals } from './pages/HabitsGoals';
import { Analytics } from './pages/Analytics';
import { DependencyGraph } from './pages/DependencyGraph';
import { RecurringTasks } from './pages/RecurringTasks';
import { InboxNotifications } from './pages/InboxNotifications';
import { ActivityHistory } from './pages/ActivityHistory';
import { SettingsIntegrations } from './pages/SettingsIntegrations';
import { SystemDiagnostics } from './pages/SystemDiagnostics';

const PageContent: React.FC = () => {
  const { viewMode, setViewMode, currentPage, isSidebarCollapsed } = useApp();

  if (viewMode === 'landing') {
    return <LandingPage onEnterApp={() => setViewMode('app')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'my-day':
        return <MyDay />;
      case 'inbox':
        return <InboxNotifications />;
      case 'tasks':
        return <AllTasks />;
      case 'scheduler':
        return <SmartScheduler />;
      case 'calendar':
        return <CalendarPage />;
      case 'timeline':
        return <Timeline />;
      case 'recurring':
        return <RecurringTasks />;
      case 'dependencies':
        return <DependencyGraph />;
      case 'focus':
        return <FocusStudio />;
      case 'habits':
      case 'goals':
        return <HabitsGoals />;
      case 'analytics':
      case 'reports':
        return <Analytics />;
      case 'activity':
        return <ActivityHistory />;
      case 'heap-visualizer':
      case 'algo-playground':
      case 'simulator':
      case 'dsa-performance':
        return <MinHeapVisualizer />;
      case 'notifications':
        return <InboxNotifications />;
      case 'settings':
      case 'integrations':
        return <SettingsIntegrations />;
      case 'diagnostics':
      case 'help':
        return <SystemDiagnostics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-titanium-main text-titanium-text flex flex-col font-sans">
      <Sidebar />
      <Navbar />

      <main
        className={`flex-1 p-6 md:p-10 pt-28 transition-all duration-300 max-w-7xl w-full mx-auto ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {renderPage()}
      </main>

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <TaskModal />
      <TaskDetailsDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <PageContent />
    </AppProvider>
  );
};

export default App;
