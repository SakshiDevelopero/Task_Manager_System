import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, TaskStatus } from '@/contexts/TaskContext';
import Sidebar from '@/components/Sidebar';
import TaskCard from '@/components/TaskCard';
import { CalendarRange, CheckCheck, ClipboardList, Clock, Filter, LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const MyTasks = () => {
  const { currentUser } = useAuth();
  const { tasks, updateTaskStatus } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  if (!currentUser) return null;
  
  // Get tasks assigned to current user
  const myTasks = tasks.filter(task => task.assignedTo === currentUser.id);
  
  // Filter tasks based on search query
  const filteredTasks = myTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    inProgress: filteredTasks.filter(task => task.status === 'inProgress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };
  
  // Filter tasks by group
  const getTasksByGroup = (group: string) => {
    if (group === 'All') return filteredTasks;
    return filteredTasks.filter(task => task.group === group);
  };
  
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    toast({
      title: "Status updated",
      description: `Task status changed to ${newStatus}`,
    });
  };

  return (
    <div className="flex h-screen bg-taskDark text-white overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-4 bg-taskDark-light border-b border-taskDark-lighter animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">My Tasks</h1>
            
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
                value={selectedGroup}
                onValueChange={setSelectedGroup}
              >
                <SelectTrigger className="w-40 bg-taskDark-lighter border-taskDark-light">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                  <SelectItem value="All">All Groups</SelectItem>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex bg-taskDark-lighter rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-taskPurple' : ''}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-taskPurple' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:transform hover:translate-y-[-4px] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tasks</p>
                  <h3 className="text-2xl font-semibold">{myTasks.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:transform hover:translate-y-[-4px] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <h3 className="text-2xl font-semibold">{tasksByStatus.inProgress.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:transform hover:translate-y-[-4px] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <h3 className="text-2xl font-semibold">{tasksByStatus.completed.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCheck className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
          </section>
          
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold mb-4">Tasks by Status</h2>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-4 max-w-md bg-taskDark-lighter">
                <TabsTrigger value="all" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">All Tasks</TabsTrigger>
                <TabsTrigger value="todo" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">To Do</TabsTrigger>
                <TabsTrigger value="inProgress" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">In Progress</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-taskPurple data-[state=active]:text-white">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                  {getTasksByGroup(selectedGroup).map(task => (
                    <HoverCard key={task.id}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:z-10 focus-within:blur-none group">
                          <TaskCard task={task} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                          <p className="text-sm text-gray-300 mb-4">{task.longDescription}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            <Select
                              value={task.status}
                              onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs bg-taskDark border-taskDark-lighter w-32">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="inProgress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {getTasksByGroup(selectedGroup).length === 0 && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-400">No tasks found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {Object.entries(tasksByStatus).map(([status, tasksForStatus]) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                    {tasksForStatus
                      .filter(task => selectedGroup === 'All' || task.group === selectedGroup)
                      .map(task => (
                        <HoverCard key={task.id}>
                          <HoverCardTrigger asChild>
                            <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:z-10 focus-within:blur-none">
                              <TaskCard task={task} />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                            <div className="p-4">
                              <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                              <p className="text-sm text-gray-300 mb-4">{task.longDescription}</p>
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                <Select
                                  value={task.status}
                                  onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                                >
                                  <SelectTrigger className="h-7 text-xs bg-taskDark border-taskDark-lighter w-32">
                                    <SelectValue placeholder="Update status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="inProgress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                    ))}
                    {tasksForStatus.filter(task => selectedGroup === 'All' || task.group === selectedGroup).length === 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-gray-400">No {status} tasks found.</p>
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

export default MyTasks;
