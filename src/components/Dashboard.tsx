import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MobileHeader } from '@/components/MobileHeader'; // Assuming this component exists and is correctly implemented
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
  Loader2,
  MapPin,
  Dumbbell,
  History
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
  const { currentUser, logout } = useAuth();

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
      console.log('Dashboard logout clicked');
      await logout();
      console.log('Dashboard logout successful');
      // The user will be redirected to the landing page automatically by the AuthContext
    } catch (error) {
      console.error('Dashboard logout error:', error);
      alert('Failed to logout. Please try again.');
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
      <div className="min-h-screen bg-white flex items-center justify-center font-inter">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Mobile Header */}
      <MobileHeader title="Dashboard" />

      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black text-xs sm:text-sm">
                Dashboard
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <span className="text-sm text-gray-300 sm:text-white">Welcome, {currentUser?.email || 'Guest'}</span>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs w-full sm:w-auto">
                  <Link to="/profile">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs w-full sm:w-auto">
                  <Link to="/settings">
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Settings
                  </Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
        {/* User Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Welcome back!</h2>
              <p className="text-gray-600 text-sm sm:text-base">Track your fitness journey and achieve your goals</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button asChild size="sm" className="bg-black text-white hover:bg-gray-800 text-xs sm:text-sm min-h-[44px]">
                <Link to="/activity/new">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Log Activity
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs sm:text-sm min-h-[44px]">
                <Link to="/workouts">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Workouts
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs sm:text-sm min-h-[44px]">
                <Link to="/analytics">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs sm:text-sm min-h-[44px]">
                <Link to="/goals">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Set Goals
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs sm:text-sm min-h-[44px]">
                <Link to="/history">
                  <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  View History
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Daily Metrics Cards */}
        <div className="grid gap-3 sm:gap-6 mb-6 sm:mb-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card className="border-black">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Steps</p>
                  <p className="text-base sm:text-2xl font-bold text-black truncate">{dailyMetrics.steps.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Calories</p>
                  <p className="text-base sm:text-2xl font-bold text-black truncate">{dailyMetrics.calories.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Active Minutes</p>
                  <p className="text-base sm:text-2xl font-bold text-black truncate">{dailyMetrics.activeMinutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Distance</p>
                  <p className="text-base sm:text-2xl font-bold text-black truncate">{dailyMetrics.distance.toFixed(1)} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Workouts</p>
                  <p className="text-base sm:text-2xl font-bold text-black truncate">{dailyMetrics.workouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-12 bg-black text-white"> {/* Applied black background here */}
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm min-h-[44px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="text-xs sm:text-sm min-h-[44px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="text-xs sm:text-sm min-h-[44px] hidden lg:block data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:bg-black data-[state=inactive]:text-white hover:bg-gray-800 hover:text-white"
            >
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Recent Activities */}
              <Card className="border-black">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-black text-lg sm:text-xl">Recent Activities</CardTitle>
                      <CardDescription className="text-sm">Your latest fitness activities</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="border-black text-black hover:bg-black hover:text-white">
                      <Link to="/history">
                        <Activity className="w-4 h-4 mr-1" />
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg min-h-[60px]">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <span className="text-lg sm:text-xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-black text-sm sm:text-base truncate">{activity.type}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{formatDate(activity.date)}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="font-medium text-black text-sm sm:text-base">{activity.duration} min</p>
                            <p className="text-xs sm:text-sm text-gray-600">{activity.calories} cal</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4 text-sm">No recent activities</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress */}
              <Card className="border-black">
                <CardHeader className="pb-4">
                  <CardTitle className="text-black text-lg sm:text-xl">Goal Progress</CardTitle>
                  <CardDescription className="text-sm">Track your fitness goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {goals.length > 0 ? (
                      goals.slice(0, 3).map((goal) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-medium text-black truncate flex-1 mr-2">{goal.name}</span>
                            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                              {goal.current}/{goal.target} {goal.unit}
                            </span>
                          </div>
                          <Progress
                            value={getProgressPercentage(goal.current, goal.target)}
                            className="h-2 bg-gray-300 [&::-webkit-progress-bar]:bg-gray-300 [&::-webkit-progress-value]:bg-black [&::-moz-progress-bar]:bg-black"
                          />
                          <p className="text-xs text-gray-500">
                            {Math.round(getProgressPercentage(goal.current, goal.target))}% complete
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4 text-sm">No goals set</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="border-black">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-black text-lg sm:text-xl">All Activities</CardTitle>
                    <CardDescription className="text-sm">View and manage your fitness activities</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm" className="border-black text-black hover:bg-black hover:text-white">
                    <Link to="/history">
                      <History className="w-4 h-4 mr-1" />
                      View Full History
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-300 rounded-lg space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                          <span className="text-lg sm:text-xl">{getActivityIcon(activity.type)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-black text-sm sm:text-base truncate">{activity.type}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{formatDate(activity.date)}</p>
                            {activity.notes && (
                              <p className="text-xs sm:text-sm text-gray-500 truncate">{activity.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right space-y-1">
                          <p className="font-medium text-black text-sm sm:text-base">{activity.duration} min</p>
                          <p className="text-xs sm:text-sm text-gray-600">{activity.calories} cal</p>
                          {activity.distance && (
                            <p className="text-xs sm:text-sm text-gray-600">{activity.distance} km</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8 text-sm">No activities found</p>
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
