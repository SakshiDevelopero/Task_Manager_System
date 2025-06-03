
import React, { useState } from 'react';
import { Task, useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, Clock, Edit, Trash2, CheckCircle, Circle, AlertCircle, Save, Camera, MessageCircle } from 'lucide-react';
import EditTaskForm from './EditTaskForm';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedTaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  showEditOptions?: boolean;
  onPhotoUpload?: (taskId: string) => void;
}

const EnhancedTaskCard: React.FC<EnhancedTaskCardProps> = ({ 
  task, 
  onDelete, 
  showEditOptions = false,
  onPhotoUpload
}) => {
  const { updateTaskStatus, getAssignedToName, getCreatedByName, getTaskComments } = useTask();
  const { currentUser, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Function to determine if the current user can edit this task
  const canEditTask = () => {
    if (!currentUser) return false;
    return isAdmin || task.assignedTo === currentUser.id;
  };

  // Function to format the date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to check if a task is overdue
  const isOverdue = () => {
    if (task.status === 'completed') return false;
    const deadline = new Date(task.deadline);
    const today = new Date();
    return deadline < today;
  };

  // Function to generate status badge class
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

  // Function to generate priority badge class
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

  // Function to get status icon
  const getStatusIcon = () => {
    switch(task.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inProgress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const comments = getTaskComments(task.id);

  if (isEditing) {
    return (
      <EditTaskForm 
        taskId={task.id} 
        onCancel={() => setIsEditing(false)} 
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className={`max-w-md w-full border ${isOverdue() ? 'border-red-300 dark:border-red-700' : 'border-taskDark-lighter'} hover:shadow-md transition-all dark:bg-gray-800 animate-fade-in`}>
      <CardHeader className={`pb-2 ${task.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : isOverdue() ? 'bg-red-50 dark:bg-red-900/20' : 'bg-taskDark-lighter/30 dark:bg-gray-700/50'} rounded-t-lg`}>
        <CardTitle className="text-md font-semibold flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">{task.title}</span>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass()}`}>
              {task.status === 'inProgress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'To Do'}
            </Badge>
            <Badge variant="outline" className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass()}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{task.shortDescription}</p>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="font-medium mr-1">Assigned to:</span>
          </div>
          <div className="text-right">{getAssignedToName(task.assignedTo)}</div>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className="font-medium">Deadline:</span>
          </div>
          <div className={`text-right ${isOverdue() ? 'text-red-500 font-medium' : ''}`}>
            {formatDate(task.deadline)}
            {isOverdue() && ' (Overdue)'}
          </div>
          
          {task.group && (
            <>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="font-medium">Group:</span>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-taskDark-lighter/30 dark:bg-gray-700/50 border-none">
                  {task.group}
                </Badge>
              </div>
            </>
          )}
          
          {task.lastUpdated && (
            <>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="font-medium">Last updated:</span>
              </div>
              <div className="text-right">{formatDate(task.lastUpdated)}</div>
              
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <span className="font-medium">Updated by:</span>
              </div>
              <div className="text-right">
                {task.lastUpdatedBy ? getCreatedByName(task.lastUpdatedBy) : 'Unknown'}
              </div>
            </>
          )}
          
          {comments.length > 0 && (
            <>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="font-medium">Comments:</span>
              </div>
              <div className="text-right mt-1">{comments.length}</div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 justify-between border-t border-gray-100 dark:border-gray-700 mt-2">
        {canEditTask() && showEditOptions && (
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="text-xs"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit task details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(task.id)}
                      className="text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        
        {canEditTask() && onPhotoUpload && !showEditOptions && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onPhotoUpload(task.id)}
                  className="text-xs"
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  Upload Photo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a photo to this task</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {!showEditOptions && canEditTask() && task.status !== 'completed' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={() => updateTaskStatus(task.id, 'completed')}
                  className="text-xs"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Mark Complete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark this task as completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created by: {getCreatedByName(task.createdBy)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedTaskCard;
