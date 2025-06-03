import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskGroup, useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCheck, Clock, Edit, Trash2, Image, Camera, Save } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface TaskCardProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  showEditOptions?: boolean;
  onPhotoUpload?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onDelete, 
  showEditOptions = false,
  onPhotoUpload
}) => {
  const { updateTask, updateTaskStatus, getTaskPhotos } = useTask();
  const { isAdmin, currentUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPhotosDialogOpen, setIsPhotosDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isEditing, setIsEditing] = useState(false);
  
  const taskPhotos = getTaskPhotos(task.id) || [];
  const canEdit = isAdmin || (currentUser && currentUser.id === task.assignedTo);
  
  const handleStatusChange = (status: TaskStatus) => {
    updateTaskStatus(task.id, status);
    toast({
      title: "Status updated",
      description: `Task status changed to ${status}`,
    });
  };
  
  const handleSaveEdit = () => {
    updateTask(task.id, editedTask);
    setIsEditDialogOpen(false);
    setIsEditing(false);
    toast({
      title: "Task updated",
      description: "The task has been successfully updated.",
    });
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handlePhotoUploadClick = () => {
    if (onPhotoUpload) {
      onPhotoUpload(task.id);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      updateTask(task.id, editedTask);
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    }
    setIsEditing(!isEditing);
  };
  
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'inProgress':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-taskPurple/20 text-taskPurple';
    }
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };
  
  const getGroupColor = () => {
    switch (task.group) {
      case 'Frontend':
        return 'bg-indigo-500/20 text-indigo-400';
      case 'Backend':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Database':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-taskPurple/20 text-taskPurple';
    }
  };

  return (
    <div className="p-4 rounded-lg bg-taskDark-light border border-taskDark-lighter hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {showEditOptions && isAdmin && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleEdit}
                className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-taskDark-lighter"
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {!isAdmin && currentUser && task.assignedTo === currentUser.id && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePhotoUploadClick}
              className="h-8 w-8 rounded-full text-gray-400 hover:text-taskPurple hover:bg-taskPurple/10"
              title="Upload photo"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
          
          {taskPhotos.length > 0 && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsPhotosDialogOpen(true)}
              className="h-8 w-8 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
              title="View photos"
            >
              <Image className="h-4 w-4" />
              {taskPhotos.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-taskPurple text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {taskPhotos.length}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="mb-4">
          <Input
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            className="task-input mb-2"
            placeholder="Task title"
          />
          <Textarea
            value={editedTask.shortDescription}
            onChange={(e) => setEditedTask({...editedTask, shortDescription: e.target.value})}
            className="task-input"
            placeholder="Short description"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              onClick={toggleEdit}
              className="bg-taskPurple hover:bg-taskPurple-light"
            >
              <Save className="h-4 w-4 mr-1" /> Save Update
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 text-sm mb-4">{task.shortDescription}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {task.status === 'todo' ? 'To Do' : task.status === 'inProgress' ? 'In Progress' : 'Completed'}
        </span>
        
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor()}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </span>
        
        {task.group && (
          <span className={`text-xs px-2 py-1 rounded-full ${getGroupColor()}`}>
            {task.group}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
        </div>
        
        {canEdit && !isAdmin && (
          <Select
            value={task.status}
            onValueChange={(value: TaskStatus) => handleStatusChange(value)}
          >
            <SelectTrigger className="h-7 text-xs bg-taskDark border-taskDark-lighter w-28">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent className="bg-taskDark-lighter border-taskDark-light">
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inProgress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      {taskPhotos.length > 0 && (
        <div 
          className="mt-3 pt-3 border-t border-taskDark-lighter cursor-pointer"
          onClick={() => setIsPhotosDialogOpen(true)}
        >
          <div className="flex items-center">
            <Image className="h-3 w-3 mr-1 text-gray-400" />
            <span className="text-xs text-gray-400">{taskPhotos.length} photo{taskPhotos.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {taskPhotos.slice(0, 3).map(photo => (
              <img 
                key={photo.id} 
                src={photo.imageUrl} 
                alt={photo.caption || 'Task photo'} 
                className="h-14 w-14 object-cover rounded-md" 
              />
            ))}
            {taskPhotos.length > 3 && (
              <div className="h-14 w-14 bg-taskDark-lighter rounded-md flex items-center justify-center text-gray-400 text-xs">
                +{taskPhotos.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white animate-scale-in">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Make changes to the task details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <label htmlFor="edit-title" className="text-sm text-gray-300">Title</label>
              <Input
                id="edit-title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                className="task-input"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="edit-shortDescription" className="text-sm text-gray-300">Short Description</label>
              <Input
                id="edit-shortDescription"
                value={editedTask.shortDescription}
                onChange={(e) => setEditedTask({...editedTask, shortDescription: e.target.value})}
                className="task-input"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="edit-longDescription" className="text-sm text-gray-300">Long Description</label>
              <Textarea
                id="edit-longDescription"
                value={editedTask.longDescription}
                onChange={(e) => setEditedTask({...editedTask, longDescription: e.target.value})}
                className="task-input min-h-24"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-deadline" className="text-sm text-gray-300">Deadline</label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) => setEditedTask({...editedTask, deadline: e.target.value})}
                  className="task-input"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="edit-priority" className="text-sm text-gray-300">Priority</label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value: TaskPriority) => setEditedTask({...editedTask, priority: value})}
                >
                  <SelectTrigger id="edit-priority" className="task-input">
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
                <label htmlFor="edit-status" className="text-sm text-gray-300">Status</label>
                <Select
                  value={editedTask.status}
                  onValueChange={(value: TaskStatus) => setEditedTask({...editedTask, status: value})}
                >
                  <SelectTrigger id="edit-status" className="task-input">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="edit-group" className="text-sm text-gray-300">Group</label>
                <Select
                  value={editedTask.group || 'Frontend'}
                  onValueChange={(value: TaskGroup) => setEditedTask({...editedTask, group: value})}
                >
                  <SelectTrigger id="edit-group" className="task-input">
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
            
            <div className="space-y-1">
              <label htmlFor="edit-assignedTo" className="text-sm text-gray-300">Assigned To</label>
              <Select
                value={editedTask.assignedTo}
                onValueChange={(value) => setEditedTask({...editedTask, assignedTo: value})}
              >
                <SelectTrigger id="edit-assignedTo" className="task-input">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                  <SelectItem value="2">Regular User</SelectItem>
                  <SelectItem value="3">John Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-taskPurple hover:bg-taskPurple-light">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white animate-scale-in">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPhotosDialogOpen} onOpenChange={setIsPhotosDialogOpen}>
        <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Task Photos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Photos uploaded for "{task.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {taskPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {taskPhotos.map(photo => (
                  <div key={photo.id} className="bg-taskDark-lighter rounded-lg overflow-hidden">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.caption || 'Task photo'} 
                      className="w-full aspect-square object-cover" 
                    />
                    <div className="p-2">
                      {photo.caption && (
                        <p className="text-sm text-gray-300">{photo.caption}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(photo.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">No photos have been uploaded for this task.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPhotosDialogOpen(false)} className="bg-taskPurple hover:bg-taskPurple-light">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskCard;
