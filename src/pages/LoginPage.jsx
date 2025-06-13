// src/pages/LoginPage.jsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

// You will need to provide your own image asset for the top graphic
import loginGraphic from '../assets/login-graphic.png'; // 👈 Create this asset

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/'); // Redirect to homepage on successful login
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Common styling for our form inputs
  const inputStyles = "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-lime-100 p-4">
      <div className="w-full max-w-sm">
        {/* Top Decorative Graphic */}
        <img src={loginGraphic} alt="Assortment of food items" className="w-48 mx-auto mb-4" />

        {/* The Main Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <h1 className="text-center text-3xl font-serif text-gray-800 border-b-2 border-lime-200 pb-4">
            RecipeApp
          </h1>
          <h2 className="text-center text-xl font-bold text-gray-700">
            Welcome back!
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
            </div>
            
            <div className="relative">
              <label htmlFor="password-login" className="block text-sm font-medium text-gray-600 mb-1">Password *</label>
              <input id="password-login" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400">
                {/* Eye Icon SVG */}
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.522 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              </button>
            </div>

            <div className="text-right">
              <a href="#" className="text-sm font-medium text-green-600 hover:underline">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-colors">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-600 mt-6 space-y-1">
          <p>Need help? <a href="#" className="font-medium text-green-600 hover:underline">Contact Customer Care</a></p>
          <p>New to RecipeApp? <Link to="/signup" className="font-medium text-green-600 hover:underline">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}