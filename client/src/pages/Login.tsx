import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = (err as Error).message || 'Invalid email or password';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, add quick login buttons
  const loginAsAdmin = async () => {
    setEmail('admin@example.com');
    setPassword('password');
    try {
      await login('admin@example.com', 'password');
      toast({
        title: 'Login successful',
        description: 'Welcome back Admin!',
      });
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    }
  };

  const loginAsUser = async () => {
    setEmail('user@example.com');
    setPassword('password');
    try {
      await login('user@example.com', 'password');
      toast({
        title: 'Login successful',
        description: 'Welcome back User!',
      });
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-taskDark overflow-hidden">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-taskPurple mb-2">Login</h2>
            <p className="text-gray-400">Welcome back to TaskMe</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-gray-300">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="task-input"
                required
              />
              {error && error.includes('email') && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-gray-300">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="task-input"
                required
              />
            </div>
            
            {error && !error.includes('email') && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
            
            <Button
              type="submit"
              className="w-full h-12 bg-taskPurple hover:bg-taskPurple-light text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/register" className="text-taskPurple hover:underline">
              SIGNUP
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right side - Image and slogan */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-taskDark to-taskDark-lighter p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-taskPurple opacity-20 rounded-full blur-3xl -top-1/2 -right-1/4"></div>
          <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full blur-3xl -bottom-1/2 -left-1/4"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Task Management System 
          </h1>
          <p className="text-xl text-gray-500">Sakshi Mukesh Otari</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
