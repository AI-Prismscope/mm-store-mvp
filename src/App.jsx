// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import MealPlanPage from './pages/MealPlanPage';
import CookbookPage from './pages/CookbookPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';      // Import SignUpPage
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

export default function App() {
  return (
    <RootLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MealPlanPage />} />
          <Route path="/my-recipes" element={<CookbookPage />} />
          {/* Add any other protected routes here */}
        </Route>
      </Routes>
    </RootLayout>
  );
}