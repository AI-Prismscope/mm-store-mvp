// src/App.jsx

import { Routes, Route } from 'react-router-dom';
// 👇 Import the new components
import HomepageLayout from './layouts/HomepageLayout';
import ShopPage from './pages/ShopPage';
import SearchResultsPage from './pages/SearchResultsPage';
import CategoryPage from './pages/CategoryPage';

// (Keep your other page and component imports)
import RootLayout from './layouts/RootLayout'; // We might still use this for other pages
import MealPlanPage from './pages/MealPlanPage';
import CookbookPage from './pages/CookbookPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout'; // 👈 Import AppLayout
import RecipeDetailPage from './pages/RecipeDetailPage';
import { useUI } from './context/UIContext';
import ProductDetailModal from './components/ProductDetailModal';

export default function App() {
  const { viewingProductId } = useUI();
  return (
    <>
      <Routes>
        {/* Public Auth Routes (no change) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Homepage Layout (no change) */}
        <Route element={<HomepageLayout />}>
          <Route path="/" element={<ShopPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/shop/:categorySlug" element={<CategoryPage />} />
        </Route>
        
        {/* --- NEW: PROTECTED APP LAYOUT --- */}
        {/* This wrapper provides the Navbar for our main app pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}> {/* 👈 Use the new layout */}
            <Route path="/my-recipes" element={<CookbookPage />} />
            <Route path="/plan" element={<MealPlanPage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          </Route>
        </Route>
      </Routes>
      {/* Conditionally render the Product Detail Modal */}
      {viewingProductId && <ProductDetailModal productId={viewingProductId} />}
    </>
  );
}