import { useState, useEffect } from 'react';
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
  Calendar, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Activity,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  weight: number;
  location: string;
  bio: string;
  fitnessLevel: string;
  primaryGoal: string;
  dailySteps: number;
  targetWeight: number;
  targetCalories: number;
  profilePicture: string;
  createdAt: Date;
  updatedAt: Date;
}

export function UserProfile() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    height: 0,
    weight: 0,
    location: '',
    bio: '',
    fitnessLevel: '',
    primaryGoal: '',
    dailySteps: 0,
    targetWeight: 0,
    targetCalories: 0,
    profilePicture: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Load profile data from Firestore
  const loadProfileData = async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
             if (userDoc.exists()) {
         const data = userDoc.data();
         setProfileData({
           ...data,
           email: currentUser.email || data.email,
           createdAt: data.createdAt?.toDate?.() || new Date(),
           updatedAt: data.updatedAt?.toDate?.() || new Date()
         } as UserProfileData);
       } else {
        // Create new profile if it doesn't exist
        const newProfile: UserProfileData = {
          firstName: '',
          lastName: '',
          email: currentUser.email || '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          height: 0,
          weight: 0,
          location: '',
          bio: '',
          fitnessLevel: '',
          primaryGoal: '',
          dailySteps: 0,
          targetWeight: 0,
          targetCalories: 0,
          profilePicture: '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(userDocRef, newProfile);
        setProfileData(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser?.uid]);

  // Save profile data to Firestore
  const saveProfileData = async () => {
    if (!currentUser?.uid) return;

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        ...profileData,
        updatedAt: new Date()
      };
      
      await updateDoc(userDocRef, updatedData);
      setProfileData(updatedData);
      setIsEditing(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMI = () => {
    if (profileData.height > 0 && profileData.weight > 0) {
      const heightInMeters = profileData.height / 100;
      return (profileData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const calculateBMR = () => {
    if (profileData.height > 0 && profileData.weight > 0 && profileData.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
      if (profileData.gender === 'male') {
        return Math.round(88.362 + (13.397 * profileData.weight) + (4.799 * profileData.height) - (5.677 * age));
      } else {
        return Math.round(447.593 + (9.247 * profileData.weight) + (3.098 * profileData.height) - (4.330 * age));
      }
    }
    return 'N/A';
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return 'N/A';
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading profile...</span>
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
                Profile
              </Badge>
            </div>
            <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Link to="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Profile Overview</CardTitle>
                <CardDescription>Your basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-black">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {profileData.location || 'Location not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {profileData.fitnessLevel || 'Fitness level not set'}
                    </span>
                  </div>
                </div>

                {profileData.bio && (
                  <div>
                    <p className="text-sm text-gray-600">{profileData.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-black">Health Metrics</CardTitle>
                <CardDescription>Your current health statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-black">{profileData.weight || 0} kg</p>
                    <p className="text-sm text-gray-600">Current Weight</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-black">{profileData.height || 0} cm</p>
                    <p className="text-sm text-gray-600">Height</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">BMI</span>
                    <div className="text-right">
                      <span className="font-medium text-black">{calculateBMI()}</span>
                      <Badge variant="outline" className="ml-2">
                        {getBMICategory(calculateBMI())}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">BMR</span>
                    <span className="font-medium text-black">{calculateBMR()} cal/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Steps</span>
                    <span className="font-medium text-black">{profileData.dailySteps.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-black">Profile Information</CardTitle>
                    <CardDescription>Update your personal and fitness information</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={saveProfileData} 
                          disabled={isSaving}
                          className="bg-black hover:bg-gray-800"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-black">Personal Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

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
                        onValueChange={(value) => handleInputChange('gender', value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>

                  {/* Fitness Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-black">Fitness Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={profileData.height || ''}
                        onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your height"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Current Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={profileData.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your weight"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        value={profileData.targetWeight || ''}
                        onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your target weight"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailySteps">Daily Steps Goal</Label>
                      <Input
                        id="dailySteps"
                        type="number"
                        value={profileData.dailySteps || ''}
                        onChange={(e) => handleInputChange('dailySteps', parseInt(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your daily steps goal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCalories">Daily Calorie Goal</Label>
                      <Input
                        id="targetCalories"
                        type="number"
                        value={profileData.targetCalories || ''}
                        onChange={(e) => handleInputChange('targetCalories', parseInt(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="Enter your daily calorie goal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fitnessLevel">Fitness Level</Label>
                      <Select
                        value={profileData.fitnessLevel}
                        onValueChange={(value) => handleInputChange('fitnessLevel', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryGoal">Primary Goal</Label>
                      <Select
                        value={profileData.primaryGoal}
                        onValueChange={(value) => handleInputChange('primaryGoal', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself and your fitness journey..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 