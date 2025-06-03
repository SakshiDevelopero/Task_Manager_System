
import React from 'react';
import { useTask } from '@/contexts/TaskContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, CartesianGrid, LineChart, Line } from 'recharts';

interface TaskChartProps {
  activeView?: 'status' | 'priority' | 'timeline' | 'progress';
}

const TaskChart: React.FC<TaskChartProps> = ({ activeView = 'status' }) => {
  const { tasks } = useTask();
  
  // Data for status pie chart
  const statusData = [
    { name: 'To Do', value: tasks.filter(task => task.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(task => task.status === 'inProgress').length },
    { name: 'Completed', value: tasks.filter(task => task.status === 'completed').length },
  ];
  
  // Data for priority bar chart
  const priorityData = [
    { name: 'High', value: tasks.filter(task => task.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(task => task.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(task => task.priority === 'low').length },
  ];
  
  // Data for timeline area chart - group tasks by creation date
  const getTasksByDate = () => {
    const dateMap = new Map();
    
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, count: 0 });
      }
      const existingEntry = dateMap.get(date);
      existingEntry.count += 1;
      dateMap.set(date, existingEntry);
    });
    
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const timelineData = getTasksByDate();
  
  // Data for task group and progress
  const progressData = [
    { 
      name: 'Frontend', 
      completed: tasks.filter(t => t.group === 'Frontend' && t.status === 'completed').length,
      inProgress: tasks.filter(t => t.group === 'Frontend' && t.status === 'inProgress').length,
      todo: tasks.filter(t => t.group === 'Frontend' && t.status === 'todo').length,
    },
    { 
      name: 'Backend', 
      completed: tasks.filter(t => t.group === 'Backend' && t.status === 'completed').length,
      inProgress: tasks.filter(t => t.group === 'Backend' && t.status === 'inProgress').length,
      todo: tasks.filter(t => t.group === 'Backend' && t.status === 'todo').length,
    },
    { 
      name: 'Database', 
      completed: tasks.filter(t => t.group === 'Database' && t.status === 'completed').length,
      inProgress: tasks.filter(t => t.group === 'Database' && t.status === 'inProgress').length,
      todo: tasks.filter(t => t.group === 'Database' && t.status === 'todo').length,
    },
  ];
  
  // Colors for the charts
  const COLORS = ['#9b87f5', '#f97316', '#10b981'];
  const STATUS_COLORS = {
    todo: '#9b87f5',      // Purple for 'To Do'
    inProgress: '#f97316', // Orange for 'In Progress'
    completed: '#10b981',  // Green for 'Completed'
  };

  // Render different charts based on active view
  const renderChart = () => {
    switch (activeView) {
      case 'priority':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Tasks" fill="#9b87f5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Tasks" stroke="#9b87f5" fill="#9b87f5" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'progress':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
              <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#f97316" />
              <Bar dataKey="todo" name="To Do" stackId="a" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'status':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-taskDark-light p-2 border border-taskDark-lighter rounded shadow-lg">
          {label && <p className="font-semibold text-xs">{label}</p>}
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: item.color }}>
              {`${item.name}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-taskDark-light rounded-lg border border-taskDark-lighter p-6">
      {renderChart()}
    </div>
  );
};

export default TaskChart;
