import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInDemoUser: (role?: 'user' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  getAuthHeader: () => Promise<Record<string, string>>;
  refreshProfile: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user with backend
  const syncWithBackend = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncWithBackend(currentUser);
      } else {
        // Check for local demo profile
        const savedDemo = localStorage.getItem('transitmate_demo_user');
        if (savedDemo) {
          try {
            setProfile(JSON.parse(savedDemo));
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        await syncWithBackend(cred.user);
      }
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInDemoUser = async (role: 'user' | 'admin' = 'user') => {
    const demoProfile: UserProfile = {
      id: 999,
      uid: role === 'admin' ? 'demo-admin-uid' : 'demo-commuter-uid',
      email: role === 'admin' ? 'admin@transitmate.app' : 'commuter@transitmate.app',
      displayName: role === 'admin' ? 'Transit Admin' : 'Alex Commuter',
      role,
      preferredTransport: 'all',
      accessibilityNeeds: 'none',
      notificationsEnabled: true,
    };
    setProfile(demoProfile);
    localStorage.setItem('transitmate_demo_user', JSON.stringify(demoProfile));
  };

  const signOut = async () => {
    try {
      if (user) {
        await fbSignOut(auth);
      }
      localStorage.removeItem('transitmate_demo_user');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    if (user) {
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const refreshProfile = async () => {
    if (user) {
      await syncWithBackend(user);
    }
  };

  const updatePreferences = async (prefs: Partial<UserProfile>) => {
    if (user) {
      const headers = await getAuthHeader();
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } else if (profile) {
      const updated = { ...profile, ...prefs };
      setProfile(updated);
      localStorage.setItem('transitmate_demo_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInDemoUser,
        signOut,
        getAuthHeader,
        refreshProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
