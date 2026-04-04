import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import MakePicksView from './views/MakePicksView';
import EventStandingsView from './views/EventStandingsView';
import EventPredictionsView from './views/EventPredictionsView';
import LiveResultsView from './views/LiveResultsView';
import StandingsView from './views/StandingsView';
import HeadToHeadView from './views/HeadToHeadView';
import HallOfFameView from './views/HallOfFameView';
import AdminLoginView from './views/AdminLoginView';
import AdminView from './views/AdminView';

const AppContent = () => {
  const { currentView, isAdmin } = useApp();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <Navbar />
      {currentView === 'home' && <HomeView />}
      {currentView === 'make-picks' && <MakePicksView />}
      {currentView === 'event-standings' && <EventStandingsView />}
      {currentView === 'event-predictions' && <EventPredictionsView />}
      {currentView === 'live-results' && <LiveResultsView />}
      {currentView === 'standings' && <StandingsView />}
      {currentView === 'head-to-head' && <HeadToHeadView />}
      {currentView === 'halloffame' && <HallOfFameView />}
      {currentView === 'login' && <AdminLoginView />}
      {currentView === 'admin' && isAdmin && <AdminView />}
    </div>
  );
};

const FantasyWrestlingApp = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default FantasyWrestlingApp;
