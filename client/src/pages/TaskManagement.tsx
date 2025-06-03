import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, TaskStatus, TaskPriority, TaskGroup } from '@/contexts/TaskContext';
import Sidebar from '@/components/Sidebar';
import TaskCard from '@/components/TaskCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, X, Bell, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

// Filter type that includes "All" but is separate from TaskGroup
type TaskFilter = TaskGroup | 'All';

const TaskManagement = () => {
  const { currentUser, isAdmin, allUsers = [] } = useAuth();
  const { tasks, addTask, deleteTask, updateTask } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<TaskFilter>('All');
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  
  // Hide welcome animation after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // New task state with proper typing
  const [newTask, setNewTask] = useState<{
    title: string;
    shortDescription: string;
    longDescription: string;
    deadline: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    group: TaskGroup;
  }>({
    title: '',
    shortDescription: '',
    longDescription: '',
    deadline: new Date().toISOString().split('T')[0],
    status: 'todo',
    priority: 'medium',
    assignedTo: currentUser?.id || '',
    group: 'Frontend',
  });

  // Update assignedTo when currentUser changes
  useEffect(() => {
    if (currentUser && !newTask.assignedTo) {
      setNewTask(prev => ({
        ...prev,
        assignedTo: currentUser.id
      }));
    }
  }, [currentUser]);

  const handleCreateTask = () => {
    if (!currentUser) return;
    
    // Make sure assignedTo is never empty
    const taskToAdd = {
      ...newTask,
      createdBy: currentUser.id,
      assignedTo: newTask.assignedTo || currentUser.id, // Default to current user if empty
    };
    
    addTask(taskToAdd);
    
    setNewTask({
      title: '',
      shortDescription: '',
      longDescription: '',
      deadline: new Date().toISOString().split('T')[0],
      status: 'todo',
      priority: 'medium',
      assignedTo: currentUser.id,
      group: 'Frontend',
    });
    
    setIsTaskDialogOpen(false);
    toast({
      title: "Task created",
      description: "Your task has been successfully created.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task deleted",
      description: "The task has been successfully deleted.",
    });
  };

  // Get task counts by user
  const userTasksCount: {[key: string]: number} = {};
  tasks.forEach(task => {
    if (!userTasksCount[task.assignedTo]) {
      userTasksCount[task.assignedTo] = 0;
    }
    userTasksCount[task.assignedTo]++;
  });

  // Get tasks by group
  const getTasksByGroup = (group: TaskFilter) => {
    if (group === 'All') {
      return filteredTasks.filter(task => selectedUser ? task.assignedTo === selectedUser : true);
    }
    return filteredTasks.filter(task => 
      task.group === group && (selectedUser ? task.assignedTo === selectedUser : true)
    );
  };

  // Get user name by ID
  const getUserNameById = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="flex h-screen bg-taskDark text-white overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {showWelcomeAnimation && (
          <div className="absolute inset-0 bg-taskDark-light z-50 flex items-center justify-center animate-fade-out">
            <div className="text-center">
              <Heart className="h-16 w-16 text-taskPurple mx-auto animate-pulse" />
              <h2 className="text-2xl font-bold mt-4 animate-fade-in">Welcome, {currentUser?.name || 'Admin'}!</h2>
            </div>
          </div>
        )}
        
        <header className="px-6 py-4 bg-taskDark-light border-b border-taskDark-lighter animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Task Management</h1>
              <p className="text-sm text-gray-400">Hello, {currentUser?.name || 'Admin'}</p>
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
              
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
              >
                <SelectTrigger className="w-40 bg-taskDark-lighter border-taskDark-light">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                  <SelectItem value="">All Users</SelectItem>
                  {Array.isArray(allUsers) && allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.id === currentUser?.id ? '(You)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isAdmin && (
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-taskPurple hover:bg-taskPurple-light transition-all transform hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Fill in the details to create a new task.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-1">
                        <label htmlFor="title" className="text-sm text-gray-300">Title</label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          placeholder="Task title"
                          className="task-input"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="shortDescription" className="text-sm text-gray-300">Short Description</label>
                        <Input
                          id="shortDescription"
                          value={newTask.shortDescription}
                          onChange={(e) => setNewTask({...newTask, shortDescription: e.target.value})}
                          placeholder="Brief description"
                          className="task-input"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label htmlFor="longDescription" className="text-sm text-gray-300">Long Description</label>
                        <Textarea
                          id="longDescription"
                          value={newTask.longDescription}
                          onChange={(e) => setNewTask({...newTask, longDescription: e.target.value})}
                          placeholder="Detailed description"
                          className="task-input min-h-24"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="deadline" className="text-sm text-gray-300">Deadline</label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newTask.deadline}
                            onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                            className="task-input"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label htmlFor="priority" className="text-sm text-gray-300">Priority</label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: TaskPriority) => setNewTask({...newTask, priority: value})}
                          >
                            <SelectTrigger id="priority" className="task-input">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="assignedTo" className="text-sm text-gray-300">Assign To</label>
                          <Select
                            value={newTask.assignedTo}
                            onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                          >
                            <SelectTrigger id="assignedTo" className="task-input">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                              {allUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} {user.id === currentUser?.id ? '(You)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-1">
                          <label htmlFor="group" className="text-sm text-gray-300">Task Group</label>
                          <Select
                            value={newTask.group}
                            onValueChange={(value: TaskGroup) => setNewTask({...newTask, group: value})}
                          >
                            <SelectTrigger id="group" className="task-input">
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                              <SelectItem value="Frontend">Frontend</SelectItem>
                              <SelectItem value="Backend">Backend</SelectItem>
                              <SelectItem value="Database">Database</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask} className="bg-taskPurple hover:bg-taskPurple-light">
                        Create Task
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:transform hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tasks</p>
                  <h3 className="text-2xl font-semibold">{tasks.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-taskPurple/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-taskPurple" />
                </div>
              </div>
            </div>
          </section>
          
          <section className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-6 mb-8 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Tasks by User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`bg-taskDark rounded-lg p-4 border ${user.id === currentUser?.id ? 'border-taskPurple/50' : 'border-taskDark-lighter'} hover:shadow-md hover:transform hover:translate-y-[-4px] transition-all duration-300`}
                  onClick={() => setSelectedUser(selectedUser === user.id ? '' : user.id)}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-2 ${
                      user.id === currentUser?.id ? 'bg-taskPurple' : 'bg-blue-500'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium">
                      {user.name} {user.id === currentUser?.id && <span className="text-xs text-taskPurple">(You)</span>}
                    </p>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Assigned tasks:</span>
                      <span className="font-medium">{userTasksCount[user.id] || 0}</span>
                    </div>
                    <div className="w-full bg-taskDark-lighter rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${user.id === currentUser?.id ? 'bg-taskPurple' : 'bg-blue-500'}`}
                        style={{ width: `${userTasksCount[user.id] ? (userTasksCount[user.id] / tasks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {allUsers.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-400">
                  <p>No users found. Please create some users first.</p>
                </div>
              )}
            </div>
          </section>
          
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-semibold mb-4">Tasks by Group</h2>
            
            <Tabs defaultValue="All" onValueChange={(value) => setSelectedGroup(value as TaskFilter)}>
              <TabsList className="grid grid-cols-4 max-w-md bg-taskDark-lighter mb-6">
                <TabsTrigger value="All" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">All Tasks</TabsTrigger>
                <TabsTrigger value="Frontend" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">Frontend</TabsTrigger>
                <TabsTrigger value="Backend" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">Backend</TabsTrigger>
                <TabsTrigger value="Database" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">Database</TabsTrigger>
              </TabsList>
            
              {["All", "Frontend", "Backend", "Database"].map((group) => (
                <TabsContent key={group} value={group} className="mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getTasksByGroup(group as TaskFilter).map(task => (
                      <HoverCard key={task.id}>
                        <HoverCardTrigger asChild>
                          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:z-10 focus:outline-none focus:ring-2 focus:ring-taskPurple">
                            <TaskCard 
                              task={{
                                ...task,
                                assignedTo: getUserNameById(task.assignedTo)
                              }} 
                              onDelete={() => handleDeleteTask(task.id)} 
                              showEditOptions={true}
                            />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                            <p className="text-sm text-gray-300 mb-4">{task.longDescription}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>Created by: {getUserNameById(task.createdBy)}</span>
                              <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                    {getTasksByGroup(group as TaskFilter).length === 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-gray-400">No tasks found in this group.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TaskManagement;
