import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Camera,
  Save,
  Edit,
  ArrowLeft,
  Scale,
  Activity,
  Heart,
  Mail,
  MapPin
} from 'lucide-react';

interface UserProfileData {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  height: number; // in cm
  weight: number; // in kg
  phone: string;
  location: string;
  bio: string;
  profilePicture: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | '';
  goals: string[];
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
  };
  healthMetrics: {
    bmi: number;
    bmiCategory: string;
    bmr: number; // Basal Metabolic Rate
    tdee: number; // Total Daily Energy Expenditure
  };
}

export function UserProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: currentUser?.uid || '',
    email: currentUser?.email || '',
    displayName: currentUser?.displayName || '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    height: 0,
    weight: 0,
    phone: '',
    location: '',
    bio: '',
    profilePicture: '',
    fitnessLevel: '',
    goals: [],
    preferences: {
      units: 'metric',
      notifications: true,
      privacy: 'private'
    },
    healthMetrics: {
      bmi: 0,
      bmiCategory: '',
      bmr: 0,
      tdee: 0
    }
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  // Calculate health metrics when height or weight changes
  useEffect(() => {
    if (profileData.height > 0 && profileData.weight > 0) {
      calculateHealthMetrics();
    }
  }, [profileData.height, profileData.weight, profileData.gender, profileData.dateOfBirth]);

  const loadProfileData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // TODO: Load from Firestore
      // For now, use mock data
      const mockData: Partial<UserProfileData> = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        height: 175,
        weight: 70,
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        bio: 'Fitness enthusiast passionate about health and wellness. Love running, strength training, and trying new workout routines.',
        profilePicture: '',
        fitnessLevel: 'intermediate' as const,
        goals: ['Lose Weight', 'Build Muscle', 'Improve Endurance'],
        preferences: {
          units: 'metric' as const,
          notifications: true,
          privacy: 'private' as const
        }
      };

      setProfileData(prev => ({ ...prev, ...mockData }));
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateHealthMetrics = () => {
    const { height, weight, gender, dateOfBirth } = profileData;
    
    if (height <= 0 || weight <= 0) return;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Determine BMI category
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal weight';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    // Calculate BMR using Mifflin-St Jeor Equation
    const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : 30;
    let bmr = 0;
    
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // Use average of male and female calculation
      bmr = (10 * weight + 6.25 * height - 5 * age + 5 + 10 * weight + 6.25 * height - 5 * age - 161) / 2;
    }

    // Calculate TDEE (assuming moderate activity level)
    const tdee = bmr * 1.55;

    setProfileData(prev => ({
      ...prev,
      healthMetrics: {
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
      }
    }));
  };

  const handleInputChange = (field: keyof UserProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: keyof UserProfileData['preferences'], value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // TODO: Save to Firestore
      console.log('Saving profile data:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const availableGoals = [
    'Lose Weight', 'Build Muscle', 'Improve Endurance', 'Increase Strength',
    'Maintain Weight', 'Improve Flexibility', 'Run a Marathon', 'Complete a Triathlon'
  ];

  if (isLoading && !isEditing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
              <h1 className="text-2xl font-bold">User Profile</h1>
            </div>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-white text-black hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveProfile}
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black">
                    {profileData.firstName && profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : profileData.displayName || 'User'
                    }
                  </h2>
                  <p className="text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileData.email}
                  </p>
                  {profileData.location && (
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {profileData.location}
                    </p>
                  )}
                  {profileData.fitnessLevel && (
                    <Badge variant="secondary" className="mt-2">
                      {profileData.fitnessLevel.charAt(0).toUpperCase() + profileData.fitnessLevel.slice(1)} Level
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profileData.gender} 
                      onValueChange={(value: 'male' | 'female' | 'other') => handleInputChange('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Your current health statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileData.height}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min="100"
                      max="250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      disabled={!isEditing}
                      min="30"
                      max="300"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {profileData.healthMetrics.bmi > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Scale className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">BMI</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getBMIColor(profileData.healthMetrics.bmi)}`}>
                          {profileData.healthMetrics.bmi}
                        </span>
                        <p className="text-sm text-gray-600">{profileData.healthMetrics.bmiCategory}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">BMR</span>
                        </div>
                        <span className="font-medium">{profileData.healthMetrics.bmr} cal/day</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">TDEE</span>
                        </div>
                        <span className="font-medium">{profileData.healthMetrics.tdee} cal/day</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fitness Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Fitness Goals</CardTitle>
                <CardDescription>Select your fitness objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableGoals.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={goal}
                        checked={profileData.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        disabled={!isEditing}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={goal} className="text-sm cursor-pointer">
                        {goal}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="units">Measurement Units</Label>
                  <Select 
                    value={profileData.preferences.units} 
                    onValueChange={(value: 'metric' | 'imperial') => handlePreferenceChange('units', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy">Privacy Level</Label>
                  <Select 
                    value={profileData.preferences.privacy} 
                    onValueChange={(value: 'public' | 'private' | 'friends') => handlePreferenceChange('privacy', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={profileData.preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    disabled={!isEditing}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="notifications" className="text-sm cursor-pointer">
                    Enable notifications
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 