import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MobileHeader } from '@/components/MobileHeader';
import {
  User,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Activity,
  Loader2,
  CheckCircle,
  Phone, // Added Phone icon
  Ruler, // Added Ruler icon for height
  Scale, // Added Scale icon for weight
  Target, // Added Target icon for goals
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming db is already configured here

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
    if (!currentUser?.uid) {
      setIsLoading(false); // Stop loading if no user is logged in
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          ...data,
          email: currentUser.email || data.email, // Ensure email is from auth if available
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
          profilePicture: '', // Default empty string
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(userDocRef, newProfile);
        setProfileData(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [currentUser?.uid]); // Reload when current user changes

  // Save profile data to Firestore
  const saveProfileData = async () => {
    if (!currentUser?.uid) return;

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedData = {
        ...profileData,
        updatedAt: new Date() // Update timestamp on save
      };

      // Ensure that Date objects are converted to Firestore Timestamps before saving
      const dataToSave = {
        ...updatedData,
        createdAt: updatedData.createdAt,
        updatedAt: updatedData.updatedAt,
      };
      
      await updateDoc(userDocRef, dataToSave);
      setProfileData(updatedData); // Update local state with the saved data
      setIsEditing(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile data:', error);
      // Optionally show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  // Generic input change handler for all form fields
  const handleInputChange = (field: keyof UserProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate Body Mass Index (BMI)
  const calculateBMI = () => {
    if (profileData.height > 0 && profileData.weight > 0) {
      const heightInMeters = profileData.height / 100;
      return (profileData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (profileData.height > 0 && profileData.weight > 0 && profileData.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
      if (profileData.gender === 'male') {
        return Math.round(10 * profileData.weight + 6.25 * profileData.height - 5 * age + 5);
      } else if (profileData.gender === 'female') {
        return Math.round(10 * profileData.weight + 6.25 * profileData.height - 5 * age - 161);
      }
    }
    return 'N/A';
  };

  // Determine BMI category
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
    <div className="min-h-screen bg-white font-inter">
      {/* Mobile Header */}
      <MobileHeader title="Profile" showBackButton onBack={() => window.history.back()} />
      
      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black rounded-md shadow-sm">
                Profile
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

      <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border-black rounded-lg shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-black text-xl">Profile Overview</CardTitle>
                <CardDescription className="text-gray-600">Your basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6"> {/* Increased spacing */}
                <div className="flex flex-col items-center space-y-4"> {/* Centered profile pic and name */}
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-black overflow-hidden">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/E0E0E0/6B7280?text=User'; }} // Fallback image
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-black text-xl">
                      {profileData.firstName || 'New'} {profileData.lastName || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      {profileData.phone || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      {profileData.location || 'Location not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      Fitness Level: {profileData.fitnessLevel || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      Primary Goal: {profileData.primaryGoal || 'Not set'}
                    </span>
                  </div>
                </div>

                {profileData.bio && (
                  <div>
                    <h4 className="font-semibold text-black mb-1">Bio:</h4>
                    <p className="text-sm text-gray-600 italic">{profileData.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card className="mt-6 border-black rounded-lg shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-black text-xl">Health Metrics</CardTitle>
                <CardDescription className="text-gray-600">Your current health statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Scale className="w-6 h-6 text-black mx-auto mb-1" />
                    <p className="text-2xl font-bold text-black">{profileData.weight || 0} kg</p>
                    <p className="text-sm text-gray-600">Current Weight</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Ruler className="w-6 h-6 text-black mx-auto mb-1" />
                    <p className="text-2xl font-bold text-black">{profileData.height || 0} cm</p>
                    <p className="text-sm text-gray-600">Height</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">BMI</span>
                    <div className="text-right flex items-center">
                      <span className="font-medium text-black">{calculateBMI()}</span>
                      <Badge variant="outline" className="ml-2 bg-black text-white border-black rounded-full px-3 py-1 text-xs">
                        {getBMICategory(calculateBMI())}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">BMR</span>
                    <span className="font-medium text-black">{calculateBMR()} cal/day</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Daily Steps Goal</span>
                    <span className="font-medium text-black">{profileData.dailySteps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Calorie Goal</span>
                    <span className="font-medium text-black">{profileData.targetCalories.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border-black rounded-lg shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-black text-xl">Edit Profile</CardTitle>
                    <CardDescription className="text-gray-600">Update your personal and fitness information</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={saveProfileData}
                          disabled={isSaving}
                          className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm transition-colors"
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
                          className="border-black text-black hover:bg-black hover:text-white rounded-md shadow-sm transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-black text-black hover:bg-black hover:text-white rounded-md shadow-sm transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8"> {/* Increased spacing between sections */}
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-black text-lg border-b pb-2 mb-4 border-gray-200">Personal Details</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-black font-semibold">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your first name"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-black font-semibold">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your last name"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-black font-semibold">Email</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-100 border-gray-300 rounded-md text-gray-700 h-10 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black font-semibold">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., +1234567890"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-black font-semibold">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!isEditing}
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-black font-semibold">Gender</Label>
                        <Select
                          value={profileData.gender}
                          onValueChange={(value) => handleInputChange('gender', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                            <SelectItem value="male" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Male</SelectItem>
                            <SelectItem value="female" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Female</SelectItem>
                            <SelectItem value="other" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2"> {/* Full width for location */}
                        <Label htmlFor="location" className="text-black font-semibold">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., New York, USA"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fitness Information */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-black text-lg border-b pb-2 mb-4 border-gray-200">Fitness Details</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-black font-semibold">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={profileData.height || ''}
                          onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          placeholder="e.g., 175"
                          min="1"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-black font-semibold">Current Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={profileData.weight || ''}
                          onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          placeholder="e.g., 70"
                          min="1"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetWeight" className="text-black font-semibold">Target Weight (kg)</Label>
                        <Input
                          id="targetWeight"
                          type="number"
                          value={profileData.targetWeight || ''}
                          onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          placeholder="e.g., 65"
                          min="0"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dailySteps" className="text-black font-semibold">Daily Steps Goal</Label>
                        <Input
                          id="dailySteps"
                          type="number"
                          value={profileData.dailySteps || ''}
                          onChange={(e) => handleInputChange('dailySteps', parseInt(e.target.value) || 0)}
                          disabled={!isEditing}
                          placeholder="e.g., 10000"
                          min="0"
                          step="100"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetCalories" className="text-black font-semibold">Daily Calorie Goal</Label>
                        <Input
                          id="targetCalories"
                          type="number"
                          value={profileData.targetCalories || ''}
                          onChange={(e) => handleInputChange('targetCalories', parseInt(e.target.value) || 0)}
                          disabled={!isEditing}
                          placeholder="e.g., 2000"
                          min="0"
                          step="100"
                          className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fitnessLevel" className="text-black font-semibold">Fitness Level</Label>
                        <Select
                          value={profileData.fitnessLevel}
                          onValueChange={(value) => handleInputChange('fitnessLevel', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                            <SelectItem value="beginner" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Beginner</SelectItem>
                            <SelectItem value="intermediate" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Intermediate</SelectItem>
                            <SelectItem value="advanced" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2"> {/* Full width for primary goal */}
                        <Label htmlFor="primaryGoal" className="text-black font-semibold">Primary Goal</Label>
                        <Select
                          value={profileData.primaryGoal}
                          onValueChange={(value) => handleInputChange('primaryGoal', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                            <SelectValue placeholder="Select your primary goal" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                            <SelectItem value="weight_loss" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Weight Loss</SelectItem>
                            <SelectItem value="muscle_gain" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Muscle Gain</SelectItem>
                            <SelectItem value="endurance" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Endurance</SelectItem>
                            <SelectItem value="general_fitness" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">General Fitness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-black text-lg border-b pb-2 mb-4 border-gray-200">About You</h3>
                    <Label htmlFor="bio" className="text-black font-semibold">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself and your fitness journey..."
                      rows={4} // Increased rows for more space
                      className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
