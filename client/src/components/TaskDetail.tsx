
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Task, 
  TaskStatus, 
  useTask, 
  TaskComment 
} from '@/contexts/TaskContext';
import { 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Send,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const { tasks, addTaskComment, deleteTaskComment, updateTaskStatus, getTaskComments } = useTask();
  const { currentUser, allUsers } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [viewingComments, setViewingComments] = useState(false);
  
  if (!currentUser) return null;
  
  const comments = getTaskComments(task.id);
  
  // Find dependent tasks
  const dependentTasks = task.dependsOn 
    ? tasks.filter(t => task.dependsOn?.includes(t.id))
    : [];
    
  // Get user name by ID
  const getUserNameById = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addTaskComment(task.id, newComment);
    setNewComment('');
    toast({
      title: "Comment added",
      description: "Your comment has been added to the task.",
    });
  };
  
  const handleStatusChange = (newStatus: TaskStatus) => {
    // Check for dependencies
    if (newStatus === 'inProgress' && task.dependsOn && task.dependsOn.length > 0) {
      const unfinishedDependencies = dependentTasks.filter(t => t.status !== 'completed');
      
      if (unfinishedDependencies.length > 0) {
        toast({
          title: "Warning",
          description: "This task depends on other tasks that are not yet completed!",
          variant: "destructive"
        });
      }
    }
    
    updateTaskStatus(task.id, newStatus);
    toast({
      title: "Status updated",
      description: `Task status updated to ${newStatus}`,
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'inProgress': return 'bg-amber-500 text-white';
      case 'todo': return 'bg-taskPurple text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <p className="text-gray-400">{task.shortDescription}</p>
        </div>
        <div className="flex space-x-2">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Badge>
          <Badge className={getStatusColor(task.status)}>
            {task.status === 'inProgress' ? 'In Progress' : 
             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-taskDark rounded-lg p-4 border border-taskDark-lighter">
          <h3 className="text-sm font-medium mb-2 text-gray-300">Task Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Assigned to:</span>
              <span className="font-medium">{getUserNameById(task.assignedTo)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Created by:</span>
              <span className="font-medium">{getUserNameById(task.createdBy)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Created on:</span>
              <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Deadline:</span>
              <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Group:</span>
              <span className="font-medium">{task.group}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-taskDark rounded-lg p-4 border border-taskDark-lighter">
          <h3 className="text-sm font-medium mb-2 text-gray-300">Description</h3>
          <p className="text-sm text-gray-300">{task.longDescription}</p>
          
          {dependentTasks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-gray-300">Dependencies</h3>
              <div className="space-y-2">
                {dependentTasks.map(depTask => (
                  <div 
                    key={depTask.id} 
                    className="text-sm flex items-center p-2 rounded-md bg-taskDark-lighter"
                  >
                    <LinkIcon className="w-3 h-3 mr-2 text-gray-400" />
                    <span>{depTask.title}</span>
                    <Badge 
                      className={`ml-auto ${
                        depTask.status === 'completed' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {depTask.status === 'completed' ? 'Completed' : 'Not Completed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        {viewingComments ? (
          <div className="border border-taskDark-lighter rounded-lg bg-taskDark animate-scale-in">
            <div className="flex justify-between items-center p-3 border-b border-taskDark-lighter">
              <h3 className="font-medium">Comments ({comments.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewingComments(false)}>
                Close
              </Button>
            </div>
            
            <ScrollArea className="h-48 p-3">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: TaskComment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-taskPurple text-xs">
                          {comment.createdByName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{comment.createdByName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center text-sm py-8">No comments yet</p>
              )}
            </ScrollArea>
            
            <form onSubmit={handleCommentSubmit} className="p-3 border-t border-taskDark-lighter">
              <div className="flex space-x-2">
                <Input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-taskDark-lighter border-taskDark-light"
                />
                <Button type="submit" size="sm" className="bg-taskPurple hover:bg-taskPurple-light">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewingComments(true)}
                className="flex items-center space-x-1 border-taskDark-lighter text-gray-300"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Comments ({comments.length})
              </Button>
            </div>
            
            <div className="flex space-x-2">
              {task.status !== 'todo' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('todo')}
                  className="border-taskDark-lighter bg-taskDark-lighter text-gray-300"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  To Do
                </Button>
              )}
              
              {task.status !== 'inProgress' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('inProgress')}
                  className="border-amber-500/20 bg-amber-500/10 text-amber-300"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  In Progress
                </Button>
              )}
              
              {task.status !== 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('completed')}
                  className="border-green-500/20 bg-green-500/10 text-green-300"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
