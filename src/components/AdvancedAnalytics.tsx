import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MobileHeader } from '@/components/MobileHeader';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Activity,
  Flame,
  Footprints,
  Clock,
  ArrowLeft,
  Download,
  RefreshCw,
  Target as TargetIcon,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 

  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Link } from 'react-router-dom';

interface AnalyticsData {
  timeRange: '7days' | '30days' | '90days' | '1year';
  activities: ActivityData[];
  goals: GoalData[];
  performance: PerformanceMetrics;
  trends: TrendData[];
  insights: InsightData[];
}

interface ActivityData {
  id: string;
  type: string;
  date: string;
  duration: number;
  distance?: number;
  calories: number;
  intensity: 'low' | 'medium' | 'high';
}

interface GoalData {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  status: 'on-track' | 'ahead' | 'behind';
}

interface PerformanceMetrics {
  totalActivities: number;
  totalCalories: number;
  totalDistance: number;
  totalDuration: number;
  averageCaloriesPerDay: number;
  averageDistancePerDay: number;
  averageDurationPerDay: number;
  mostActiveDay: string;
  longestStreak: number;
  currentStreak: number;
  improvementRate: number;
}

interface TrendData {
  date: string;
  calories: number;
  distance: number;
  duration: number;
  activities: number;
}

interface InsightData {
  id: string;
  type: 'achievement' | 'trend' | 'suggestion' | 'warning';
  title: string;
  description: string;
  value?: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export function AdvancedAnalytics() {

  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    timeRange: '30days',
    activities: [],
    goals: [],
    performance: {
      totalActivities: 0,
      totalCalories: 0,
      totalDistance: 0,
      totalDuration: 0,
      averageCaloriesPerDay: 0,
      averageDistancePerDay: 0,
      averageDurationPerDay: 0,
      mostActiveDay: '',
      longestStreak: 0,
      currentStreak: 0,
      improvementRate: 0
    },
    trends: [],
    insights: []
  });

  // Load analytics data from Firestore
  const loadAnalyticsData = async () => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch activities for the selected time range
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        where('userId', '==', currentUser.uid),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);

      const activitiesData: ActivityData[] = [];
      activitiesSnapshot.forEach(doc => {
        const data = doc.data();
        activitiesData.push({
          id: doc.id,
          type: data.type,
          date: data.date.toDate().toISOString().split('T')[0],
          duration: data.duration,
          distance: data.distance,
          calories: data.calories,
          intensity: data.duration > 60 ? 'high' : data.duration > 30 ? 'medium' : 'low'
        });
      });

      // Fetch goals
      const goalsRef = collection(db, 'goals');
      const goalsQuery = query(
        goalsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);

      const goalsData: GoalData[] = [];
      goalsSnapshot.forEach(doc => {
        const data = doc.data();
        const progress = data.target > 0 ? (data.current / data.target) * 100 : 0;
        let status: 'on-track' | 'ahead' | 'behind' = 'on-track';
        
        if (data.targetDate) {
          const targetDate = data.targetDate.toDate();
          const daysLeft = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const expectedProgress = Math.max(0, ((data.type === 'daily' ? 1 : data.type === 'weekly' ? 7 : 30) - daysLeft) / (data.type === 'daily' ? 1 : data.type === 'weekly' ? 7 : 30)) * 100;
          
          if (progress > expectedProgress + 10) status = 'ahead';
          else if (progress < expectedProgress - 10) status = 'behind';
        }

        goalsData.push({
          id: doc.id,
          name: data.name,
          target: data.target,
          current: data.current,
          unit: data.unit,
          type: data.type,
          progress,
          status
        });
      });

      // Calculate performance metrics
      const totalActivities = activitiesData.length;
      const totalCalories = activitiesData.reduce((sum, activity) => sum + activity.calories, 0);
      const totalDistance = activitiesData.reduce((sum, activity) => sum + (activity.distance || 0), 0);
      const totalDuration = activitiesData.reduce((sum, activity) => sum + activity.duration, 0);
      
      const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const averageCaloriesPerDay = daysInRange > 0 ? totalCalories / daysInRange : 0;
      const averageDistancePerDay = daysInRange > 0 ? totalDistance / daysInRange : 0;
      const averageDurationPerDay = daysInRange > 0 ? totalDuration / daysInRange : 0;

      // Calculate trends (group by date)
      const trendsMap = new Map<string, { calories: number; distance: number; duration: number; activities: number }>();
      activitiesData.forEach(activity => {
        const date = activity.date;
        const existing = trendsMap.get(date) || { calories: 0, distance: 0, duration: 0, activities: 0 };
        trendsMap.set(date, {
          calories: existing.calories + activity.calories,
          distance: existing.distance + (activity.distance || 0),
          duration: existing.duration + activity.duration,
          activities: existing.activities + 1
        });
      });

      const trends: TrendData[] = Array.from(trendsMap.entries()).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate insights
      const insights: InsightData[] = [];
      
      // Activity streak insight
      if (totalActivities > 0) {
        insights.push({
          id: 'activity-streak',
          type: 'achievement',
          title: 'Active Lifestyle',
          description: `You've completed ${totalActivities} activities in the last ${timeRange === '7days' ? 'week' : timeRange === '30days' ? 'month' : timeRange === '90days' ? '3 months' : 'year'}`,
          value: `${totalActivities} activities`,
          icon: '🏃‍♂️',
          priority: 'medium'
        });
      }

      // Calorie burn insight
      if (averageCaloriesPerDay > 300) {
        insights.push({
          id: 'calorie-burn',
          type: 'achievement',
          title: 'High Calorie Burn',
          description: `You're burning an average of ${Math.round(averageCaloriesPerDay)} calories per day`,
          value: `${Math.round(averageCaloriesPerDay)} cal/day`,
          icon: '🔥',
          priority: 'high'
        });
      }

      // Goal progress insights
      goalsData.forEach(goal => {
        if (goal.progress >= 100) {
          insights.push({
            id: `goal-${goal.id}`,
            type: 'achievement',
            title: 'Goal Achieved!',
            description: `Congratulations! You've reached your ${goal.name} goal`,
            value: `${goal.current}/${goal.target} ${goal.unit}`,
            icon: '🎯',
            priority: 'high'
          });
        } else if (goal.status === 'behind') {
          insights.push({
            id: `goal-${goal.id}`,
            type: 'warning',
            title: 'Goal Behind Schedule',
            description: `Your ${goal.name} goal is behind schedule. Consider increasing your efforts.`,
            value: `${Math.round(goal.progress)}% complete`,
            icon: '⚠️',
            priority: 'medium'
          });
        }
      });

      // Most active day calculation
      const dayActivityCount = new Map<string, number>();
      activitiesData.forEach(activity => {
        const day = new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayActivityCount.set(day, (dayActivityCount.get(day) || 0) + 1);
      });
      
      let mostActiveDay = '';
      let maxActivities = 0;
      dayActivityCount.forEach((count, day) => {
        if (count > maxActivities) {
          maxActivities = count;
          mostActiveDay = day;
        }
      });

      setAnalyticsData({
        timeRange,
        activities: activitiesData,
        goals: goalsData,
        performance: {
          totalActivities,
          totalCalories,
          totalDistance,
          totalDuration,
          averageCaloriesPerDay,
          averageDistancePerDay,
          averageDurationPerDay,
          mostActiveDay,
          longestStreak: 0, // Would need more complex calculation
          currentStreak: 0, // Would need more complex calculation
          improvementRate: 0 // Would need historical comparison
        },
        trends,
        insights
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Fallback to empty data
      setAnalyticsData({
        timeRange,
        activities: [],
        goals: [],
        performance: {
          totalActivities: 0,
          totalCalories: 0,
          totalDistance: 0,
          totalDuration: 0,
          averageCaloriesPerDay: 0,
          averageDistancePerDay: 0,
          averageDurationPerDay: 0,
          mostActiveDay: '',
          longestStreak: 0,
          currentStreak: 0,
          improvementRate: 0
        },
        trends: [],
        insights: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currentUser?.uid, timeRange]);



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'behind': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <TargetIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const exportAnalytics = async () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <MobileHeader title="Analytics" showBackButton onBack={() => window.history.back()} />
      
      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black">
                Advanced Analytics
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button onClick={exportAnalytics} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">Analytics Overview</h2>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={(value: '7days' | '30days' | '90days' | '1year') => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnalyticsData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-black">{analyticsData.performance.totalActivities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Total Calories</p>
                  <p className="text-2xl font-bold text-black">{analyticsData.performance.totalCalories.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Footprints className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-black">{analyticsData.performance.totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-black">{analyticsData.performance.totalDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Averages */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Daily Averages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Calories</span>
                <span className="font-semibold text-black">{Math.round(analyticsData.performance.averageCaloriesPerDay)} cal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Distance</span>
                <span className="font-semibold text-black">{analyticsData.performance.averageDistancePerDay.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-black">{Math.round(analyticsData.performance.averageDurationPerDay)} min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Most Active Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-black">{analyticsData.performance.mostActiveDay || 'N/A'}</p>
                <p className="text-sm text-gray-600 mt-2">Based on activity frequency</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analyticsData.activities.length > 0 ? (
                  Array.from(new Set(analyticsData.activities.map(a => a.type))).slice(0, 3).map(type => {
                    const count = analyticsData.activities.filter(a => a.type === type).length;
                    const percentage = (count / analyticsData.activities.length) * 100;
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{type}</span>
                        <span className="text-sm font-semibold text-black">{Math.round(percentage)}%</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No activities recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Progress */}
        {analyticsData.goals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Goal Progress</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analyticsData.goals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-black">{goal.name}</h4>
                      {getStatusIcon(goal.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-black">{Math.round(goal.progress)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{goal.current} {goal.unit}</span>
                        <span>{goal.target} {goal.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {analyticsData.insights.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Insights & Recommendations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analyticsData.insights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${
                  insight.type === 'achievement' ? 'border-l-green-500' :
                  insight.type === 'warning' ? 'border-l-red-500' :
                  insight.type === 'suggestion' ? 'border-l-blue-500' :
                  'border-l-yellow-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-black mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.value && (
                          <Badge variant="outline" className="text-xs">
                            {insight.value}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {analyticsData.activities.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-black mb-4">Recent Activities</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analyticsData.activities.slice(0, 6).map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-black capitalize">{activity.type}</h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.intensity}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="text-black">{activity.duration} min</span>
                      </div>
                      {activity.distance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance</span>
                          <span className="text-black">{activity.distance} km</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calories</span>
                        <span className="text-black">{activity.calories} cal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="text-black">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {analyticsData.activities.length === 0 && analyticsData.goals.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              Start logging activities and setting goals to see your analytics here.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link to="/activity/new">
                  <Activity className="w-4 h-4 mr-2" />
                  Log Activity
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/goals">
                  <Target className="w-4 h-4 mr-2" />
                  Set Goals
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 