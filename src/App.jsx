import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import CookbookPage from './pages/CookbookPage';
import MealPlanPage from './pages/MealPlanPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <RootLayout>
      <Routes>
        <Route path="/" element={<MealPlanPage />} />
        <Route path="/my-recipes" element={<CookbookPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </RootLayout>
  );
}