import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  useLoginMutation,
  useLogoutMutation, 
  useSignupMutation,
  useGetCurrentUserQuery,
  User as ApiUser,
  LoginRequest,
  SignupRequest
} from '../redux/resourcesApi/auth/authSlice';

// Use the User type from our API slice
type User = ApiUser;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  account_id?: number;
  account_attributes?: {
    name: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // RTK Query hooks for auth operations
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [signupMutation] = useSignupMutation();
  const { data: sessionData, isLoading: sessionLoading } = useGetCurrentUserQuery();

  // Effect to set auth state from the session query
  useEffect(() => {
    if (!sessionLoading) {
      if (sessionData?.status === 200 && sessionData?.user) {
        setUser(sessionData.user);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [sessionData, sessionLoading]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      
      if (response.status === 200) {
        setUser(response.user || null);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const signupData: SignupRequest = {
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        first_name: userData.first_name,
        last_name: userData.last_name,
        account_attributes: userData.account_attributes
      };

      const response = await signupMutation(signupData).unwrap();
      
      if (response.status === 201 || response.status === 200) {
        // Auto login after successful signup
        setUser(response.user || null);
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to signup');
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
