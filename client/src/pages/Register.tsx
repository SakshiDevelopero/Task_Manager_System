import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password, 'user');
      navigate('/dashboard');
    } catch (err) {
      setErrors({
        form: (err as Error).message || 'Registration failed',
      });
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: (err as Error).message || 'Failed to create account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-taskDark overflow-hidden">
      {/* Left side - Image and slogan */}
      <div className="w-full md:w-1/2 bg-taskDark p-8 flex items-center justify-center relative overflow-hidden  md:flex">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-taskPurple opacity-10 rounded-full blur-3xl -bottom-1/2 -right-1/4"></div>
          <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full blur-3xl -top-1/2 -left-1/4"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2344&q=80"
            alt="Person working"
            className="w-full h-auto rounded-xl shadow-2xl opacity-80"
          />
        </div>
      </div>
      
      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-taskPurple mb-2">Signup</h2>
            <p className="text-gray-400">Create your TaskMe account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm text-gray-300">Full Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="task-input"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
            
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
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-gray-300">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="task-input"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>
            
            {errors.form && (
              <p className="text-red-500 text-xs">{errors.form}</p>
            )}
            
            <Button
              type="submit"
              className="w-full h-12 bg-taskPurple hover:bg-taskPurple-light text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'REGISTER'}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-taskPurple hover:underline">
              SIGNIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
