import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ResponsiveLayout } from './components/ui';
import {
  WelcomePage,
  LoginPage,
  CreateProfilePage,
  HomePage,
  HistoryPage,
  QuickAddPage,
  BPEntryPage,
  GlucoseEntryPage,
  DocumentsPage,
  AddDocumentPage,
  ExportPage,
  ClinicLinkPage,
  ProfilePage,
  SymptomEntryPage,
  TrendsPage,
  NotificationPage,
  FamilyManagementPage,
  FamilyDashboardPage,
} from './pages';

// Protected route wrapper
function ProtectedRoute({ children, hideNav = false }: { children: React.ReactNode; hideNav?: boolean }) {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (state.profiles.length === 0) {
    return <Navigate to="/create-profile" replace />;
  }

  return <ResponsiveLayout hideNav={hideNav}>{children}</ResponsiveLayout>;
}

// Auth route wrapper (redirect if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  if (state.isAuthenticated && state.profiles.length > 0) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Router setup
function AppRoutes() {
  const { state } = useApp();

  return (
    <Routes>
      {/* Welcome/Intro Screen */}
      <Route path="/welcome" element={
        <AuthRoute>
          <WelcomePage />
        </AuthRoute>
      } />

      {/* Auth Routes */}
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      <Route path="/create-profile" element={
        state.isAuthenticated ? <CreateProfilePage /> : <Navigate to="/welcome" replace />
      } />

      {/* Protected Routes - Full Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <HistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/trends" element={
        <ProtectedRoute>
          <TrendsPage />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationPage />
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <DocumentsPage />
        </ProtectedRoute>
      } />
      <Route path="/export" element={
        <ProtectedRoute>
          <ExportPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/family-management" element={
        <ProtectedRoute>
          <FamilyManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/family-dashboard" element={
        <ProtectedRoute>
          <FamilyDashboardPage />
        </ProtectedRoute>
      } />

      {/* Protected Routes - Modal-like (hide nav) */}
      <Route path="/quick-add" element={
        <ProtectedRoute hideNav>
          <QuickAddPage />
        </ProtectedRoute>
      } />
      <Route path="/bp-entry" element={
        <ProtectedRoute hideNav>
          <BPEntryPage />
        </ProtectedRoute>
      } />
      <Route path="/glucose-entry" element={
        <ProtectedRoute hideNav>
          <GlucoseEntryPage />
        </ProtectedRoute>
      } />
      <Route path="/symptom-entry" element={
        <ProtectedRoute hideNav>
          <SymptomEntryPage />
        </ProtectedRoute>
      } />
      <Route path="/add-document" element={
        <ProtectedRoute hideNav>
          <AddDocumentPage />
        </ProtectedRoute>
      } />
      <Route path="/clinic-link" element={
        <ProtectedRoute hideNav>
          <ClinicLinkPage />
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to home or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-background-light dark:bg-background-dark antialiased">
          <AppRoutes />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
