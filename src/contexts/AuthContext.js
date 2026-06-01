import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (e) {
        console.error('Session restoration error:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setUserRole(null);
    }
  };

  const authContext = {
    user,
    profile,
    userRole,
    loading,
    signUp: async (email, password, userData) => {
      try {
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Wait for auth user to be created
        await new Promise(resolve => setTimeout(resolve, 500));

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: newUser.id,
            ...userData,
            created_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        setUser(newUser);
        await fetchUserProfile(newUser.id);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    signIn: async (email, password) => {
      try {
        const { data: { user: signedInUser }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setUser(signedInUser);
        await fetchUserProfile(signedInUser.id);
        return { success: true, role: userRole };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setUserRole(null);
      } catch (error) {
        console.error('Sign out error:', error);
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
