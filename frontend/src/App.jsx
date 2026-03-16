import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProjectsPage from './dashboard/ProjectsPage';
import TasksPage from './dashboard/TasksPage';
import UsersPage from './dashboard/UsersPage';
import InvitesPage from './dashboard/InvitesPage';
import BillingPage from './billing/BillingPage';
import SettingsPage from './settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/:mode" element={<AuthPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/projects" element={<ProjectsPage />} />
        <Route path="/dashboard/tasks" element={<TasksPage />} />
        <Route path="/dashboard/users" element={<UsersPage />} />
        <Route path="/dashboard/invites" element={<InvitesPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
