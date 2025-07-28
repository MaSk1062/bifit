import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Target as TargetIcon
} from 'lucide-react';

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
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [isLoading, setIsLoading] = useState(false);
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

  // Load analytics data on component mount and time range change
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // TODO: Load from Firestore
      // For now, generate mock data based on time range
      const mockData = generateMockAnalyticsData(timeRange);
      setAnalyticsData(mockData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyticsData = (range: string): AnalyticsData => {
    const days = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 90 : 365;
    const activities: ActivityData[] = [];
    const trends: TrendData[] = [];
    
    // Generate mock activities and trends
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random activity data
      const activityCount = Math.floor(Math.random() * 3) + 1;
      let dailyCalories = 0;
      let dailyDistance = 0;
      let dailyDuration = 0;
      
      for (let j = 0; j < activityCount; j++) {
        const activity: ActivityData = {
          id: `${dateStr}-${j}`,
          type: ['Running', 'Cycling', 'Strength Training', 'Walking', 'Swimming'][Math.floor(Math.random() * 5)],
          date: dateStr,
          duration: Math.floor(Math.random() * 60) + 30,
          distance: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : undefined,
          calories: Math.floor(Math.random() * 400) + 100,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        };
        activities.push(activity);
        dailyCalories += activity.calories;
        dailyDistance += activity.distance || 0;
        dailyDuration += activity.duration;
      }
      
      trends.push({
        date: dateStr,
        calories: dailyCalories,
        distance: dailyDistance,
        duration: dailyDuration,
        activities: activityCount
      });
    }

    const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

    return {
      timeRange,
      activities,
      goals: [
        {
          id: '1',
          name: 'Daily Steps',
          target: 10000,
          current: Math.floor(Math.random() * 12000) + 8000,
          unit: 'steps',
          type: 'daily',
          progress: Math.floor(Math.random() * 100),
          status: ['on-track', 'ahead', 'behind'][Math.floor(Math.random() * 3)] as 'on-track' | 'ahead' | 'behind'
        },
        {
          id: '2',
          name: 'Weekly Workouts',
          target: 5,
          current: Math.floor(Math.random() * 7) + 3,
          unit: 'workouts',
          type: 'weekly',
          progress: Math.floor(Math.random() * 100),
          status: ['on-track', 'ahead', 'behind'][Math.floor(Math.random() * 3)] as 'on-track' | 'ahead' | 'behind'
        },
        {
          id: '3',
          name: 'Monthly Distance',
          target: 100,
          current: Math.floor(Math.random() * 150) + 50,
          unit: 'km',
          type: 'monthly',
          progress: Math.floor(Math.random() * 100),
          status: ['on-track', 'ahead', 'behind'][Math.floor(Math.random() * 3)] as 'on-track' | 'ahead' | 'behind'
        }
      ],
      performance: {
        totalActivities: activities.length,
        totalCalories,
        totalDistance,
        totalDuration,
        averageCaloriesPerDay: Math.round(totalCalories / days),
        averageDistancePerDay: Math.round((totalDistance / days) * 10) / 10,
        averageDurationPerDay: Math.round(totalDuration / days),
        mostActiveDay: trends.reduce((max, t) => t.calories > max.calories ? t : max).date,
        longestStreak: Math.floor(Math.random() * 15) + 5,
        currentStreak: Math.floor(Math.random() * 10) + 1,
        improvementRate: Math.floor(Math.random() * 30) + 5
      },
      trends,
      insights: [
        {
          id: '1',
          type: 'achievement',
          title: 'New Personal Record!',
          description: 'You achieved your highest daily calorie burn this week',
          value: '2,450 cal',
          icon: '🏆',
          priority: 'high'
        },
        {
          id: '2',
          type: 'trend',
          title: 'Consistent Progress',
          description: 'You\'ve maintained a 7-day workout streak',
          value: '7 days',
          icon: '📈',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'suggestion',
          title: 'Try New Activities',
          description: 'Adding variety to your workouts can improve results',
          icon: '💡',
          priority: 'low'
        },
        {
          id: '4',
          type: 'warning',
          title: 'Rest Day Needed',
          description: 'Consider taking a rest day to prevent overtraining',
          icon: '⚠️',
          priority: 'medium'
        }
      ]
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600';
      case 'behind': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="w-4 h-4" />;
      case 'behind': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };



  const exportAnalytics = async () => {
    try {
      // TODO: Implement analytics export
      console.log('Exporting analytics data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Analytics exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Advanced Analytics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32 bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnalyticsData} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAnalytics} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Performance Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Activities</p>
                    <p className="text-2xl font-bold text-black">{analyticsData.performance.totalActivities}</p>
                  </div>
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Calories</p>
                    <p className="text-2xl font-bold text-black">{analyticsData.performance.totalCalories.toLocaleString()}</p>
                  </div>
                  <Flame className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-2xl font-bold text-black">{analyticsData.performance.totalDistance} km</p>
                  </div>
                  <Footprints className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Duration</p>
                    <p className="text-2xl font-bold text-black">{analyticsData.performance.totalDuration}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Activity Trends</span>
                </CardTitle>
                <CardDescription>Your activity patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trends.slice(-7).map((trend) => (
                    <div key={trend.date} className="flex items-center space-x-4">
                      <div className="w-20 text-sm text-gray-600">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{trend.calories} cal</span>
                          <span className="text-xs text-gray-500">{trend.activities} activities</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-black h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(trend.calories / Math.max(...analyticsData.trends.map(t => t.calories))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TargetIcon className="w-5 h-5" />
                  <span>Insights</span>
                </CardTitle>
                <CardDescription>AI-powered fitness insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.insights.map((insight) => (
                    <div key={insight.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{insight.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-black text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                          {insight.value && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {insight.value}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Goal Progress</span>
                </CardTitle>
                <CardDescription>Track your fitness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">{goal.name}</span>
                          {getStatusIcon(goal.status)}
                        </div>
                        <span className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{goal.progress}% complete</span>
                        <span>{goal.type} goal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Calories/Day</p>
                      <p className="text-xl font-bold text-black">{analyticsData.performance.averageCaloriesPerDay}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Distance/Day</p>
                      <p className="text-xl font-bold text-black">{analyticsData.performance.averageDistancePerDay} km</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Current Streak</p>
                      <p className="text-xl font-bold text-black">{analyticsData.performance.currentStreak} days</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Improvement Rate</p>
                      <p className="text-xl font-bold text-black">+{analyticsData.performance.improvementRate}%</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Most Active Day</p>
                    <p className="font-medium text-black">
                      {new Date(analyticsData.performance.mostActiveDay).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Activity Breakdown</span>
              </CardTitle>
              <CardDescription>Detailed activity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Activity Type</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Count</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Total Duration</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Total Calories</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Avg Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      analyticsData.activities.reduce((acc, activity) => {
                        if (!acc[activity.type]) {
                          acc[activity.type] = { count: 0, duration: 0, calories: 0, intensities: [] };
                        }
                        acc[activity.type].count++;
                        acc[activity.type].duration += activity.duration;
                        acc[activity.type].calories += activity.calories;
                        acc[activity.type].intensities.push(activity.intensity);
                        return acc;
                      }, {} as Record<string, { count: number; duration: number; calories: number; intensities: string[] }>)
                    ).map(([type, data]) => (
                      <tr key={type} className="border-b border-gray-100">
                        <td className="py-2 text-sm font-medium text-black">{type}</td>
                        <td className="py-2 text-sm text-gray-600">{data.count}</td>
                        <td className="py-2 text-sm text-gray-600">{data.duration} min</td>
                        <td className="py-2 text-sm text-gray-600">{data.calories.toLocaleString()}</td>
                        <td className="py-2 text-sm text-gray-600">
                          {data.intensities.reduce((acc, intensity) => {
                            if (intensity === 'high') return acc + 3;
                            if (intensity === 'medium') return acc + 2;
                            return acc + 1;
                          }, 0) / data.intensities.length > 2 ? 'High' : 
                           data.intensities.reduce((acc, intensity) => {
                             if (intensity === 'high') return acc + 3;
                             if (intensity === 'medium') return acc + 2;
                             return acc + 1;
                           }, 0) / data.intensities.length > 1.5 ? 'Medium' : 'Low'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 