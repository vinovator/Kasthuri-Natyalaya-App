
import React, { useState } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Classes } from './components/Classes';
import { Communication } from './components/Communication';
import { Fees } from './components/Fees';
import { Configuration } from './components/Configuration';
import { Progress } from './components/Progress';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const [currentView, setCurrentView] = useState('DASHBOARD');

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'STUDENTS': return <Students />;
      case 'CLASSES': return <Classes />;
      case 'FEES': return <Fees />;
      case 'PROGRESS': return <Progress />;
      case 'COMMUNICATION': return <Communication />;
      case 'CONFIGURATION': return <Configuration />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
