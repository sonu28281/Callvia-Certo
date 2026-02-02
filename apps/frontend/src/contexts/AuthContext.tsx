import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { API_ENDPOINTS } from '../config/api';

interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
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

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
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
      
      // Fetch user profile first to check tenant status
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      const tenantId = userData.tenantId;

      // Check if user has a tenant (tenant admins and users)
      if (tenantId && userData.role !== 'PLATFORM_ADMIN') {
        const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
        
        if (!tenantDoc.exists()) {
          await signOut(auth);
          throw new Error('Tenant not found');
        }

        const tenantData = tenantDoc.data();
        
        // Check if tenant is disabled
        if (tenantData.isActive === false || tenantData.status === 'disabled') {
          await signOut(auth);
          throw new Error('Your account has been disabled. Please contact admin for assistance.');
        }
      }
      
      // Load user profile
      await fetchUserProfile(result.user.uid);
      
      // Update last login time
      await setDoc(doc(db, 'users', result.user.uid), {
        lastLoginAt: new Date()
      }, { merge: true });
      
      console.log('✅ Login successful');
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
    role: string,
    tenantId?: string
  ) => {
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create Firestore user document
      const userProfile: UserProfile = {
        userId: user.uid,
        email: user.email!,
        displayName,
        role: role as any,
        tenantId,
        isActive: true,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Set custom claims via backend (optional - for role-based access)
      const idToken = await user.getIdToken();
      await fetch(API_ENDPOINTS.AUTH.SET_CLAIMS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role, tenantId })
      });

      console.log('✅ Signup successful');
      await fetchUserProfile(user.uid);
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
