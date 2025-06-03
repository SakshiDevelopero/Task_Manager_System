import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTask,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/contexts/TaskContext";
import Sidebar from "@/components/Sidebar";
import TaskCard from "@/components/TaskCard";
import TaskChart from "@/components/TaskChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Calendar,
  CheckCheck,
  LayoutDashboard,
  ListChecks,
  LucideUsers,
  Plus,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { currentUser, isAdmin, allUsers } = useAuth(); // Make sure to destructure allUsers here
  const { tasks, addTask, deleteTask } = useTask();
  const [searchQuery, setSearchQuery] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [chartView, setChartView] = useState<
    "status" | "priority" | "timeline" | "progress"
  >("status");

  const [newTask, setNewTask] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    deadline: new Date().toISOString().split("T")[0],
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    assignedTo: currentUser?.id || "", // This already sets current user as default
    group: "Frontend" as "Frontend" | "Backend" | "Database",
  });

  const handleCreateTask = () => {
    if (!isAdmin || !currentUser) return;
    const assignedUserId = newTask.assignedTo || currentUser.id;
    addTask({
      ...newTask,
      createdBy: currentUser.id,
      assignedTo: assignedUserId, // Use the selected user or fallback to current user
    });

    if (!newTask.assignedTo) {
      toast({
        title: "Assignment required",
        description: "Please assign the task to a user",
        variant: "destructive",
      });
      return;
    }

    addTask({
      ...newTask,
      createdBy: currentUser.id,
      assignedTo: newTask.assignedTo, // Use the selected user
    });

    setNewTask({
      title: "",
      shortDescription: "",
      longDescription: "",
      deadline: new Date().toISOString().split("T")[0],
      status: "todo",
      priority: "medium",
      assignedTo: currentUser.id, // Always reset to current user
      group: "Frontend",
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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "inProgress"
  ).length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: filteredTasks.filter((task) => task.status === "todo"),
    inProgress: filteredTasks.filter((task) => task.status === "inProgress"),
    completed: filteredTasks.filter((task) => task.status === "completed"),
  };

  // Tasks by group
  const tasksByGroup = {
    Frontend: filteredTasks.filter((task) => task.group === "Frontend"),
    Backend: filteredTasks.filter((task) => task.group === "Backend"),
    Database: filteredTasks.filter((task) => task.group === "Database"),
  };

  return (
    <div className="flex h-screen bg-taskDark text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-4 bg-taskDark-light border-b border-taskDark-lighter animate-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </div>

              {isAdmin && (
                <Dialog
                  open={isTaskDialogOpen}
                  onOpenChange={setIsTaskDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-taskPurple hover:bg-taskPurple-light transition-all transform hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-taskDark-light border-taskDark-lighter text-white animate-scale-in">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Fill in the details to create a new task for your team.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="space-y-1">
                        <label
                          htmlFor="title"
                          className="text-sm text-gray-300"
                        >
                          Title
                        </label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask({ ...newTask, title: e.target.value })
                          }
                          placeholder="Task title"
                          className="task-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="shortDescription"
                          className="text-sm text-gray-300"
                        >
                          Short Description
                        </label>
                        <Input
                          id="shortDescription"
                          value={newTask.shortDescription}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              shortDescription: e.target.value,
                            })
                          }
                          placeholder="Brief description"
                          className="task-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="longDescription"
                          className="text-sm text-gray-300"
                        >
                          Long Description
                        </label>
                        <Textarea
                          id="longDescription"
                          value={newTask.longDescription}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              longDescription: e.target.value,
                            })
                          }
                          placeholder="Detailed description"
                          className="task-input min-h-24"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="deadline"
                            className="text-sm text-gray-300"
                          >
                            Deadline
                          </label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newTask.deadline}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                deadline: e.target.value,
                              })
                            }
                            className="task-input"
                          />
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="priority"
                            className="text-sm text-gray-300"
                          >
                            Priority
                          </label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: TaskPriority) =>
                              setNewTask({ ...newTask, priority: value })
                            }
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
                          <label
                            htmlFor="assignedTo"
                            className="text-sm text-gray-300"
                          >
                            Assign To
                          </label>
                          <Select
                            value={newTask.assignedTo}
                            onValueChange={(value) =>
                              setNewTask({ ...newTask, assignedTo: value })
                            }
                          >
                            <SelectTrigger
                              id="assignedTo"
                              className="task-input"
                            >
                              <SelectValue
                                placeholder={
                                  currentUser
                                    ? `${currentUser.name} (you)`
                                    : "Select user"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-taskDark-lighter border-taskDark-light">
                              {/* Current user option - always show first */}
                              {currentUser && (
                                <SelectItem value={currentUser.id}>
                                  {currentUser.name} (you)
                                </SelectItem>
                              )}

                              {/* Other users (excluding current user) */}
                              {allUsers
                                .filter((user) => user.id !== currentUser?.id)
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}{" "}
                                    {user.role === "admin" && "(Admin)"}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="group"
                            className="text-sm text-gray-300"
                          >
                            Task Group
                          </label>
                          <Select
                            value={newTask.group}
                            onValueChange={(
                              value: "Frontend" | "Backend" | "Database"
                            ) => setNewTask({ ...newTask, group: value })}
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
                      <Button
                        variant="outline"
                        onClick={() => setIsTaskDialogOpen(false)}
                        className="border-taskDark-lighter text-gray-300 hover:bg-taskDark-lighter"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        className="bg-taskPurple hover:bg-taskPurple-light"
                      >
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
          <section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:shadow-taskPurple/20 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tasks</p>
                  <h3 className="text-2xl font-semibold">{totalTasks}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:shadow-taskPurple/20 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <h3 className="text-2xl font-semibold">{inProgressTasks}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:shadow-taskPurple/20 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <h3 className="text-2xl font-semibold">{completedTasks}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCheck className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-taskDark-light p-4 rounded-lg border border-taskDark-lighter hover:shadow-md hover:shadow-taskPurple/20 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <h3 className="text-2xl font-semibold">{todoTasks}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </div>
          </section>

          <section
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Task Overview</h2>

              <div className="flex space-x-2 bg-taskDark-lighter rounded-full p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartView("status")}
                  className={`rounded-full px-4 ${
                    chartView === "status" ? "bg-taskPurple" : ""
                  }`}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartView("priority")}
                  className={`rounded-full px-4 ${
                    chartView === "priority" ? "bg-taskPurple" : ""
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Priority
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartView("timeline")}
                  className={`rounded-full px-4 ${
                    chartView === "timeline" ? "bg-taskPurple" : ""
                  }`}
                >
                  <LineChart className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartView("progress")}
                  className={`rounded-full px-4 ${
                    chartView === "progress" ? "bg-taskPurple" : ""
                  }`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Progress
                </Button>
              </div>
            </div>
            <TaskChart activeView={chartView} />
          </section>

          <section
            className="animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="text-xl font-semibold mb-4">Task Management</h2>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 max-w-md bg-taskDark-lighter">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-taskPurple data-[state=active]:text-white"
                >
                  All Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="frontend"
                  className="data-[state=active]:bg-taskPurple data-[state=active]:text-white"
                >
                  Frontend
                </TabsTrigger>
                <TabsTrigger
                  value="backend"
                  className="data-[state=active]:bg-taskPurple data-[state=active]:text-white"
                >
                  Backend
                </TabsTrigger>
                <TabsTrigger
                  value="database"
                  className="data-[state=active]:bg-taskPurple data-[state=active]:text-white"
                >
                  Database
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <HoverCard key={task.id}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all hover:-translate-y-1 hover:shadow-lg hover:z-10 focus-within:blur-none group">
                          <TaskCard
                            task={task}
                            onDelete={() => handleDeleteTask(task.id)}
                            showEditOptions={isAdmin}
                          />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-4">
                            {task.longDescription}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Created by: Admin</span>
                            <span>
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {filteredTasks.length === 0 && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-400">No tasks found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="frontend" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksByGroup.Frontend.map((task) => (
                    <HoverCard key={task.id}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all hover:-translate-y-1 hover:shadow-lg hover:z-10">
                          <TaskCard
                            task={task}
                            onDelete={() => handleDeleteTask(task.id)}
                            showEditOptions={isAdmin}
                          />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-4">
                            {task.longDescription}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Created by: Admin</span>
                            <span>
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {tasksByGroup.Frontend.length === 0 && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-400">No Frontend tasks found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="backend" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksByGroup.Backend.map((task) => (
                    <HoverCard key={task.id}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all hover:-translate-y-1 hover:shadow-lg hover:z-10">
                          <TaskCard
                            task={task}
                            onDelete={() => handleDeleteTask(task.id)}
                            showEditOptions={isAdmin}
                          />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-4">
                            {task.longDescription}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Created by: Admin</span>
                            <span>
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {tasksByGroup.Backend.length === 0 && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-400">No Backend tasks found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="database" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasksByGroup.Database.map((task) => (
                    <HoverCard key={task.id}>
                      <HoverCardTrigger asChild>
                        <div className="transform transition-all hover:-translate-y-1 hover:shadow-lg hover:z-10">
                          <TaskCard
                            task={task}
                            onDelete={() => handleDeleteTask(task.id)}
                            showEditOptions={isAdmin}
                          />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0 bg-taskDark-light border-taskDark-lighter">
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-4">
                            {task.longDescription}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Created by: Admin</span>
                            <span>
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                  {tasksByGroup.Database.length === 0 && (
                    <div className="col-span-full text-center py-10">
                      <p className="text-gray-400">No Database tasks found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
