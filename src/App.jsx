import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import Measurements from './pages/Measurements';
import Progress from './pages/Progress';
import NutritionPlan from './pages/NutritionPlan';
import Food from './pages/Food';
import GamerProfile from './pages/GamerProfile';
import ReloadPrompt from './components/ReloadPrompt';

const AppContent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const handleLogin = React.useCallback((userData, token) => {
    login(userData, token);
    window.history.replaceState(null, '', '/');
  }, [login]);

  // Splash enquanto verifica sessão
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ReloadPrompt />
      </>
    );
  }

  const displayUser = user || {
    name: 'Usuário',
    email: 'usuario@nutrixo.com',
    avatar: null
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout user={displayUser} onLogout={logout} />}>
          <Route index element={<Dashboard />} />
          <Route path="labs" element={<Labs />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="progress" element={<Progress />} />
          <Route path="nutrition-plan" element={<NutritionPlan />} />
          <Route path="food" element={<Food />} />
          <Route path="gamer-profile" element={<GamerProfile />} />
        </Route>
      </Routes>
      <ReloadPrompt />
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
