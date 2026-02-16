import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import insforge from './lib/insforge';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Restaurar sessão ao carregar
  React.useEffect(() => {
    const checkSession = async () => {
      const { data } = await insforge.auth.getCurrentSession();
      if (data?.session) {
        setCurrentUser(data.session.user);
        setIsLoggedIn(true);
      }
    };
    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await insforge.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const displayUser = currentUser || {
    name: 'Diego',
    email: 'diego@nutrixo.com',
    avatar: null
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ReloadPrompt />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout user={displayUser} onLogout={handleLogout} />}>
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

export default App;
