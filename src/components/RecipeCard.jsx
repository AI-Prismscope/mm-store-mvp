// src/components/RecipeCard.jsx

import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  // A simple placeholder if the recipe has no image
  const placeholderImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

  return (
    <Link to={`/recipe/${recipe.id}`} className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-40 w-full">
        <img
          src={recipe.image_url || placeholderImage}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-purple-600">
          {recipe.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {recipe.servings ? `${recipe.servings} servings` : 'Servings not specified'}
        </p>
      </div>
    </Link>
  );
}