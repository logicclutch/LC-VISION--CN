import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useCCTVStore } from './store';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CamerasPage from './pages/CamerasPage';
import PeopleAnalyticsPage from './pages/PeopleAnalyticsPage';
import AlertsPage from './pages/AlertsPage';

import SpatialAnalyticsPage from './pages/SpatialAnalyticsPage';
import QueueAnalyticsPage from './pages/QueueAnalyticsPage';
import IdentityAnalyticsPage from './pages/IdentityAnalyticsPage';
import ParkingAnalyticsPage from './pages/ParkingAnalyticsPage';
import HealthAnalyticsPage from './pages/HealthAnalyticsPage';
import SafetyAnalyticsPage from './pages/SafetyAnalyticsPage';

function App() {
  const startPolling = useCCTVStore((state) => state.startPolling);
  const stopPolling = useCCTVStore((state) => state.stopPolling);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cameras" element={<CamerasPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          
          {/* Analytics Routes */}
          <Route path="/analytics/people" element={<PeopleAnalyticsPage />} />
          <Route path="/analytics/spatial" element={<SpatialAnalyticsPage />} />
          <Route path="/analytics/queue" element={<QueueAnalyticsPage />} />
          <Route path="/analytics/identity" element={<IdentityAnalyticsPage />} />
          <Route path="/analytics/parking" element={<ParkingAnalyticsPage />} />
          <Route path="/analytics/health" element={<HealthAnalyticsPage />} />
          <Route path="/analytics/safety" element={<SafetyAnalyticsPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
