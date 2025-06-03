import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import api from '../lib/api';
import Sidebar from '@/components/Sidebar';
import EnhancedTaskCard from '@/components/EnhancedTaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { CheckCheck, Upload, Search, Image, FileImage, X, Clock, Calendar, Bell, Heart, Star, Sparkles, Crown, Users } from 'lucide-react';
import { TableCell } from "@/components/ui/table";

const UserDashboard = () => {
  const { currentUser, isAdmin, token } = useAuth();
  const { tasks, updateTaskStatus, addTaskPhoto, addTaskComment } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('myTasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'upload') {
      setActiveTab('uploadPhotos');
    }
    
    const taskId = searchParams.get('taskId');
    if (taskId) {
      setSelectedTaskId(taskId);
      setActiveTab('uploadPhotos');
    }
    
    const timer = setTimeout(() => {
      setShowWelcomeNotification(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  const userTasks = currentUser
    ? tasks.filter(task => task.assignedTo === currentUser.id)
    : [];
    
  const filteredTasks = userTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const completedTasks = userTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = userTasks.filter(task => task.status === 'inProgress').length;
  const todoTasks = userTasks.filter(task => task.status === 'todo').length;
  const completionRate = userTasks.length > 0 
    ? Math.round((completedTasks / userTasks.length) * 100) 
    : 0;
  
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const newTasks = userTasks.filter(task => 
    new Date(task.createdAt) > last24Hours
  );
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingDeadlines = userTasks
    .filter(task => {
      const deadline = new Date(task.deadline);
      return deadline >= today && deadline <= nextWeek && task.status !== 'completed';
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoUpload = async () => {
    if (!selectedTaskId || !selectedFile || !currentUser) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }

    // Validate MongoDB ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(selectedTaskId)) {
      toast({
        title: 'Error',
        description: 'Invalid task ID format',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('caption', photoCaption || '');

      const response = await api.uploadPhoto(
        selectedTaskId,
        formData,
        token
      );

      if (response.data.success) {
        addTaskPhoto(selectedTaskId, response.data.data);
        toast({
          title: 'Success',
          description: 'Photo uploaded successfully'
        });

        // Reset form state
        setPhotoCaption('');
        setSelectedFile(null);
        setPhotoPreview(null);
        setIsPhotoDialogOpen(false);
        setSelectedTaskId(null);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload photo',
        variant: 'destructive'
      });
    }
  };
   


  const handleTaskPhotoUpload = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('uploadPhotos');
    navigate(`/user-dashboard?tab=upload&taskId=${taskId}`);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/user-dashboard${value === 'uploadPhotos' ? '?tab=upload' : ''}`);
  };

  if (!currentUser) return null;

  if (isAdmin) {
    return (
      <div className="flex h-screen bg-taskDark text-white overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Crown className="h-24 w-24 text-taskPurple animate-pulse" />
                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-taskPurple to-blue-400 text-transparent bg-clip-text">
              Welcome, Admin!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              You're logged in as an administrator. You have access to all administrative features 
              and management tools to oversee the entire system.
            </p>
            
            <Card className="bg-taskDark-light border-taskDark-lighter mb-8">
              <CardHeader>
                <CardTitle className="text-center text-xl">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  onClick={() => navigate('/admin-dashboard')} 
                  className="bg-taskPurple hover:bg-taskPurple-light text-lg py-6 px-6 flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Admin Dashboard
                </Button>
                
                <Button 
                  onClick={() => navigate('/users')} 
                  className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-6 flex items-center gap-2"
                >
                  <Users className="h-5 w-5" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
            
            <div className="text-center text-gray-400 mt-8 animate-fade-in" style={{animationDelay: "0.5s"}}>
              <p>From here, you can access all administrative functions.</p>
              <p>Check the sidebar for navigation options.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-taskDark text-white overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {showWelcomeNotification && newTasks.length > 0 && (
          <div className="absolute top-4 right-4 max-w-xs w-full bg-taskPurple rounded-lg p-4 shadow-lg animate-slide-in-right z-50">
            <div className="flex items-start">
              <Bell className="h-5 w-5 text-white mr-3 mt-0.5 animate-wiggle" />
              <div className="flex-1">
                <p className="font-medium">Welcome back, {currentUser.name}!</p>
                <p className="text-sm text-white/80 mt-1">
                  You have {newTasks.length} new task{newTasks.length !== 1 ? 's' : ''} assigned to you.
                </p>
              </div>
              <button 
                className="text-white/80 hover:text-white"
                onClick={() => setShowWelcomeNotification(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        <header className="px-6 py-4 bg-taskDark-light border-b border-taskDark-lighter animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Welcome, {currentUser.name}</h1>
              <p className="text-sm text-gray-400">Here's an overview of your tasks</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="task-input pl-8"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-taskDark-light border-b border-taskDark-lighter px-6 py-2">
            <TabsList className="grid grid-cols-2 max-w-md bg-taskDark-lighter">
              <TabsTrigger value="myTasks" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">
                My Tasks
              </TabsTrigger>
              <TabsTrigger value="uploadPhotos" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">
                Upload Photos
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="myTasks" className="flex-1 overflow-auto p-6">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
              <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">My Tasks</p>
                    <h3 className="text-2xl font-semibold">{userTasks.length}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-taskPurple/20 flex items-center justify-center">
                    <CheckCheck className="h-5 w-5 text-taskPurple" />
                  </div>
                </div>
              </div>
              
              <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">In Progress</p>
                    <h3 className="text-2xl font-semibold">{inProgressTasks}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <h3 className="text-2xl font-semibold">{completionRate}%</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="h-5 w-5 text-green-400">🏆</div>
                  </div>
                </div>
                <div className="w-full bg-taskDark-lighter rounded-full h-2 mt-2">
                  <div 
                    className="bg-taskPurple h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            </section>
            
            {upcomingDeadlines.length > 0 && (
              <section className="mb-8 animate-fade-in" style={{animationDelay: "0.1s"}}>
                <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
                <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-4">
                  <div className="space-y-3">
                    {upcomingDeadlines.map(task => {
                      const daysLeft = Math.ceil((new Date(task.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-taskDark rounded-lg hover:bg-taskDark-lighter transition-colors">
                          <div className="flex items-center">
                            <div className={`w-2 h-10 rounded-l-full mr-3 ${
                              daysLeft <= 1 ? 'bg-red-500' : daysLeft <= 3 ? 'bg-amber-500' : 'bg-taskPurple'
                            }`}></div>
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-xs text-gray-400">{task.shortDescription}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className={`text-xs px-2 py-1 rounded-full mr-3 ${
                              daysLeft <= 1 ? 'bg-red-500/20 text-red-400' : 
                              daysLeft <= 3 ? 'bg-amber-500/20 text-amber-400' : 
                              'bg-taskPurple/20 text-taskPurple'
                            }`}>
                              {daysLeft === 0 ? 'Due today' : 
                               daysLeft === 1 ? 'Due tomorrow' : 
                               `${daysLeft} days left`}
                            </div>
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
            
            <section className="animate-fade-in" style={{animationDelay: "0.2s"}}>
              <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
              
              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                      <EnhancedTaskCard 
                        task={task} 
                        showEditOptions={false}
                        onPhotoUpload={handleTaskPhotoUpload} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-taskDark-light rounded-lg border border-taskDark-lighter">
                  <p className="text-gray-400">No tasks found.</p>
                </div>
              )}
            </section>
          </TabsContent>
          
          <TabsContent value="uploadPhotos" className="flex-1 overflow-auto p-6">
            <section className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Upload Task Photos</h2>
              <p className="text-gray-400 mb-6">
                Upload photos of your completed or in-progress tasks to show your work.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-taskDark-light border-taskDark-lighter">
                  <CardHeader>
                    <CardTitle>Select a Task</CardTitle>
                    <CardDescription className="text-gray-400">
                      Choose which task you want to upload a photo for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userTasks.length > 0 ? (
                      userTasks.map(task => (
                        <div 
                          key={task.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTaskId === task.id 
                              ? 'border-taskPurple bg-taskPurple/10' 
                              : 'border-taskDark-lighter bg-taskDark hover:bg-taskDark-lighter'
                          }`}
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-gray-400">{task.shortDescription}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              task.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400' 
                                : task.status === 'inProgress'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-taskPurple/20 text-taskPurple'
                            }`}>
                              {task.status === 'inProgress' ? 'In Progress' : 
                               task.status === 'completed' ? 'Completed' : 'To Do'}
                            </div>
                          </div>
                          
                          {task.photos && task.photos.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400 flex items-center">
                              <FileImage className="h-3 w-3 mr-1" />
                              {task.photos.length} photo{task.photos.length !== 1 ? 's' : ''} uploaded
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-400">No tasks available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-taskDark-light border-taskDark-lighter">
                  <CardHeader>
                    <CardTitle>Upload Photo</CardTitle>
                    <CardDescription className="text-gray-400">
                      Share your progress with a photo of your work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="border-2 border-dashed border-taskDark-lighter rounded-lg p-6 text-center cursor-pointer hover:bg-taskDark-lighter/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <div className="relative">
                          <img 
                            src={photoPreview} 
                            alt="Selected file preview" 
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-taskDark-light p-1 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoPreview(null);
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="caption" className="text-sm text-gray-300 block mb-1">
                        Caption (optional)
                      </label>
                      <Input
                        id="caption"
                        placeholder="Brief description of your photo"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        className="task-input"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={() => setIsPhotoDialogOpen(true)}
                      disabled={!selectedTaskId || !photoPreview}
                      className="bg-taskPurple hover:bg-taskPurple-light"
                    >
                      Upload Photo
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {userTasks.some(task => task.photos && task.photos.length > 0) && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userTasks
                      .flatMap(task => task.photos || [])
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 8)
                      .map(photo => {
                        const relatedTask = tasks.find(t => t.id === photo.taskId);
                        return (
                          <div key={photo.id} className="bg-taskDark-light rounded-lg overflow-hidden border border-taskDark-lighter">
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={`http://localhost:5000${photo.imageUrl}`} 
                                alt={photo.caption || 'Task photo'} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-medium truncate">{relatedTask?.title || 'Unknown Task'}</p>
                              {photo.caption && <p className="text-xs text-gray-400 mt-1 truncate">{photo.caption}</p>}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(photo.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to upload this photo for your task?</p>
            {photoPreview && (
              <div className="mt-4 text-center">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-lg"
                />
                {photoCaption && <p className="mt-2 text-sm text-gray-400">{photoCaption}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPhotoDialogOpen(false)}
              className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePhotoUpload}
              className="bg-taskPurple hover:bg-taskPurple-light"
            >
              Confirm Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
