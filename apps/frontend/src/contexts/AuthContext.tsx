import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_ENDPOINTS } from '../config/api';

interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'PLATFORM_ADMIN' | 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
  tenantId?: string;
  phoneNumber?: string;
  photoURL?: string;
  isActive: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: string, tenantId?: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend API using Firebase token
  const fetchUserProfile = async (firebaseUser: User) => {
    try {
      // Get custom claims from token (force refresh to get latest)
      const idTokenResult = await firebaseUser.getIdTokenResult(true);
      const role = idTokenResult.claims.role as string;
      const tenantId = idTokenResult.claims.tenantId as string | undefined;
      
      console.log('👤 User profile from claims:', { uid: firebaseUser.uid, email: firebaseUser.email, role, tenantId, allClaims: idTokenResult.claims });
      
      // Set profile from token claims
      setUserProfile({
        userId: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        role: role as any || 'TENANT_USER',
        tenantId: tenantId,
        isActive: true,
        createdAt: new Date(),
        phoneNumber: firebaseUser.phoneNumber || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic profile
      setUserProfile({
        userId: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        role: 'TENANT_USER',
        isActive: true,
        createdAt: new Date(),
      });
    }
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Force token refresh to get updated custom claims
      const idTokenResult = await result.user.getIdTokenResult(true);
      const role = idTokenResult.claims.role;
      const tenantId = idTokenResult.claims.tenantId;
      
      console.log('👤 Login successful:', { email, role, tenantId, allClaims: idTokenResult.claims });

      // For non-platform admins, verify tenant access via backend
      if (tenantId && role !== 'PLATFORM_ADMIN') {
        // Backend will validate tenant status
        const token = await result.user.getIdToken();
        const response = await fetch(`${API_ENDPOINTS.AUTH.SET_CLAIMS}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role, tenantId })
        });

        if (!response.ok) {
          await signOut(auth);
          throw new Error('Account access denied. Contact your administrator.');
        }
      }

      // Profile will be fetched automatically by onAuthStateChanged
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  // Signup
  const signup = async (
    email: string,
    password: string,
    displayName: string,
    _role: string,
    _tenantId?: string
  ) => {
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Note: User creation now happens via backend signup API
      // This signup function is for internal use only
      console.log('✅ Signup successful (frontend only - use backend API for full signup)');
      await fetchUserProfile(user);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
