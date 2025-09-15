import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Circle,
  MessageSquare,
  Paperclip,
  Filter
} from 'lucide-react';
import { User as UserType } from '../App';

interface TaskManagerProps {
  user: UserType;
}

export function TaskManager({ user }: TaskManagerProps) {
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  const taskStats = [
    { label: 'Active Tasks', value: '12', color: 'bg-blue-500' },
    { label: 'Completed', value: '38', color: 'bg-green-500' },
    { label: 'Overdue', value: '3', color: 'bg-red-500' },
    { label: 'This Week', value: '8', color: 'bg-purple-500' },
  ];

  const tasks = [
    {
      id: 1,
      title: "Update social media content calendar for September",
      description: "Create and schedule posts for all platforms focusing on fall health tips",
      assignee: "Marketing Team",
      priority: "high",
      status: "in-progress",
      dueDate: "2025-08-25",
      tags: ["social media", "content"],
      comments: 3,
      attachments: 2
    },
    {
      id: 2,
      title: "Design new patient brochure template",
      description: "Create a modern, accessible brochure template for various medical services",
      assignee: "Design Team",
      priority: "medium",
      status: "pending",
      dueDate: "2025-08-30",
      tags: ["design", "branding"],
      comments: 1,
      attachments: 0
    },
    {
      id: 3,
      title: "Website accessibility audit",
      description: "Conduct comprehensive accessibility review and implement improvements",
      assignee: "Web Team",
      priority: "high",
      status: "in-progress",
      dueDate: "2025-08-28",
      tags: ["website", "accessibility"],
      comments: 5,
      attachments: 1
    },
    {
      id: 4,
      title: "Staff feedback collection on new brand guidelines",
      description: "Gather input from medical staff on updated brand guidelines and messaging",
      assignee: "HR Team",
      priority: "low",
      status: "completed",
      dueDate: "2025-08-20",
      tags: ["branding", "feedback"],
      comments: 8,
      attachments: 3
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Circle;
      case 'pending': return AlertCircle;
      default: return Circle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'my-tasks') return task.assignee.includes(user.name);
    return task.status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Collaborate on projects and track progress across all initiatives</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {taskStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Management */}
      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">Task List</TabsTrigger>
            <TabsTrigger value="board">Kanban Board</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-3">
            <select 
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="my-tasks">My Tasks</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              {filteredTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <Card key={task.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <StatusIcon className={`w-5 h-5 mt-1 ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <h3 className={`text-lg text-gray-900 mb-2 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {task.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {task.assignee}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {task.dueDate}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {task.comments}
                              </span>
                              {task.attachments > 0 && (
                                <span className="flex items-center">
                                  <Paperclip className="w-4 h-4 mr-1" />
                                  {task.attachments}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Add Task */}
            <Card className="border-0 shadow-md h-fit">
              <CardHeader>
                <CardTitle>Quick Add Task</CardTitle>
                <CardDescription>Create a new task for the team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Task title..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Textarea
                  placeholder="Task description..."
                  className="min-h-20"
                />
                <div className="space-y-3">
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Assign to...</option>
                    <option>Marketing Team</option>
                    <option>Design Team</option>
                    <option>Web Team</option>
                    <option>HR Team</option>
                  </select>
                  <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Priority</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <Input type="date" />
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="board" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['pending', 'in-progress', 'completed'].map((status) => (
              <Card key={status} className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center justify-between">
                    {status.replace('-', ' ')}
                    <Badge variant="secondary">
                      {tasks.filter(task => task.status === status).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks
                    .filter(task => task.status === status)
                    .map(task => (
                      <div key={task.id} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <h4 className="text-sm text-gray-900 mb-2">{task.title}</h4>
                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {task.assignee.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
              <CardDescription>View tasks organized by due date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-700 mb-2">Calendar View</h3>
                  <p className="text-gray-500">Interactive calendar with task scheduling would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}