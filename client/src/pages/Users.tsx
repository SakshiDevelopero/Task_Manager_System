import React, { useEffect, useState } from 'react';
import { useAuth, User, UserRole } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, CheckCheck, Activity, Clock, Image, FileImage, Calendar, User as UserIcon, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Spinner } from '@/components/ui/spinner';

const Users = () => {
  const { isAdmin, currentUser, allUsers = [], updateUser, deleteUser, isLoading } = useAuth();
  const { tasks = [], getTaskPhotos } = useTask();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user' as UserRole
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-taskDark text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-taskPurple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-taskDark text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Ensure we have arrays to work with
  const safeUsers = allUsers ?? [];
  const safeTasks = tasks ?? [];

  // Get task counts for each user
  const getUserTaskCounts = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignedTo === userId);
    const completed = userTasks.filter(task => task.status === 'completed').length;
    const inProgress = userTasks.filter(task => task.status === 'inProgress').length;
    const todo = userTasks.filter(task => task.status === 'todo').length;
    
    return {
      total: userTasks.length,
      completed,
      inProgress,
      todo,
      completion: userTasks.length > 0 
        ? Math.round((completed / userTasks.length) * 100) 
        : 0,
      tasks: userTasks
    };
  };
  
  // Get all photos uploaded by a user
  const getUserPhotos = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignedTo === userId);
    let photos = [];
    
    for (const task of userTasks) {
      const taskPhotos = getTaskPhotos(task.id) || [];
      for (const photo of taskPhotos) {
        if (photo.createdBy === userId) {
          photos.push({
            ...photo,
            taskTitle: task.title
          });
        }
      }
    }
    
    return photos;
  };
  
  // Handler for user details
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  // Handler for photo view
  const handleViewPhoto = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl);
  };
  
  // Handler for edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };
  
  // Handler for updating user
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role
    });
    
    setEditingUser(null);
  };
  
  // Handler for delete confirmation
  const handleDeleteConfirm = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };
  
  // Handler for deleting user
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
      setShowDeleteConfirm(false);
    }
  };
  
  // Get user detail based on ID
  const getSelectedUser = () => {
    if (!selectedUserId) return null;
    return allUsers.find(u => u.id === selectedUserId);
  };
  
  const selectedUser = getSelectedUser();
  
  // Data for the task distribution chart
  const getTaskChartData = (userId: string) => {
    const { completed, inProgress, todo } = getUserTaskCounts(userId);
    
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'To Do', value: todo, color: '#8b5cf6' }
    ].filter(segment => segment.value > 0);
  };

  return (
    <div className="flex h-screen bg-taskDark text-white overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-4 bg-taskDark-light border-b border-taskDark-lighter">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-taskPurple/20 rounded-lg">
                <UsersIcon className="h-5 w-5 text-taskPurple" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">User Management</h1>
                <p className="text-sm text-gray-400">Welcome, {currentUser?.name || 'Admin'}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {/* User Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <h3 className="text-2xl font-semibold">{safeUsers.length}</h3>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <UsersIcon className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Active Tasks</p>
                  <h3 className="text-2xl font-semibold">
                    {tasks.filter(t => t.status !== 'completed').length}
                  </h3>
                </div>
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Completed Tasks</p>
                  <h3 className="text-2xl font-semibold">
                    {tasks.filter(t => t.status === 'completed').length}
                  </h3>
                </div>
                <div className="p-2 bg-green-500/20 rounded-full">
                  <CheckCheck className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Uploaded Photos</p>
                  <h3 className="text-2xl font-semibold">
                    {tasks.flatMap(t => t.photos || []).length}
                  </h3>
                </div>
                <div className="p-2 bg-pink-500/20 rounded-full">
                  <Image className="h-5 w-5 text-pink-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter overflow-hidden transform transition-all duration-300 hover:shadow-lg">
            <Table>
              <TableCaption>List of all users in the system</TableCaption>
              <TableHeader className="bg-taskDark-lighter">
                <TableRow>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Total Tasks</TableHead>
                  <TableHead className="text-white">Completion Rate</TableHead>
                  <TableHead className="text-white">Recent Activity</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map(user => {
                  const taskCounts = getUserTaskCounts(user.id);
                  const userPhotos = getUserPhotos(user.id);
                  const latestPhoto = userPhotos.length > 0 
                    ? userPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] 
                    : null;
                  
                  return (
                    <TableRow key={user.id} className={`border-taskDark-lighter hover:bg-taskDark-lighter/50 transition-colors ${user.id === currentUser?.id ? 'bg-taskDark-lighter/30' : ''}`}>
                      <TableCell className="font-medium">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-taskPurple">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${user.role === 'admin' ? 'bg-taskPurple/20 text-taskPurple hover:bg-taskPurple/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{taskCounts.total}</span>
                          {taskCounts.total > 0 && (
                            <div className="flex gap-1 items-center text-xs">
                              <span className="flex items-center text-green-400"><CheckCheck className="h-3 w-3 mr-0.5" />{taskCounts.completed}</span>
                              <span className="text-gray-400">•</span>
                              <span className="flex items-center text-amber-400"><Clock className="h-3 w-3 mr-0.5" />{taskCounts.inProgress}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full max-w-20 bg-taskDark-lighter rounded-full h-2">
                            <div 
                              className="bg-taskPurple h-2 rounded-full" 
                              style={{ width: `${taskCounts.completion}%` }}
                            ></div>
                          </div>
                          <span>{taskCounts.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {latestPhoto ? (
                          <div 
                            className="flex items-center space-x-2 cursor-pointer" 
                            onClick={() => handleViewPhoto(latestPhoto.imageUrl)}
                          >
                            <div className="h-8 w-8 bg-taskDark-lighter rounded overflow-hidden">
                              <img 
                                src={`http://localhost:5000${latestPhoto.imageUrl}`} 
                                alt="User activity" 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-gray-400">Uploaded photo {new Date(latestPhoto.createdAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No recent activity</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            onClick={() => handleViewUser(user.id)}
                          >
                            <UserIcon className="h-4 w-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                onClick={() => handleDeleteConfirm(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {allUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      <p>No users registered yet. Please register using the login page to get started.</p>
                      <p className="mt-2 text-sm">You're currently viewing this page as an admin. The first registered user will be an admin.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      
      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
          <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-taskPurple" />
                User Profile: {selectedUser.name}
                {selectedUser.id === currentUser?.id && (
                  <span className="ml-2 text-xs text-taskPurple">(You)</span>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedUser.email} • {selectedUser.role === 'admin' ? 'Administrator' : 'Regular User'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* User Stats Section */}
              <div className="col-span-1">
                <div className="bg-taskDark rounded-lg border border-taskDark-lighter p-4">
                  <h3 className="text-lg font-medium mb-4">Task Statistics</h3>
                  
                  {/* Task Pie Chart */}
                  <div className="h-48 mt-4">
                    {getTaskChartData(selectedUser.id).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getTaskChartData(selectedUser.id)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {getTaskChartData(selectedUser.id).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <AlertTriangle className="h-10 w-10 mx-auto text-gray-500 mb-2" />
                          <p>No tasks assigned yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Task Status Counts */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-taskDark-lighter p-2 rounded text-center">
                      <p className="text-xs text-gray-400">To Do</p>
                      <p className="text-lg font-medium text-taskPurple">{getUserTaskCounts(selectedUser.id).todo}</p>
                    </div>
                    <div className="bg-taskDark-lighter p-2 rounded text-center">
                      <p className="text-xs text-gray-400">In Progress</p>
                      <p className="text-lg font-medium text-amber-400">{getUserTaskCounts(selectedUser.id).inProgress}</p>
                    </div>
                    <div className="bg-taskDark-lighter p-2 rounded text-center">
                      <p className="text-xs text-gray-400">Completed</p>
                      <p className="text-lg font-medium text-green-400">{getUserTaskCounts(selectedUser.id).completed}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Task List Section */}
              <div className="col-span-2">
                <div className="bg-taskDark rounded-lg border border-taskDark-lighter p-4">
                  <h3 className="text-lg font-medium mb-4">Assigned Tasks</h3>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    {getUserTaskCounts(selectedUser.id).tasks.length > 0 ? (
                      <div className="space-y-3">
                        {getUserTaskCounts(selectedUser.id).tasks.map(task => (
                          <div key={task.id} className="bg-taskDark-light p-3 rounded-lg border border-taskDark-lighter hover:border-taskPurple/50 transition-colors">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-gray-400 mt-1">{task.shortDescription}</p>
                              </div>
                              <Badge 
                                className={`${
                                  task.status === 'completed' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
                                  task.status === 'inProgress' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 
                                  'bg-taskPurple/20 text-taskPurple hover:bg-taskPurple/30'
                                }`}
                              >
                                {task.status === 'inProgress' ? 'In Progress' : 
                                 task.status === 'completed' ? 'Completed' : 'To Do'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {new Date(task.deadline).toLocaleDateString()}
                              </div>
                              
                              {task.photos && task.photos.length > 0 && (
                                <div 
                                  className="flex items-center cursor-pointer hover:text-taskPurple transition-colors"
                                  onClick={() => handleViewPhoto(task.photos[0].imageUrl)}
                                >
                                  <FileImage className="h-3 w-3 mr-1" />
                                  {task.photos.length} photo{task.photos.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-400 bg-taskDark-lighter/50 rounded-lg">
                        <p>No tasks assigned to this user yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recent Photos */}
                <div className="bg-taskDark rounded-lg border border-taskDark-lighter p-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Recent Photos</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getUserPhotos(selectedUser.id).length > 0 ? (
                      getUserPhotos(selectedUser.id).slice(0, 6).map((photo, index) => (
                        <div 
                          key={photo.id}
                          className="bg-taskDark-light rounded overflow-hidden border border-taskDark-lighter cursor-pointer hover:border-taskPurple/50 transition-all hover:scale-105"
                          onClick={() => handleViewPhoto(photo.imageUrl)}
                        >
                          <div className="h-28 overflow-hidden">
                            <img 
                              src={`http://localhost:5000${photo.imageUrl}`} 
                              alt={photo.caption || 'Task photo'} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{photo.taskTitle}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(photo.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 py-8 text-center text-gray-400 bg-taskDark-lighter/50 rounded-lg">
                        <p>No photos uploaded by this user yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Photo View Dialog */}
      <Dialog open={!!selectedPhotoUrl} onOpenChange={(open) => !open && setSelectedPhotoUrl(null)}>
        <DialogContent className="bg-taskDark border-taskDark-lighter max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            <Button 
              className="absolute top-2 right-2 text-white bg-taskDark/80 hover:bg-taskDark p-2 h-auto rounded-full"
              variant="ghost"
              onClick={() => setSelectedPhotoUrl(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
            
            <img 
              src={selectedPhotoUrl ? `http://localhost:5000${selectedPhotoUrl}` : ''} 
              alt="Task photo" 
              className="w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm">Name</label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="bg-taskDark-lighter border-taskDark-lighter"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm">Email</label>
              <Input
                id="edit-email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="bg-taskDark-lighter border-taskDark-lighter"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm">Role</label>
              <Select
                value={editForm.role}
                onValueChange={(value: UserRole) => setEditForm({...editForm, role: value})}
              >
                <SelectTrigger id="edit-role" className="bg-taskDark-lighter border-taskDark-lighter">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-taskDark-lighter border-taskDark-lighter">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="border-taskDark-lighter text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-taskPurple hover:bg-taskPurple-light">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-taskDark-light border-taskDark-lighter text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteUser}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
