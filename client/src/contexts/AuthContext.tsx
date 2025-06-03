import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import authAPI from '../lib/api';  // Changed to default import
import { Navigate } from 'react-router-dom';

// User types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  createdAt?: string;
  devices?: Array<{
    deviceName: string;
    ipAddress: string;
    lastLogin: string;
    isActive: boolean;
  }>;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isAdmin: boolean;
  allUsers: User[];
  isLoading: boolean;  // Add this line
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  devices: User['devices'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<User['devices']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          authAPI.setAuthToken(storedToken);
          
          // Get current user profile
          const response = await authAPI.getProfile();
          const user = response.data.data.user;
          setCurrentUser(user);

          // If admin, get all users
          if (user.role === 'admin') {
            try {
              const usersResponse = await authAPI.getAllUsers();
              setAllUsers(usersResponse.data.users || []);
            } catch (error) {
              console.error('Error fetching users:', error);
              setAllUsers([]);
            }
          }

          // Get user devices
          try {
            const devicesResponse = await authAPI.getDevices();
            setDevices(devicesResponse.data.data || []);
          } catch (error) {
            console.error('Error fetching devices:', error);
            setDevices([]);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setAllUsers([]);
        setDevices([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      authAPI.setAuthToken(token);
      setCurrentUser(user);

      // Fetch additional data
      try {
        const promises: Promise<any>[] = [authAPI.getDevices()];
        
        if (user.role === 'admin') {
          promises.push(authAPI.getAllUsers());
        }

        const [devicesRes, usersRes] = await Promise.all(promises);
        setDevices(devicesRes.data.data || []);
        
        if (usersRes) {
          setAllUsers(usersRes.data.users || []);
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
        setDevices([]);
        if (user.role === 'admin') {
          setAllUsers([]);
        }
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
    } catch (error: any) {
      localStorage.removeItem('token');
      setToken(null);
      setCurrentUser(null);
      setAllUsers([]);
      setDevices([]);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    try {
      const response = await authAPI.register(name, email, password, role);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);

      if (user.role === 'admin') {
        const usersResponse = await authAPI.getAllUsers();
        setAllUsers(usersResponse.data.users || []);
      }

      toast({
        title: "Account created!",
        description: `Welcome, ${user.name}!`,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'admin')) {
        throw new Error("You don't have permission to update this user");
      }

      const updatedUserRes = await authAPI.updateProfile(userData);
      setCurrentUser(updatedUserRes.data.data);

      const usersRes = await authAPI.getAllUsers();
      setAllUsers(usersRes.data.users || []);

      toast({
        title: "User updated",
        description: "User information has been updated successfully"
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error("Only admins can delete users");
      }

      if (currentUser.id === userId) {
        throw new Error("You cannot delete your own account");
      }

      await authAPI.deleteUser(userId);

      const usersRes = await authAPI.getAllUsers();
      setAllUsers(usersRes.data.users || []);

      toast({
        title: "User deleted",
        description: "User has been removed successfully"
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setDevices([]);
    setAllUsers([]);

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    token,
    isAdmin: currentUser?.role === 'admin',
    allUsers,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    deleteUser,
    devices
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};
