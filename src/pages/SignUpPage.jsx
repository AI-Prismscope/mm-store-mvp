// src/pages/SignUpPage.jsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Changed function name for clarity
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // THE CORE DIFFERENCE: Calling signUp instead of signInWithPassword
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // On successful sign-up, let the user know to check their email (if confirmation is on)
      // or just redirect them. For our MVP, we'll redirect.
      alert('Sign up successful! You can now log in.');
      navigate('/login'); // Send them to the login page after signing up

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Changed title */}
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400">
            {/* Changed button text */}
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <p className="text-center">
          {/* Changed link text and destination */}
          Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}