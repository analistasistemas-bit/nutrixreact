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

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const user = {
    name: 'Diego',
    email: 'diego@nutrixo.com',
    avatar: null
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="labs" element={<Labs />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="progress" element={<Progress />} />
          <Route path="nutrition-plan" element={<NutritionPlan />} />
          <Route path="food" element={<Food />} />
          <Route path="gamer-profile" element={<GamerProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
