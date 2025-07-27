import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Target, 
  Clock, 
  Flame, 
  Footprints,
  ArrowLeft,
  Save,
  Calendar,
  MapPin
} from 'lucide-react';

// Activity types with their icons and calorie multipliers
const activityTypes = [
  { value: 'running', label: 'Running', icon: <Footprints className="w-4 h-4" />, calorieMultiplier: 10 },
  { value: 'cycling', label: 'Cycling', icon: <Activity className="w-4 h-4" />, calorieMultiplier: 8 },
  { value: 'strength-training', label: 'Strength Training', icon: <Target className="w-4 h-4" />, calorieMultiplier: 6 },
  { value: 'swimming', label: 'Swimming', icon: <Activity className="w-4 h-4" />, calorieMultiplier: 9 },
  { value: 'walking', label: 'Walking', icon: <Footprints className="w-4 h-4" />, calorieMultiplier: 4 },
  { value: 'yoga', label: 'Yoga', icon: <Activity className="w-4 h-4" />, calorieMultiplier: 3 },
  { value: 'hiit', label: 'HIIT', icon: <Activity className="w-4 h-4" />, calorieMultiplier: 12 },
  { value: 'pilates', label: 'Pilates', icon: <Activity className="w-4 h-4" />, calorieMultiplier: 4 }
];

interface ActivityFormData {
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: string;
  time: string;
  location: string;
  notes: string;
  intensity: 'low' | 'medium' | 'high';
}

interface FormErrors {
  type?: string;
  duration?: string;
  distance?: string;
  notes?: string;
}

export function ActivityLog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ActivityFormData>({
    type: '',
    duration: 0,
    distance: 0,
    calories: 0,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    location: '',
    notes: '',
    intensity: 'medium'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate calories based on activity type and duration
  const calculateCalories = (type: string, duration: number, intensity: string) => {
    const activity = activityTypes.find(a => a.value === type);
    if (!activity) return 0;

    let multiplier = activity.calorieMultiplier;
    if (intensity === 'high') multiplier *= 1.3;
    if (intensity === 'low') multiplier *= 0.7;

    return Math.round(duration * multiplier);
  };

  const handleInputChange = (field: keyof ActivityFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate calories when type, duration, or intensity changes
      if (field === 'type' || field === 'duration' || field === 'intensity') {
        newData.calories = calculateCalories(
          newData.type, 
          newData.duration, 
          newData.intensity
        );
      }
      
      return newData;
    });

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.type) {
      newErrors.type = 'Activity type is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.duration > 480) { // 8 hours max
      newErrors.duration = 'Duration cannot exceed 8 hours';
    }

    if (formData.distance && formData.distance < 0) {
      newErrors.distance = 'Distance cannot be negative';
    }

    if (formData.distance && formData.distance > 1000) { // 1000 km max
      newErrors.distance = 'Distance cannot exceed 1000 km';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Save to Firestore
      console.log('Saving activity:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving activity:', error);
      setErrors({ notes: 'Failed to save activity. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActivity = activityTypes.find(a => a.value === formData.type);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
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
            <h1 className="text-2xl font-bold">Log Activity</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Log New Activity</span>
              </CardTitle>
              <CardDescription>
                Track your fitness activity with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Activity Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((activity) => (
                        <SelectItem key={activity.value} value={activity.value}>
                          <div className="flex items-center space-x-2">
                            {activity.icon}
                            <span>{activity.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                {/* Duration and Distance */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="480"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                        className="pl-10"
                        placeholder="30"
                      />
                    </div>
                    {errors.duration && (
                      <p className="text-sm text-red-500">{errors.duration}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="distance"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.distance}
                        onChange={(e) => handleInputChange('distance', parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        placeholder="5.2"
                      />
                    </div>
                    {errors.distance && (
                      <p className="text-sm text-red-500">{errors.distance}</p>
                    )}
                  </div>
                </div>

                {/* Intensity and Calories */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="intensity">Intensity</Label>
                    <Select value={formData.intensity} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('intensity', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Burned</Label>
                    <div className="relative">
                      <Flame className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
                        className="pl-10"
                        placeholder="Calculated automatically"
                      />
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Gym, Park, Home, etc."
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="How did you feel? Any achievements or challenges?"
                    rows={3}
                  />
                </div>

                {/* Activity Preview */}
                {selectedActivity && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedActivity.icon}
                          <div>
                            <h3 className="font-medium text-black">{selectedActivity.label}</h3>
                            <p className="text-sm text-gray-600">
                              {formData.duration} minutes • {formData.intensity} intensity
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-black">{formData.calories}</p>
                          <p className="text-sm text-gray-600">calories</p>
                        </div>
                      </div>
                      {formData.distance && (
                        <div className="mt-2 flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formData.distance} km</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Activity
                      </>
                    )}
                  </Button>
                </div>

                {errors.notes && (
                  <p className="text-sm text-red-500 text-center">{errors.notes}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 