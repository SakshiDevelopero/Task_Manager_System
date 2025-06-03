
import React, { useState } from 'react';
import { useTask, TaskStatus, TaskPriority, TaskGroup } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CalendarIcon, Clock, CheckCircle, Circle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Zap } from 'lucide-react';

const COLORS = ['#4F46E5', '#16A34A', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899'];

const TaskInsights: React.FC = () => {
  const { tasks, getTasksByStatus, getTasksByPriority, getTasksByGroup } = useTask();
  const { allUsers } = useAuth();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');

  // Prepare data for status chart
  const statusData = Object.entries(getTasksByStatus()).map(([status, count]) => ({
    name: status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Completed',
    value: count,
    color: status === 'todo' ? '#F59E0B' : status === 'inProgress' ? '#3B82F6' : '#16A34A'
  }));

  // Prepare data for priority chart
  const priorityData = Object.entries(getTasksByPriority()).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#16A34A'
  }));

  // Prepare data for group chart
  const groupData = Object.entries(getTasksByGroup()).map(([group, count]) => ({
    name: group,
    value: count,
    color: group === 'Frontend' ? '#4F46E5' : group === 'Backend' ? '#EC4899' : '#3B82F6'
  }));

  // Calculate tasks by user
  const tasksByUser = allUsers.map(user => {
    const userTasks = tasks.filter(task => task.assignedTo === user.id);
    return {
      name: user.name,
      total: userTasks.length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      inProgress: userTasks.filter(task => task.status === 'inProgress').length,
      todo: userTasks.filter(task => task.status === 'todo').length
    };
  });

  // Timeline data (tasks by month)
  const getMonthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data with zeros
    const data = months.map(month => ({
      name: month,
      created: 0,
      completed: 0
    }));
    
    // Count tasks by creation and completion month
    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      if (createdDate.getFullYear() === currentYear) {
        data[createdDate.getMonth()].created += 1;
      }
      
      if (task.status === 'completed' && task.lastUpdated) {
        const completedDate = new Date(task.lastUpdated);
        if (completedDate.getFullYear() === currentYear) {
          data[completedDate.getMonth()].completed += 1;
        }
      }
    });
    
    return data;
  };
  
  const monthlyData = getMonthData();

  // Productivity score (based on task completion rate)
  const calculateProductivityScore = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const productivityScore = calculateProductivityScore();

  const renderPieChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} tasks`, '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = (data: any[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} tasks`, '']} />
        <Legend />
        <Bar dataKey="value" name="Tasks" animationDuration={1000}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={monthlyData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} tasks`, '']} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="created" 
          stroke="#4F46E5" 
          activeDot={{ r: 8 }} 
          name="Created Tasks"
          animationDuration={1000}
        />
        <Line 
          type="monotone" 
          dataKey="completed" 
          stroke="#16A34A" 
          name="Completed Tasks" 
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderUserBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={tasksByUser}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip formatter={(value) => [`${value} tasks`, '']} />
        <Legend />
        <Bar dataKey="completed" stackId="a" fill="#16A34A" name="Completed" />
        <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="In Progress" />
        <Bar dataKey="todo" stackId="a" fill="#F59E0B" name="To Do" />
      </BarChart>
    </ResponsiveContainer>
  );

  const getChartIcon = () => {
    switch (chartType) {
      case 'pie': return <PieChartIcon className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'line': return <LineChartIcon className="h-4 w-4" />;
      default: return <PieChartIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Insights</h2>
        <div className="flex bg-taskDark-lighter rounded-lg p-1">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              chartType === 'pie' ? 'bg-taskPurple text-white' : 'text-gray-400'
            }`}
          >
            <PieChartIcon className="h-4 w-4 mr-1" /> Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              chartType === 'bar' ? 'bg-taskPurple text-white' : 'text-gray-400'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-1" /> Bar
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              chartType === 'line' ? 'bg-taskPurple text-white' : 'text-gray-400'
            }`}
          >
            <LineChartIcon className="h-4 w-4 mr-1" /> Line
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Circle className="h-4 w-4 mr-2 text-amber-500" />
              Tasks by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartType === 'pie' && renderPieChart(statusData)}
            {chartType === 'bar' && renderBarChart(statusData)}
            {chartType === 'line' && renderLineChart()}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-red-500" />
              Tasks by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartType === 'pie' && renderPieChart(priorityData)}
            {chartType === 'bar' && renderBarChart(priorityData)}
            {chartType === 'line' && renderLineChart()}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
              Tasks by Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartType === 'pie' && renderPieChart(groupData)}
            {chartType === 'bar' && renderBarChart(groupData)}
            {chartType === 'line' && renderLineChart()}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              Task Timeline (This Year)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLineChart()}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
              Tasks by User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderUserBarChart()}
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#1f2937" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={productivityScore > 70 ? "#16A34A" : productivityScore > 40 ? "#F59E0B" : "#EF4444"} 
                  strokeWidth="10" 
                  strokeDasharray={`${productivityScore * 2.83}, 283`} 
                  strokeDashoffset="0" 
                  strokeLinecap="round" 
                  transform="rotate(-90 50 50)" 
                  className="transition-all duration-1000 ease-in-out"
                  style={{ 
                    animation: "progress 1s ease-out forwards" 
                  }}
                />
                <text 
                  x="50" 
                  y="50" 
                  fontFamily="Arial" 
                  fontSize="24" 
                  textAnchor="middle" 
                  alignmentBaseline="middle" 
                  fill="white" 
                  className="font-bold"
                >
                  {productivityScore}%
                </text>
              </svg>
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-bold">
                {productivityScore > 70 ? "Excellent!" : productivityScore > 40 ? "Good Progress" : "Needs Improvement"}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                {productivityScore > 70 ? "Your team is highly productive!" : 
                 productivityScore > 40 ? "You're making good progress on your tasks." : 
                 "Focus on completing more tasks to improve your score."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskInsights;
