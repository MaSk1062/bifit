import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Target, 
  Calendar, 
  Clock, 
  Flame, 
  Footprints,
  Plus,
  BarChart3,
  Trophy,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for demonstration - will be replaced with real Firestore data
const mockDailyMetrics = {
  steps: 8432,
  calories: 2450,
  activeMinutes: 45,
  distance: 6.2,
  workouts: 2
};

const mockGoals = [
  { id: 1, name: 'Daily Steps', target: 10000, current: 8432, unit: 'steps', type: 'daily' },
  { id: 2, name: 'Weekly Workouts', target: 5, current: 3, unit: 'workouts', type: 'weekly' },
  { id: 3, name: 'Monthly Distance', target: 100, current: 67, unit: 'km', type: 'monthly' }
];

const mockRecentActivities = [
  { id: 1, type: 'Running', duration: 30, distance: 5.2, calories: 320, date: '2024-01-15' },
  { id: 2, type: 'Strength Training', duration: 45, calories: 280, date: '2024-01-14' },
  { id: 3, type: 'Cycling', duration: 60, distance: 20, calories: 450, date: '2024-01-13' }
];

export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const dailyMetrics = mockDailyMetrics;
  const goals = mockGoals;
  const recentActivities = mockRecentActivities;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running': return <Footprints className="w-4 h-4" />;
      case 'cycling': return <Activity className="w-4 h-4" />;
      case 'strength training': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {currentUser?.email}</span>
              <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Link to="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* User Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Welcome back!</h2>
              <p className="text-gray-600">Track your fitness journey and achieve your goals</p>
            </div>
            <div className="flex space-x-2">
              <Button asChild>
                <Link to="/activity/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Activity
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/workouts">
                  <Target className="w-4 h-4 mr-2" />
                  Workouts
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/goals">
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Daily Metrics Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Footprints className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Steps</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.steps.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.calories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Active Minutes</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.activeMinutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.distance} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Workouts</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.workouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Activities
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Goals
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-black data-[state=active]:text-white">
              History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Goals Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Goal Progress</span>
                  </CardTitle>
                  <CardDescription>Your current goal achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-gray-600">{goal.current}/{goal.target} {goal.unit}</span>
                      </div>
                      <Progress value={getProgressPercentage(goal.current, goal.target)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activities</span>
                  </CardTitle>
                  <CardDescription>Your latest fitness activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium text-black">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.duration} min</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">{activity.calories} cal</p>
                        {activity.distance && (
                          <p className="text-sm text-gray-600">{activity.distance} km</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/activities">View All Activities</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Activity Summary</span>
                </CardTitle>
                <CardDescription>Detailed view of your activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium text-black">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium text-black">{activity.duration} min</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Calories</p>
                          <p className="font-medium text-black">{activity.calories}</p>
                        </div>
                        {activity.distance && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Distance</p>
                            <p className="font-medium text-black">{activity.distance} km</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Your Goals</span>
                </CardTitle>
                <CardDescription>Track your progress towards your fitness goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-black">{goal.name}</h3>
                      <Badge variant={goal.current >= goal.target ? "default" : "secondary"}>
                        {goal.current >= goal.target ? "Achieved" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{goal.current}/{goal.target} {goal.unit}</span>
                      </div>
                      <Progress value={getProgressPercentage(goal.current, goal.target)} className="h-3" />
                      <p className="text-sm text-gray-600">
                        {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} goal • {goal.unit}
                      </p>
                    </div>
                  </div>
                ))}
                <Button className="w-full" asChild>
                  <Link to="/goals/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Goal
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Activity History</span>
                </CardTitle>
                <CardDescription>View your past activities and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium text-black">{activity.type}</p>
                          <p className="text-sm text-gray-600">{activity.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-black">{activity.duration} minutes</p>
                        <p className="text-sm text-gray-600">{activity.calories} calories</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 