import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileHeader } from '@/components/MobileHeader';
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Flame,
  ArrowLeft,
  Loader2,
  Trash2,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteActivity } from '@/lib/firebase';

interface UserActivity {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: Timestamp;
  notes?: string;
  userId: string;
}

const activityTypes = [
  { value: 'running', label: 'Running', icon: '🏃‍♂️' },
  { value: 'cycling', label: 'Cycling', icon: '🚴‍♂️' },
  { value: 'swimming', label: 'Swimming', icon: '🏊‍♂️' },
  { value: 'strength_training', label: 'Strength Training', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
  { value: 'walking', label: 'Walking', icon: '🚶‍♂️' },
  { value: 'hiking', label: 'Hiking', icon: '🏔️' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { value: 'dancing', label: 'Dancing', icon: '💃' },
  { value: 'boxing', label: 'Boxing', icon: '🥊' },
  { value: 'martial_arts', label: 'Martial Arts', icon: '🥋' },
  { value: 'pilates', label: 'Pilates', icon: '🧘‍♂️' },
  { value: 'crossfit', label: 'CrossFit', icon: '🏋️‍♂️' },
  { value: 'rowing', label: 'Rowing', icon: '🚣‍♂️' },
  { value: 'elliptical', label: 'Elliptical', icon: '🏃‍♀️' },
  { value: 'stair_climbing', label: 'Stair Climbing', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '🎯' }
];

export function History() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load activities from Firestore
  const loadActivities = async () => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const activitiesRef = collection(db, 'activities');
      const activitiesQuery = query(
        activitiesRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(100) // Limit to last 100 activities
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesData: UserActivity[] = [];
      
      activitiesSnapshot.forEach(doc => {
        const data = doc.data();
        activitiesData.push({
          id: doc.id,
          ...data,
          date: data.date,
        } as UserActivity);
      });
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
      setErrorMessage('Failed to load activities');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [currentUser?.uid]);

  const handleDeleteActivity = async (activityId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this activity?');

    if (!isConfirmed) return;

    try {
      await deleteActivity(activityId);
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
      setErrorMessage('Failed to delete activity');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity ? activity.icon : '🎯';
  };

  const getActivityLabel = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity ? activity.label : 'Other';
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
  };

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    return distance >= 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} m`;
  };

  // Filter activities based on type and search term
  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesSearch = searchTerm === '' || 
      getActivityLabel(activity.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.notes && activity.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-inter">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Mobile Header */}
      <MobileHeader title="Activity History" showBackButton onBack={() => window.history.back()} />
      
      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black text-xs sm:text-sm">
                Activity History
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs w-full sm:w-auto">
                <Link to="/dashboard">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm text-xs w-full sm:w-auto">
                <Link to="/activity/new">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Log Activity
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
        {/* Error Message */}
        {showError && (
          <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-black font-medium text-sm sm:text-base">{errorMessage}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="border-black rounded-lg shadow-lg mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-black text-lg sm:text-xl">
              <Filter className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {/* Activity Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Activity Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-black focus:ring-black text-sm"
                >
                  <option value="all">All Activities</option>
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:border-black focus:ring-black text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card className="border-black rounded-lg shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-black text-lg sm:text-xl">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Activity History</span>
              <Badge variant="outline" className="bg-white text-black border-black text-xs sm:text-sm">
                {filteredActivities.length} activities
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Your fitness journey timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-black mb-2">
                  {activities.length === 0 ? 'No activities yet' : 'No activities match your filters'}
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  {activities.length === 0 
                    ? 'Start by logging your first activity' 
                    : 'Try adjusting your filters or search terms'
                  }
                </p>
                {activities.length === 0 && (
                  <Button asChild className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm text-sm sm:text-base px-6 py-2">
                    <Link to="/activity/new">
                      <Activity className="w-4 h-4 mr-2" />
                      Log Your First Activity
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 sm:p-6 border border-black rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                          <h3 className="font-medium text-black text-base sm:text-lg">
                            {getActivityLabel(activity.type)}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(activity.date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(activity.date)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(activity.duration)}</span>
                          </span>
                          {activity.distance && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{formatDistance(activity.distance)}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Flame className="w-3 h-3" />
                            <span>{activity.calories} cal</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {activity.notes && (
                      <p className="text-sm text-gray-600 mt-3 text-xs sm:text-sm italic">
                        "{activity.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 