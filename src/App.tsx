import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/NewTicketPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/new" element={<NewTicketPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
