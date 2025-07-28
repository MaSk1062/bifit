import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Flame,

  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { addActivity } from '@/lib/firebase'; // Assuming addActivity handles Firestore logic and user ID
import { Timestamp } from 'firebase/firestore'; // Firebase Timestamp for date handling

// Define activity types with consistent icons (emojis for visual appeal in select)
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

export function ActivityLog() {
  const navigate = useNavigate();

  // State variables for form submission status and messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State for form data, initialized with today's date
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    distance: '',
    calories: '',
    date: new Date().toISOString().split('T')[0], // Format date to YYYY-MM-DD
    notes: ''
  });

  // Handles changes to form input fields
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculates estimated calories based on activity type and duration
  const calculateCalories = () => {
    const duration = parseFloat(formData.duration) || 0;

    // Basic calorie calculation (can be improved with more sophisticated formulas)
    let caloriesPerMinute = 0;

    switch (formData.type) {
      case 'running':
        caloriesPerMinute = 11.5;
        break;
      case 'cycling':
        caloriesPerMinute = 8.0;
        break;
      case 'swimming':
        caloriesPerMinute = 9.0;
        break;
      case 'strength_training':
        caloriesPerMinute = 6.0;
        break;
      case 'yoga':
        caloriesPerMinute = 3.0;
        break;
      case 'walking':
        caloriesPerMinute = 4.0;
        break;
      default:
        caloriesPerMinute = 5.0; // Default for 'other' or unlisted activities
    }

    return Math.round(duration * caloriesPerMinute);
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.type || !formData.duration) {
      setErrorMessage('Please fill in all required fields (Activity Type, Duration).');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Hide error after 3 seconds
      return;
    }

    setIsSubmitting(true); // Set submitting state
    setShowError(false); // Clear previous errors

    try {
      // Prepare activity data for Firestore
      const activityData = {
        type: formData.type,
        duration: parseFloat(formData.duration),
        distance: formData.distance ? parseFloat(formData.distance) : undefined, // Only include if provided
        calories: formData.calories ? parseFloat(formData.calories) : calculateCalories(), // Use provided or auto-calculated
        date: Timestamp.fromDate(new Date(formData.date)), // Convert date string to Firestore Timestamp
        notes: formData.notes || undefined // Only include if provided
      };

      // Call the Firebase utility function to add the activity
      await addActivity(activityData);

      setShowSuccess(true); // Show success message
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error adding activity:', error);
      setErrorMessage('Failed to add activity. Please try again.');
      setShowError(true); // Show error message
      setTimeout(() => setShowError(false), 3000); // Hide error after 3 seconds
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Helper function to get the emoji icon for activity type
  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity ? activity.icon : '🎯'; // Default icon if not found
  };

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black rounded-md">
                Log Activity
              </Badge>
            </div>
            <Button asChild variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black rounded-md shadow-sm">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Activity logged successfully! Redirecting to dashboard...</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto"> {/* Increased max-width for better layout */}
          <Card className="border-2 border-gray-200 rounded-xl shadow-xl bg-white"> {/* Enhanced card styling */}
            <CardHeader className="pb-6 bg-gray-50 rounded-t-xl border-b-2 border-gray-200"> {/* Enhanced header */}
              <CardTitle className="flex items-center space-x-3 text-black text-3xl"> {/* Larger title */}
                <Activity className="w-8 h-8" /> {/* Larger icon */}
                <span>Log New Activity</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg mt-2">
                Enter details of your fitness activity below to track your progress and stay motivated.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8"> {/* Increased padding */}
              <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased spacing */}

                {/* Activity Type & Date Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Two columns for type and date */}
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-black font-semibold text-lg">Activity Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-12 text-base">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border-2 border-gray-300 rounded-lg shadow-xl max-h-80">
                        {activityTypes.map((activity) => (
                          <SelectItem key={activity.value} value={activity.value} className="hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-md cursor-pointer h-12">
                            <span className="flex items-center space-x-3 text-base">
                              <span className="text-xl">{activity.icon}</span>
                              <span>{activity.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-black font-semibold text-lg">Date *</Label>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-6 h-6 text-gray-700" /> {/* Larger icon */}
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration, Distance, Calories Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> {/* Three columns for metrics */}
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-black font-semibold text-lg">Duration (minutes) *</Label>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-gray-700" />
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="30"
                        min="1"
                        step="1"
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="distance" className="text-black font-semibold text-lg">Distance (km)</Label>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-6 h-6 text-gray-700" />
                      <Input
                        id="distance"
                        type="number"
                        value={formData.distance}
                        onChange={(e) => handleInputChange('distance', e.target.value)}
                        placeholder="5.0"
                        min="0"
                        step="0.1"
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="calories" className="text-black font-semibold text-lg">Calories Burned</Label>
                    <div className="flex items-center space-x-3">
                      <Flame className="w-6 h-6 text-gray-700" />
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleInputChange('calories', e.target.value)}
                        placeholder={formData.type && formData.duration ? calculateCalories().toString() : "Auto-calculated"}
                        min="0"
                        step="1"
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-black font-semibold text-lg">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about your activity, how you felt, weather conditions, etc..."
                    rows={4}
                    className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black text-base resize-none"
                  />
                </div>

                {/* Activity Preview */}
                {formData.type && (
                  <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Activity Preview</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl mb-1">{getActivityIcon(formData.type)}</div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-semibold text-black capitalize">{formData.type}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl mb-1">⏱️</div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold text-black">{formData.duration || 0} min</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl mb-1">🔥</div>
                        <p className="text-sm text-gray-600">Calories</p>
                        <p className="font-semibold text-black">{formData.calories || calculateCalories()} cal</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-2xl mb-1">📅</div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-black">{formData.date || 'Today'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 border-2 border-gray-300 text-black hover:bg-gray-50 rounded-lg text-base font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.type || !formData.duration}
                    className="px-8 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 rounded-lg text-base font-medium shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Logging Activity...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5 mr-2" />
                        Log Activity
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
