// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Make sure this path is correct

// Create the context
const AuthContext = createContext();

// Create the provider component
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange is Supabase's magic listener.
    // It fires once on initial load, and again every time the user logs in or out.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // This cleanup function will unsubscribe from the listener when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // The value provided to consuming components
  const value = {
    session,
    user: session?.user,
    logout: () => supabase.auth.signOut(),
    loading,
  };

  // We only render the rest of the app after the initial session check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for easy consumption of the context
export function useAuth() {
  return useContext(AuthContext);
}