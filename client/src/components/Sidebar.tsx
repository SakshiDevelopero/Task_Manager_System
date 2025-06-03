
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckSquare, LayoutDashboard, LogOut, Settings, Users, ClipboardList, Camera } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, to, active }) => {
  return (
    <Link to={to}>
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
          active
            ? 'bg-taskPurple text-white'
            : 'text-gray-400 hover:bg-taskDark-lighter hover:text-white'
        } transform hover:scale-105 transition-all duration-300`}
      >
        {icon}
        <span>{text}</span>
      </div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();
  
  if (!currentUser) return null;

  // Different menu items based on role
  const dashboardLink = isAdmin ? '/admin-dashboard' : '/user-dashboard';

  return (
    <div className="h-full w-64 bg-taskDark-light flex flex-col border-r border-taskDark-lighter">
      {/* Logo and app name */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-6 w-6 text-taskPurple animate-pulse" />
          <span className="text-xl font-bold text-white">TaskMe</span>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col flex-1 px-4 py-6 space-y-2">
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          text="Dashboard"
          to={dashboardLink}
          active={location.pathname === dashboardLink || location.pathname === '/dashboard'}
        />
        
        {isAdmin && (
          <SidebarItem
            icon={<ClipboardList className="h-5 w-5" />}
            text="Task Management"
            to="/admin-dashboard"
            active={location.pathname === '/task-management'}
          />
        )}
        
        {isAdmin && (
          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            text="Manage Users"
            to="/users"
            active={location.pathname === '/users'}
          />
        )}

        {!isAdmin && (
          <SidebarItem
            icon={<Camera className="h-5 w-5" />}
            text="Upload Task Photos"
            to="/user-dashboard?tab=upload"
            active={location.pathname === '/user-dashboard' && location.search.includes('tab=upload')}
          />
        )}
        
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          text="Settings"
          to="/settings"
          active={location.pathname === '/settings'}
        />
      </div>
      
      {/* User info and logout */}
      <div className="p-4 border-t border-taskDark-lighter">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-taskPurple flex items-center justify-center text-white font-medium transform hover:scale-110 transition-transform duration-300">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.role}</p>
          </div>
        </div>
        
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start text-gray-400 border-taskDark-lighter hover:bg-taskDark-lighter hover:text-white transform hover:scale-105 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
