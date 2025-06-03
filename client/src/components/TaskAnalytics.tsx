
import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, PieChart, LineChart, Activity, Users, Calendar } from 'lucide-react';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart as RechartsLine,
  Line,
  Legend
} from 'recharts';

interface TaskAnalyticsProps {
  view: 'status' | 'priority' | 'group' | 'timeline';
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ view }) => {
  const { 
    tasks, 
    getTasksByStatus, 
    getTasksByPriority, 
    getTasksByGroup, 
    getAssignedToName
  } = useTask();
  
  // Colors for charts
  const COLORS = {
    status: {
      todo: '#9b87f5', // Purple
      inProgress: '#0EA5E9', // Blue
      completed: '#22C55E', // Green
    },
    priority: {
      high: '#EF4444', // Red
      medium: '#F97316', // Orange
      low: '#22C55E', // Green
    },
    group: {
      Frontend: '#D946EF', // Pink
      Backend: '#3B82F6', // Blue
      Database: '#14B8A6', // Teal
    }
  };
  
  // Format data for the status chart
  const getStatusChartData = () => {
    const statusCounts = getTasksByStatus();
    return [
      { name: 'To Do', value: statusCounts.todo, color: COLORS.status.todo },
      { name: 'In Progress', value: statusCounts.inProgress, color: COLORS.status.inProgress },
      { name: 'Completed', value: statusCounts.completed, color: COLORS.status.completed }
    ];
  };
  
  // Format data for the priority chart
  const getPriorityChartData = () => {
    const priorityCounts = getTasksByPriority();
    return [
      { name: 'High', value: priorityCounts.high, color: COLORS.priority.high },
      { name: 'Medium', value: priorityCounts.medium, color: COLORS.priority.medium },
      { name: 'Low', value: priorityCounts.low, color: COLORS.priority.low }
    ];
  };
  
  // Format data for the group chart
  const getGroupChartData = () => {
    const groupCounts = getTasksByGroup();
    return [
      { name: 'Frontend', value: groupCounts.Frontend, color: COLORS.group.Frontend },
      { name: 'Backend', value: groupCounts.Backend, color: COLORS.group.Backend },
      { name: 'Database', value: groupCounts.Database, color: COLORS.group.Database }
    ];
  };
  
  // Format data for the timeline chart (last 30 days)
  const getTimelineChartData = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Get completed tasks in the last 30 days
    const recentCompletedTasks = tasks.filter(task => {
      const completedDate = task.status === 'completed' && task.lastUpdated ? new Date(task.lastUpdated) : null;
      return completedDate && completedDate >= thirtyDaysAgo;
    });
    
    // Group by date
    const completionsByDate: Record<string, number> = {};
    recentCompletedTasks.forEach(task => {
      if (!task.lastUpdated) return;
      
      const dateStr = new Date(task.lastUpdated).toISOString().split('T')[0];
      completionsByDate[dateStr] = (completionsByDate[dateStr] || 0) + 1;
    });
    
    // Generate data for each of the last 30 days
    const timelineData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      timelineData.push({
        date: formattedDate,
        Completed: completionsByDate[dateStr] || 0,
      });
    }
    
    return timelineData;
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Render the appropriate chart based on the view
  const renderChart = () => {
    switch (view) {
      case 'status':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={getStatusChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getStatusChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        );
      
      case 'priority':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar
                data={getPriorityChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Tasks">
                  {getPriorityChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        );
      
      case 'group':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar
                data={getGroupChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Tasks">
                  {getGroupChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLine
                data={getTimelineChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Completed" stroke="#9b87f5" activeDot={{ r: 8 }} />
              </RechartsLine>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return <div>Select a chart type</div>;
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          {view === 'status' && <PieChart className="h-5 w-5 mr-2 text-taskPurple" />}
          {view === 'priority' && <BarChart className="h-5 w-5 mr-2 text-taskPurple" />}
          {view === 'group' && <Users className="h-5 w-5 mr-2 text-taskPurple" />}
          {view === 'timeline' && <Activity className="h-5 w-5 mr-2 text-taskPurple" />}
          {view === 'status' && 'Tasks by Status'}
          {view === 'priority' && 'Tasks by Priority'}
          {view === 'group' && 'Tasks by Group'}
          {view === 'timeline' && 'Task Completion Timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default TaskAnalytics;
