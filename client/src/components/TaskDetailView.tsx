
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Task, useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Eye, 
  MessageSquare, 
  Image as ImageIcon,
  Info,
  CalendarCheck,
  ArrowLeft,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import EditTaskForm from './EditTaskForm';
import TaskComments from './TaskComments';
import TaskPhotoGallery from './TaskPhotoGallery';
import { toast } from '@/components/ui/use-toast';

interface TaskDetailViewProps {
  taskId: string;
  onBack?: () => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ taskId, onBack, onDelete }) => {
  const { tasks, getAssignedToName, getCreatedByName, updateTaskStatus } = useTask();
  const { currentUser, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return (
      <Card className="w-full border-red-300 dark:border-red-700 dark:bg-gray-800 animate-fade-in">
        <CardContent className="pt-6">
          <div className="text-center">
            <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-500">Task Not Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The task you're looking for doesn't exist or has been deleted.</p>
            
            {onBack && (
              <Button onClick={onBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Function to determine if the current user can edit this task
  const canEditTask = () => {
    if (!currentUser) return false;
    return isAdmin || task.assignedTo === currentUser.id;
  };
  
  // Function to format the date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };
  
  // Function to check if a task is overdue
  const isOverdue = () => {
    if (task.status === 'completed') return false;
    const deadline = new Date(task.deadline);
    const today = new Date();
    return deadline < today;
  };
  
  const handleUpdateStatus = (status: 'todo' | 'inProgress' | 'completed') => {
    updateTaskStatus(taskId, status);
    
    toast({
      title: "Status updated",
      description: `Task status changed to ${status === 'inProgress' ? 'In Progress' : status === 'completed' ? 'Completed' : 'To Do'}`,
    });
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(taskId);
    }
  };
  
  if (isEditing) {
    return (
      <EditTaskForm 
        taskId={taskId} 
        onCancel={() => setIsEditing(false)} 
        onSave={() => setIsEditing(false)}
      />
    );
  }
  
  const getStatusBadgeClass = () => {
    switch(task.status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'inProgress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const getPriorityBadgeClass = () => {
    switch(task.priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="w-full dark:bg-gray-800">
        <CardHeader className={`pb-3 ${task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : isOverdue() ? 'bg-red-50 dark:bg-red-900/20' : 'bg-taskDark-lighter/30 dark:bg-gray-700/50'} rounded-t-lg`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center">
                {onBack && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack} 
                    className="mr-2 h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
              </div>
              <CardDescription className="mt-1 text-sm">
                Task #{task.id.substr(0, 6)}
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <div className="flex space-x-2">
                <Badge variant="outline" className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass()}`}>
                  {task.status === 'inProgress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'To Do'}
                </Badge>
                <Badge variant="outline" className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass()}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              </div>
              
              {task.group && (
                <Badge variant="outline" className="bg-taskDark-lighter/30 dark:bg-gray-700/50 border-none">
                  {task.group}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details" className="text-xs">
                <Info className="h-3.5 w-3.5 mr-1.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="photos" className="text-xs">
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Photos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <div className="p-4 bg-taskDark-lighter/30 dark:bg-gray-700/30 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{task.longDescription || "No detailed description provided."}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Task Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                          Deadline
                        </span>
                        <span className={`font-medium ${isOverdue() ? 'text-red-500' : ''}`}>
                          {formatDate(task.deadline)}
                          {isOverdue() && ' (Overdue)'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Assigned to</span>
                        <span className="font-medium">{getAssignedToName(task.assignedTo)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Created by</span>
                        <span className="font-medium">{getCreatedByName(task.createdBy)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
                          Created on
                        </span>
                        <span>{formatDate(task.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {task.lastUpdated && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Last Update</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Date</span>
                          <span>{formatDate(task.lastUpdated)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Updated by</span>
                          <span>{task.lastUpdatedBy ? getCreatedByName(task.lastUpdatedBy) : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-0">
              <TaskComments taskId={taskId} />
            </TabsContent>
            
            <TabsContent value="photos" className="mt-0">
              <TaskPhotoGallery taskId={taskId} />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pt-2 justify-between border-t border-gray-100 dark:border-gray-700 mt-2">
          {canEditTask() && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit Task
              </Button>
              
              {task.status !== 'completed' && (
                <Button 
                  variant="success" 
                  onClick={() => handleUpdateStatus('completed')}
                  className="text-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Mark Complete
                </Button>
              )}
              
              {onDelete && isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="p-6 text-center">
                      <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">Delete Task</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete this task? This action cannot be undone.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Delete Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
          
          {task.status !== 'completed' && task.status !== 'inProgress' && canEditTask() && (
            <Button 
              variant="outline" 
              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
              onClick={() => handleUpdateStatus('inProgress')}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              Start Working
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskDetailView;
