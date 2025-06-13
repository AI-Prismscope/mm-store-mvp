// src/pages/SignUpPage.jsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import loginGraphic from '../assets/login-graphic.png'; // Reusing the same graphic

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Sign up successful! You can now log in.');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-lime-100 p-4">
      <div className="w-full max-w-sm">
        <img src={loginGraphic} alt="Assortment of food items" className="w-48 mx-auto mb-4" />
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h1 className="text-center text-3xl font-serif text-gray-800 border-b-2 border-lime-200 pb-4">
            RecipeApp
          </h1>
          <h2 className="text-center text-xl font-bold text-gray-700">
            Create an account
          </h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
            </div>
            <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-gray-600 mb-1">Password *</label>
              <input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} placeholder="At least 6 characters"/>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </form>
        </div>
        <div className="text-center text-sm text-gray-600 mt-6">
          <p>Already have an account? <Link to="/login" className="font-medium text-green-600 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}