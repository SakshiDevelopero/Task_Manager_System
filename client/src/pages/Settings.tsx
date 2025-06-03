
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Sun, Moon } from 'lucide-react';

const Settings = () => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  
  // Initialize dark mode state from localStorage or default to true
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') !== 'light';
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'light');
    }
    
    toast({
      title: newDarkMode ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: `The application theme has been changed to ${newDarkMode ? 'dark' : 'light'} mode.`,
    });
  };
  
  if (!currentUser) return null;

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 bg-card border-b border-border">
          <h1 className="text-xl font-semibold">Settings</h1>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Profile Settings */}
            <section className="bg-card p-6 rounded-lg border border-border mb-8">
              <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm text-muted-foreground">Full Name</label>
                  <Input
                    id="name"
                    defaultValue={currentUser.name}
                    className="task-input"
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
                  <Input
                    id="email"
                    defaultValue={currentUser.email}
                    disabled
                    className="task-input opacity-70"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="role" className="text-sm text-muted-foreground">Role</label>
                  <Input
                    id="role"
                    defaultValue={currentUser.role}
                    disabled
                    className="task-input opacity-70"
                  />
                </div>
              </div>
            </section>
            
            {/* Notification Settings */}
            <section className="bg-card p-6 rounded-lg border border-border mb-8">
              <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications about task updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Task Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded about upcoming deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status Updates</p>
                    <p className="text-xs text-muted-foreground">Notify when a task status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </section>
            
            {/* Theme Settings */}
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                className="task-button"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
