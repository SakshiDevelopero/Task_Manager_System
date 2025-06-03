
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask, TaskStatus, TaskPriority, TaskGroup } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, Clock, Save, X, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface EditTaskFormProps {
  taskId: string;
  onCancel: () => void;
  onSave: () => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ taskId, onCancel, onSave }) => {
  const { currentUser, allUsers } = useAuth();
  const { tasks, updateTask } = useTask();
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return (
      <Card className="bg-red-100 dark:bg-red-900 animate-scale-in">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Task not found!</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onCancel} variant="outline">Close</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    shortDescription: task.shortDescription,
    longDescription: task.longDescription,
    deadline: task.deadline.split('T')[0],
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo,
    group: task.group || 'Frontend' as TaskGroup,
  });

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    task.deadline ? new Date(task.deadline) : undefined
  );

  // Update the deadline when the calendar date changes
  useEffect(() => {
    if (calendarDate) {
      setEditedTask(prev => ({
        ...prev,
        deadline: format(calendarDate, 'yyyy-MM-dd')
      }));
    }
  }, [calendarDate]);

  const handleSave = () => {
    // Validate form
    if (!editedTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    updateTask(taskId, {
      ...editedTask,
      deadline: new Date(editedTask.deadline).toISOString(),
    });
    
    toast({
      title: "Task updated",
      description: "Your task has been successfully updated.",
    });
    
    onSave();
  };

  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <Card className="w-full border-taskPurple/30 dark:bg-gray-800 animate-scale-in">
      <CardHeader className="bg-taskDark-lighter dark:bg-gray-700 rounded-t-lg">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Edit Task</span>
          <Badge variant="outline" className="text-xs px-2 py-1 bg-taskPurple/20 text-taskPurple border-taskPurple/30">
            Created by: {getUserName(task.createdBy)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <Input
            id="title"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            className="task-input"
            placeholder="Enter task title"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="shortDescription" className="text-sm font-medium">Short Description</label>
          <Input
            id="shortDescription"
            value={editedTask.shortDescription}
            onChange={(e) => setEditedTask({...editedTask, shortDescription: e.target.value})}
            className="task-input"
            placeholder="Brief description"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="longDescription" className="text-sm font-medium">Long Description</label>
          <Textarea
            id="longDescription"
            value={editedTask.longDescription}
            onChange={(e) => setEditedTask({...editedTask, longDescription: e.target.value})}
            className="task-input min-h-24"
            placeholder="Detailed description of the task"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-taskPurple" />
              Deadline
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal task-input"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {calendarDate ? format(calendarDate, 'PPP') : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={setCalendarDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">Priority</label>
            <Select
              value={editedTask.priority}
              onValueChange={(value: TaskPriority) => setEditedTask({...editedTask, priority: value})}
            >
              <SelectTrigger id="priority" className="task-input">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-taskDark-lighter dark:bg-gray-700 border-taskDark-light">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <Select
              value={editedTask.status}
              onValueChange={(value: TaskStatus) => setEditedTask({...editedTask, status: value})}
            >
              <SelectTrigger id="status" className="task-input">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-taskDark-lighter dark:bg-gray-700 border-taskDark-light">
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="group" className="text-sm font-medium">Task Group</label>
            <Select
              value={editedTask.group}
              onValueChange={(value: TaskGroup) => setEditedTask({...editedTask, group: value})}
            >
              <SelectTrigger id="group" className="task-input">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent className="bg-taskDark-lighter dark:bg-gray-700 border-taskDark-light">
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Database">Database</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
          <Select
            value={editedTask.assignedTo}
            onValueChange={(value) => setEditedTask({...editedTask, assignedTo: value})}
          >
            <SelectTrigger id="assignedTo" className="task-input">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent className="bg-taskDark-lighter dark:bg-gray-700 border-taskDark-light max-h-60">
              {allUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} {user.id === currentUser?.id ? '(You)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-taskDark-lighter/50 dark:bg-gray-700/50 rounded-b-lg">
        <Button onClick={onCancel} variant="outline" className="mr-2">
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button onClick={handleSave} variant="success" className="ml-auto">
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditTaskForm;
