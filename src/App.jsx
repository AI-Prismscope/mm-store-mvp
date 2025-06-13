// src/App.jsx

import { Routes, Route } from 'react-router-dom';
// 👇 Import the new components
import HomepageLayout from './layouts/HomepageLayout';
import ShopPage from './pages/ShopPage';

// (Keep your other page and component imports)
import RootLayout from './layouts/RootLayout'; // We might still use this for other pages
import MealPlanPage from './pages/MealPlanPage';
import CookbookPage from './pages/CookbookPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* --- NEW HOMEPAGE LAYOUT --- */}
      {/* This wrapper provides the Navbar and 2-column layout */}
      <Route element={<HomepageLayout />}>
        {/* The main shop page will now be the root path */}
        <Route path="/" element={<ShopPage />} />
        {/* In the future, you could add category pages here like: */}
        {/* <Route path="/shop/fruit" element={<FruitCategoryPage />} /> */}
      </Route>
      
      {/* --- PROTECTED ROUTES using the old RootLayout --- */}
      {/* These pages might not need the 2-column layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}> {/* A simpler layout for these pages */}
          <Route path="/my-recipes" element={<CookbookPage />} />
          <Route path="/plan" element={<MealPlanPage />} />
        </Route>
      </Route>
    </Routes>
  );
}