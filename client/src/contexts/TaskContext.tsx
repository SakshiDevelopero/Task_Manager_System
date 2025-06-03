import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';

// Task types
export type TaskStatus = 'todo' | 'inProgress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskGroup = 'Frontend' | 'Backend' | 'Database';

export interface TaskPhoto {
  id: string;
  taskId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  createdBy: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  text: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface Task {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  createdBy: string; // User ID (admin)
  createdAt: string;
  group?: TaskGroup; // Optional for backwards compatibility
  photos: TaskPhoto[];
  dependsOn?: string[]; // IDs of tasks this task depends on
  comments: TaskComment[]; // Comments on this task
  lastUpdated?: string; // When the task was last updated
  lastUpdatedBy?: string; // Who last updated the task
}

interface TaskContextType {
  tasks: Task[];
  getUserTasks: (userId: string) => Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'photos' | 'comments'>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  addTaskPhoto: (taskId: string, photoData: { imageUrl: string, caption?: string }) => void;
  deleteTaskPhoto: (taskId: string, photoId: string) => void;
  getTaskPhotos: (taskId: string) => TaskPhoto[];
  addTaskComment: (taskId: string, text: string) => void;
  deleteTaskComment: (taskId: string, commentId: string) => void;
  getTaskComments: (taskId: string) => TaskComment[];
  getAssignedToName: (userId: string) => string;
  getCreatedByName: (userId: string) => string;
  getTasksByStatus: () => Record<TaskStatus, number>;
  getTasksByPriority: () => Record<TaskPriority, number>;
  getTasksByGroup: () => Record<TaskGroup, number>;
  getRecentTasks: (limit?: number, sortBy?: 'updated' | 'created') => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingDeadlines: (days?: number) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from backend on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.getTasks();
        setTasks(
          response.data.data.map((task: any) => ({
            ...task,
            id: task._id,
            assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo,
            createdBy: typeof task.createdBy === 'object' ? task.createdBy._id : task.createdBy,
            photos: task.photos || [],
            comments: task.comments || [],
          }))
        );
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Add a new task (calls backend)
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'photos' | 'comments'>) => {
    try {
      const response = await api.createTask(task);
      const newTask = response.data.data;
      setTasks(prev => [
        ...prev,
        {
          ...newTask,
          id: newTask._id,
          photos: newTask.photos || [],
          comments: newTask.comments || [],
        },
      ]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Helper functions to get user names
  const getAssignedToName = (userId: string): string => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  const getCreatedByName = (userId: string): string => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  // Get tasks for a specific user
  const getUserTasks = (userId: string): Task[] => {
    return tasks.filter(task => task.assignedTo === userId);
  };

  // Get tasks by status for charts
  const getTasksByStatus = (): Record<TaskStatus, number> => {
    return {
      todo: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'inProgress').length,
      completed: tasks.filter(task => task.status === 'completed').length
    };
  };

  // Get tasks by priority for charts
  const getTasksByPriority = (): Record<TaskPriority, number> => {
    return {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length
    };
  };

  // Get tasks by group for charts
  const getTasksByGroup = (): Record<TaskGroup, number> => {
    return {
      Frontend: tasks.filter(task => task.group === 'Frontend').length,
      Backend: tasks.filter(task => task.group === 'Backend').length,
      Database: tasks.filter(task => task.group === 'Database').length
    };
  };

  // Get recent tasks
  const getRecentTasks = (limit: number = 5, sortBy?: 'updated' | 'created'): Task[] => {
    // Sort by lastUpdated if available, otherwise createdAt
    return [...tasks]
      .sort((a, b) => {
        const aDate = a.lastUpdated || a.createdAt;
        const bDate = b.lastUpdated || b.createdAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      })
      .slice(0, limit);
  };

  // Get overdue tasks
  const getOverdueTasks = (): Task[] => {
    return tasks.filter(task => new Date(task.deadline) < new Date());
  };

  // Get upcoming deadlines
  const getUpcomingDeadlines = (days?: number): Task[] => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + (days || 7));
    return tasks.filter(task => new Date(task.deadline) >= tomorrow);
  };

  // Update a task
  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    if (!currentUser) return;
    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { 
          ...task, 
          ...updatedTask,
          // Add last updated information
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: currentUser.id,
          // Ensure photos array exists if not provided in the update
          photos: updatedTask.photos || task.photos || [],
          // Ensure comments array exists if not provided in the update
          comments: updatedTask.comments || task.comments || []
        } : task
      )
    );
  };

  // Update task status (specific function for users)
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    // Check if current user is allowed to update this task
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Only allow if user is admin or the task is assigned to them
    if (currentUser.role === 'admin' || task.assignedTo === currentUser.id) {
      updateTask(taskId, { 
        status,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: currentUser.id
      });
    }
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Add a photo to a task
  const addTaskPhoto = (taskId: string, photoData: { imageUrl: string, caption?: string }) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if user is allowed to add photo
    if (currentUser.role === 'admin' || task.assignedTo === currentUser.id) {
      const newPhoto: TaskPhoto = {
        id: Math.random().toString(36).substr(2, 9),
        taskId,
        imageUrl: photoData.imageUrl,
        caption: photoData.caption,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
      };
      
      // Add photo to task, ensuring photos array exists
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                photos: Array.isArray(task.photos) ? [...task.photos, newPhoto] : [newPhoto],
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: currentUser.id
              }
            : task
        )
      );
    }
  };

  // Delete a photo from a task
  const deleteTaskPhoto = (taskId: string, photoId: string) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if user is allowed to delete photo
    if (currentUser.role === 'admin' || task.assignedTo === currentUser.id) {
      // Remove photo from task, ensuring photos array exists
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                photos: Array.isArray(task.photos) 
                  ? task.photos.filter(photo => photo.id !== photoId)
                  : [],
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: currentUser.id
              }
            : task
        )
      );
    }
  };

  // Get all photos for a specific task
  const getTaskPhotos = (taskId: string): TaskPhoto[] => {
    const task = tasks.find(t => t.id === taskId);
    return task && Array.isArray(task.photos) ? task.photos : [];
  };

  // Add a comment to a task
  const addTaskComment = (taskId: string, text: string) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if user is allowed to add comment
    if (currentUser.role === 'admin' || task.assignedTo === currentUser.id) {
      const newComment: TaskComment = {
        id: Math.random().toString(36).substr(2, 9),
        taskId,
        text,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        createdByName: currentUser.name,
      };
      
      // Add comment to task, ensuring comments array exists
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                comments: Array.isArray(task.comments) ? [...task.comments, newComment] : [newComment],
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: currentUser.id
              }
            : task
        )
      );
    }
  };

  // Delete a comment from a task
  const deleteTaskComment = (taskId: string, commentId: string) => {
    if (!currentUser) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check if user is allowed to delete comment (admin or comment creator)
    const comment = task.comments?.find(c => c.id === commentId);
    if (!comment) return;
    
    if (currentUser.role === 'admin' || comment.createdBy === currentUser.id) {
      // Remove comment from task, ensuring comments array exists
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                comments: Array.isArray(task.comments) 
                  ? task.comments.filter(comment => comment.id !== commentId)
                  : [],
                lastUpdated: new Date().toISOString(),
                lastUpdatedBy: currentUser.id
              }
            : task
        )
      );
    }
  };

  // Get all comments for a specific task
  const getTaskComments = (taskId: string): TaskComment[] => {
    const task = tasks.find(t => t.id === taskId);
    return task && Array.isArray(task.comments) ? task.comments : [];
  };

  const value = {
    tasks,
    getUserTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    addTaskPhoto,
    deleteTaskPhoto,
    getTaskPhotos,
    addTaskComment,
    deleteTaskComment,
    getTaskComments,
    getAssignedToName,
    getCreatedByName,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByGroup,
    getRecentTasks,
    getOverdueTasks,
    getUpcomingDeadlines,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
