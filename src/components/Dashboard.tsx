import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Target,
  Clock,
  Flame,
  Footprints,
  Plus,
  BarChart3,
  User,
  Settings,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming db is already configured here

// Types for real data
interface DailyMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  distance: number;
  workouts: number;
}

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly';
  createdAt: Timestamp;
  targetDate?: Timestamp;
  achieved: boolean;
}

interface UserActivity { // Renamed from 'Activity' to avoid conflict with lucide-react Activity icon
  id: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: Timestamp;
  notes?: string;
  userId: string;
}

export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>({
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    distance: 0,
    workouts: 0
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);

  // Fetch dashboard data from Firestore
  const fetchDashboardData = async () => {
    if (!currentUser?.uid) {
      setIsLoading(false); // Stop loading if no user is logged in
      return;
    }

    setIsLoading(true);
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's activities
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        where('userId', '==', currentUser.uid),
        where('date', '>=', Timestamp.fromDate(today)),
        where('date', '<', Timestamp.fromDate(tomorrow))
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      // Calculate daily metrics from activities
      let totalCalories = 0;
      let totalActiveMinutes = 0;
      let totalDistance = 0;
      let workoutCount = 0;

      activitiesSnapshot.forEach(doc => {
        const activity = doc.data() as UserActivity;
        totalCalories += activity.calories || 0;
        totalActiveMinutes += activity.duration || 0;
        totalDistance += activity.distance || 0;
        if (activity.type.toLowerCase().includes('workout') ||
            activity.type.toLowerCase().includes('strength') ||
            activity.type.toLowerCase().includes('training')) {
          workoutCount++;
        }
      });

      // Fetch user profile for steps (if available)
      const userProfileRef = doc(db, 'users', currentUser.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const userProfile = userProfileSnap.data();
      const steps = userProfile?.dailySteps || 0; // Assuming dailySteps might be stored in user profile

      setDailyMetrics({
        steps,
        calories: totalCalories,
        activeMinutes: totalActiveMinutes,
        distance: totalDistance,
        workouts: workoutCount
      });

      // Fetch user goals
      const goalsRef = collection(db, 'goals');
      const goalsQuery = query(
        goalsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);

      const goalsData: Goal[] = [];
      goalsSnapshot.forEach(doc => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData);

      // Fetch recent activities (last 5, regardless of date for history tab)
      const recentActivitiesQuery = query(
        activitiesRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(5)
      );
      const recentActivitiesSnapshot = await getDocs(recentActivitiesQuery);

      const activitiesData: UserActivity[] = [];
      recentActivitiesSnapshot.forEach(doc => {
        activitiesData.push({ id: doc.id, ...doc.data() } as UserActivity);
      });
      setRecentActivities(activitiesData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if Firestore fails or no data
      setDailyMetrics({
        steps: 0,
        calories: 0,
        activeMinutes: 0,
        distance: 0,
        workouts: 0
      });
      setGoals([]);
      setRecentActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser?.uid]); // Re-fetch data when currentUser UID changes

  const handleLogout = async () => {
    try {
      // Assuming useAuth provides a logout function
      // If not, you'd integrate Firebase auth.signOut() here
      // For now, it just logs a message
      console.log('Logout clicked');
      // Redirect to login page after logout (example)
      // history.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return target === 0 ? 0 : Math.min((current / target) * 100, 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'running': return <Footprints className="w-4 h-4 text-black" />;
      case 'cycling': return <Activity className="w-4 h-4 text-black" />;
      case 'strength training': return <Target className="w-4 h-4 text-black" />;
      case 'yoga': return <Activity className="w-4 h-4 text-black" />; // Example for another type
      default: return <Activity className="w-4 h-4 text-black" />;
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading dashboard...</span>
        </div>
      </div>
    );
  }

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
              <span className="text-sm">Welcome, {currentUser?.email || 'Guest'}</span>
              <Button asChild variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black">
                <Link to="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black">
                <Link to="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black">
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
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link to="/activity/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Activity
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-black text-black hover:bg-black hover:text-white">
                <Link to="/workouts">
                  <Target className="w-4 h-4 mr-2" />
                  Workouts
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-black text-black hover:bg-black hover:text-white">
                <Link to="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-black text-black hover:bg-black hover:text-white">
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
          <Card className="border-black">
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

          <Card className="border-black">
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

          <Card className="border-black">
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

          <Card className="border-black">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-2xl font-bold text-black">{dailyMetrics.distance.toFixed(1)} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
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

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black text-white">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activities */}
              <Card className="border-black">
                <CardHeader>
                  <CardTitle className="text-black">Recent Activities</CardTitle>
                  <CardDescription>Your latest fitness activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getActivityIcon(activity.type)}
                            <div>
                              <p className="font-medium text-black">{activity.type}</p>
                              <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-black">{activity.duration} min</p>
                            <p className="text-sm text-gray-600">{activity.calories} cal</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress */}
              <Card className="border-black">
                <CardHeader>
                  <CardTitle className="text-black">Goal Progress</CardTitle>
                  <CardDescription>Track your fitness goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.length > 0 ? (
                      goals.slice(0, 3).map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-black">{goal.name}</span>
                            <span className="text-sm text-gray-600">
                              {goal.current}/{goal.target} {goal.unit}
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercentage(goal.current, goal.target)}
                            className="h-2 bg-gray-300 [&::-webkit-progress-bar]:bg-gray-300 [&::-webkit-progress-value]:bg-black [&::-moz-progress-bar]:bg-black" // Customizing progress bar for black fill
                          />
                          <p className="text-xs text-gray-500">
                            {Math.round(getProgressPercentage(goal.current, goal.target))}% complete
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No goals set</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black">All Activities</CardTitle>
                <CardDescription>View and manage your fitness activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="font-medium text-black">{activity.type}</p>
                            <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                            {activity.notes && (
                              <p className="text-sm text-gray-500">{activity.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-black">{activity.duration} min</p>
                          <p className="text-sm text-gray-600">{activity.calories} cal</p>
                          {activity.distance && (
                            <p className="text-sm text-gray-600">{activity.distance} km</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No activities found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black">All Goals</CardTitle>
                <CardDescription>Track your fitness goals and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.length > 0 ? (
                    goals.map((goal) => (
                      <div key={goal.id} className="p-4 border border-gray-300 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-black">{goal.name}</h3>
                            <p className="text-sm text-gray-600">
                              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
                            </p>
                          </div>
                          <Badge className={goal.achieved ? "bg-black text-white" : "bg-gray-200 text-gray-800"}>
                            {goal.achieved ? "Achieved" : "In Progress"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-black">
                              {goal.current}/{goal.target} {goal.unit}
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercentage(goal.current, goal.target)}
                            className="h-3 bg-gray-300 [&::-webkit-progress-bar]:bg-gray-300 [&::-webkit-progress-value]:bg-black [&::-moz-progress-bar]:bg-black"
                          />
                          <p className="text-xs text-gray-500">
                            {Math.round(getProgressPercentage(goal.current, goal.target))}% complete
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No goals set</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-black">
              <CardHeader>
                <CardTitle className="text-black">Activity History</CardTitle>
                <CardDescription>View your complete fitness history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="font-medium text-black">{activity.type}</p>
                            <p className="text-sm text-gray-600">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-black">{activity.duration} min</p>
                          <p className="text-sm text-gray-600">{activity.calories} cal</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8">No activity history</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}