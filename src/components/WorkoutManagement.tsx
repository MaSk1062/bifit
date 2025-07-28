import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MobileHeader } from '@/components/MobileHeader'; // Assuming this component exists and is correctly implemented
import {
  Target,
  Plus,
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Dumbbell,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addWorkout, updateWorkout, deleteWorkout } from '@/lib/firebase';
import type { Workout, WorkoutExercise } from '@/lib/firebase'; // Keep original Workout type for Firestore interaction
import { Timestamp } from 'firebase/firestore'; // Firebase Timestamp for date handling
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase'; // Assuming auth is correctly exported from firebase.ts

// Define a local interface for Workout that uses Date objects for state management
// This reflects how the data is stored in the component's state after fetching from Firestore
interface LocalWorkout extends Omit<Workout, 'date'> {
  id: string; // Add id for local state
  date: Date; // Use Date object for local state
}

const exerciseDatabase = [
  { name: 'Push-ups', category: 'Bodyweight' },
  { name: 'Pull-ups', category: 'Bodyweight' },
  { name: 'Squats', category: 'Bodyweight' },
  { name: 'Lunges', category: 'Bodyweight' },
  { name: 'Plank', category: 'Bodyweight' },
  { name: 'Burpees', category: 'Bodyweight' },
  { name: 'Bench Press', category: 'Strength' },
  { name: 'Deadlift', category: 'Strength' },
  { name: 'Squat', category: 'Strength' },
  { name: 'Overhead Press', category: 'Strength' },
  { name: 'Barbell Row', category: 'Strength' },
  { name: 'Bicep Curls', category: 'Strength' },
  { name: 'Tricep Dips', category: 'Strength' },
  { name: 'Running', category: 'Cardio' },
  { name: 'Cycling', category: 'Cardio' },
  { name: 'Swimming', category: 'Cardio' },
  { name: 'Jump Rope', category: 'Cardio' }
];

export function WorkoutManagement() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  // Use LocalWorkout interface for the state that holds fetched workouts
  const [workouts, setWorkouts] = useState<LocalWorkout[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    duration: '',
    notes: ''
  });

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<WorkoutExercise>({
    name: '',
    sets: 1,
    reps: 10,
    weight: 0,
    duration: 0,
    distance: 0,
    restTime: 60,
    notes: ''
  });

  // Load workouts from Firestore
  const loadWorkouts = async () => {
    if (!currentUser?.uid) {
      console.log('No current user, skipping workout load');
      setIsLoading(false);
      return;
    }

    console.log('Loading workouts for user:', currentUser.uid);
    setIsLoading(true);
    try {
      const workoutsRef = collection(db, 'workouts');
      const workoutsQuery = query(
        workoutsRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      console.log('Executing workout query');
      const workoutsSnapshot = await getDocs(workoutsQuery);

      console.log('Workout snapshot size:', workoutsSnapshot.size);
      const workoutsData: LocalWorkout[] = []; // Use LocalWorkout here
      workoutsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('Workout data:', data);
        workoutsData.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JavaScript Date object for local state
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
          exercises: data.exercises || [],
        } as LocalWorkout); // Cast to LocalWorkout
      });
      console.log('Processed workouts:', workoutsData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading workouts:', error);
      setErrorMessage(`Failed to load workouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [currentUser?.uid]);

  // Test function to verify Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      console.log('Current user:', currentUser);
      console.log('Auth state:', auth.currentUser);

      // Test if we can access Firestore
      collection(db, 'test');
      console.log('Firestore collection reference created successfully');

      // Using a custom message box instead of alert()
      // You'd replace this with your actual custom modal UI
      alert('Firebase connection test completed. Check console for details.');
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      alert(`Firebase connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test function to create a sample workout
  const createTestWorkout = async () => {
    try {
      if (!currentUser?.uid) {
        alert('Please log in first');
        return;
      }

      console.log('Creating test workout...');

      const testWorkoutData = { // Use the original Workout interface for data sent to Firestore
        name: 'Test Workout',
        date: Timestamp.fromDate(new Date()), // Ensure it's a Timestamp for Firestore
        duration: 30,
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 10,
            weight: 0,
            duration: 0,
            distance: 0,
            restTime: 60,
            notes: 'Test exercise'
          }
        ],
        notes: 'This is a test workout',
        userId: currentUser.uid, // Add userId here
      };

      console.log('Test workout data:', testWorkoutData);

      const result = await addWorkout(testWorkoutData);
      console.log('Test workout created successfully:', result);

      alert('Test workout created successfully! Check console for details.');

      // Reload workouts to show the new one
      loadWorkouts();

    } catch (error) {
      console.error('Test workout creation failed:', error);
      alert(`Test workout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExerciseChange = (field: keyof WorkoutExercise, value: string | number) => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExercise = () => {
    if (!currentExercise.name) {
      setErrorMessage('Please enter an exercise name');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setExercises(prev => [...prev, { ...currentExercise }]);
    setCurrentExercise({
      name: '',
      sets: 1,
      reps: 10,
      weight: 0,
      duration: 0,
      distance: 0,
      restTime: 60,
      notes: ''
    });
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      notes: ''
    });
    setExercises([]);
    setCurrentExercise({
      name: '',
      sets: 1,
      reps: 10,
      weight: 0,
      duration: 0,
      distance: 0,
      restTime: 60,
      notes: ''
    });
    setIsAddingWorkout(false);
    setEditingWorkout(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.duration || exercises.length === 0) {
      setErrorMessage('Please fill in all required fields and add at least one exercise');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    if (!currentUser?.uid) {
      setErrorMessage('User not authenticated. Please log in again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setShowError(false);

    try {
      console.log('Current user:', currentUser.uid);
      console.log('Form data:', formData);
      console.log('Exercises:', exercises);

      // Convert date string from form to Firestore Timestamp for saving
      const workoutData = {
        name: formData.name,
        date: Timestamp.fromDate(new Date(formData.date)),
        duration: parseFloat(formData.duration),
        exercises: exercises,
        notes: formData.notes || undefined,
        userId: currentUser.uid, // Ensure userId is included
      };

      console.log('Workout data to save:', workoutData);

      if (editingWorkout) {
        console.log('Updating workout:', editingWorkout);
        await updateWorkout(editingWorkout, workoutData);
      } else {
        console.log('Adding new workout');
        const result = await addWorkout(workoutData);
        console.log('Workout added successfully:', result);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        loadWorkouts(); // Reload workouts
      }, 2000);

    } catch (error) {
      console.error('Error saving workout:', error);
      setErrorMessage(`Failed to save workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // When editing, convert the Date object from local state back to a date string for the form
  const handleEditWorkout = (workout: LocalWorkout) => { // Expect LocalWorkout here
    setEditingWorkout(workout.id);
    setFormData({
      name: workout.name,
      date: workout.date.toISOString().split('T')[0], // Convert Date object to date string
      duration: workout.duration.toString(),
      notes: workout.notes || ''
    });
    setExercises([...workout.exercises]);
    setIsAddingWorkout(true);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this workout?');

    if (!isConfirmed) return;

    try {
      await deleteWorkout(workoutId);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        loadWorkouts(); // Reload workouts
      }, 2000);
    } catch (error) {
      console.error('Error deleting workout:', error);
      setErrorMessage('Failed to delete workout');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  // Format Date object to a readable date string
  const formatDate = (date: Date) => { // Expect Date object here
    if (!date) return 'N/A';
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-inter">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading workouts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Mobile Header */}
      <MobileHeader title="Workouts" showBackButton onBack={() => window.history.back()} />

      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black text-xs sm:text-sm">
                Workouts
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs w-full sm:w-auto">
                <Link to="/dashboard">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              {!isAddingWorkout && (
                <>
                  <Button
                    onClick={() => setIsAddingWorkout(true)}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm text-xs w-full sm:w-auto"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Add Workout
                  </Button>
                  <Button
                    onClick={testFirebaseConnection}
                    size="sm"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black rounded-md shadow-sm text-xs w-full sm:w-auto"
                  >
                    Test Firebase
                  </Button>
                  <Button
                    onClick={createTestWorkout}
                    size="sm"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black rounded-md shadow-sm text-xs w-full sm:w-auto"
                  >
                    Create Test Workout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-white border-black rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-black font-medium text-sm sm:text-base">Workout saved successfully!</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-white border-black rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-black font-medium text-sm sm:text-base">{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add/Edit Workout Form */}
          {isAddingWorkout && (
            <div className="lg:col-span-1">
              <Card className="border-black rounded-lg shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-black text-lg sm:text-xl">
                    <span>{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-black hover:bg-gray-100 rounded-md"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">Create a new workout routine</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Workout Name */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="name" className="text-black font-semibold text-sm sm:text-base">Workout Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Upper Body, Leg Day, Cardio"
                        className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    {/* Date and Duration */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="date" className="text-black font-semibold text-sm sm:text-base">Date *</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="duration" className="text-black font-semibold text-sm sm:text-base">Duration (minutes) *</Label>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            placeholder="60"
                            min="1"
                            step="1"
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 sm:h-12 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="notes" className="text-black font-semibold text-sm sm:text-base">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any notes about your workout..."
                        rows={2}
                        className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black text-sm resize-none"
                      />
                    </div>

                    {/* Exercises Section */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-black font-semibold text-sm sm:text-base">Exercises *</Label>
                        <Badge variant="outline" className="bg-white text-black border-black text-xs">{exercises.length}</Badge>
                      </div>

                      {/* Add Exercise Form */}
                      <div className="p-4 sm:p-6 border-2 border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <h4 className="font-medium text-black mb-3 text-sm sm:text-base">Add New Exercise</h4>

                        {/* Exercise Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Exercise Name *</Label>
                          <Select
                            value={currentExercise.name}
                            onValueChange={(value) => handleExerciseChange('name', value)}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 text-sm">
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black border border-black rounded-md shadow-lg max-h-60">
                              {exerciseDatabase.map((exercise) => (
                                <SelectItem key={exercise.name} value={exercise.name} className="hover:bg-black hover:text-white cursor-pointer h-10">
                                  <span className="flex items-center space-x-2 text-sm">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{exercise.category}</span>
                                    <span>{exercise.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sets and Reps */}
                        <div className="grid gap-4 grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Sets *</Label>
                            <Input
                              type="number"
                              value={currentExercise.sets}
                              onChange={(e) => handleExerciseChange('sets', parseInt(e.target.value) || 1)}
                              min="1"
                              step="1"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 text-sm"
                              placeholder="3"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Reps *</Label>
                            <Input
                              type="number"
                              value={currentExercise.reps}
                              onChange={(e) => handleExerciseChange('reps', parseInt(e.target.value) || 10)}
                              min="1"
                              step="1"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 text-sm"
                              placeholder="12"
                            />
                          </div>
                        </div>

                        {/* Weight and Rest Time */}
                        <div className="grid gap-4 grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Weight (kg)</Label>
                            <Input
                              type="number"
                              value={currentExercise.weight}
                              onChange={(e) => handleExerciseChange('weight', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.5"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Rest Time (sec)</Label>
                            <Input
                              type="number"
                              value={currentExercise.restTime}
                              onChange={(e) => handleExerciseChange('restTime', parseInt(e.target.value) || 60)}
                              min="0"
                              step="10"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10 text-sm"
                              placeholder="60"
                            />
                          </div>
                        </div>

                        {/* Exercise Notes */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Notes (Optional)</Label>
                          <Textarea
                            value={currentExercise.notes}
                            onChange={(e) => handleExerciseChange('notes', e.target.value)}
                            placeholder="Any notes about this exercise..."
                            rows={2}
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black text-sm resize-none"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={addExercise}
                          disabled={!currentExercise.name}
                          variant="outline"
                          className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow-sm h-10 disabled:bg-gray-300 disabled:text-gray-500 text-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Exercise
                        </Button>
                      </div>

                      {/* Exercise List */}
                      {exercises.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-black text-sm sm:text-base">Added Exercises ({exercises.length})</h4>
                          {exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-black transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Target className="w-4 h-4 text-gray-600" />
                                  <p className="font-medium text-black text-sm sm:text-base truncate">{exercise.name}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                  <span className="flex items-center space-x-1">
                                    <Dumbbell className="w-3 h-3" />
                                    <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                  </span>
                                  {(exercise.weight || 0) > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <Scale className="w-3 h-3" />
                                      <span>{exercise.weight}kg</span>
                                    </span>
                                  )}
                                  {(exercise.restTime || 0) > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{exercise.restTime}s rest</span>
                                    </span>
                                  )}
                                </div>
                                {exercise.notes && (
                                  <p className="text-xs text-gray-500 mt-1 italic truncate">"{exercise.notes}"</p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(index)}
                                className="text-red-600 hover:bg-red-50 rounded-md ml-2 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.duration || exercises.length === 0}
                      className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow-md h-10 sm:h-12 text-sm sm:text-base font-medium disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingWorkout ? 'Update Workout' : 'Save Workout'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Workouts List */}
          <div className={isAddingWorkout ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="border-black rounded-lg shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-black text-lg sm:text-xl">
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Your Workouts</span>
                  <Badge variant="outline" className="bg-white text-black border-black text-xs sm:text-sm">{workouts.length}</Badge>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">View and manage your workout history</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {workouts.length === 0 && !isAddingWorkout ? (
                  <div className="text-center py-8 sm:py-12">
                    <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2">No workouts yet!</h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start by adding your first workout</p>
                    <Button onClick={() => setIsAddingWorkout(true)}
                      className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm text-sm sm:text-base px-6 py-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Workout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workouts.map((workout) => (
                      <div key={workout.id} className="p-4 sm:p-6 border border-black rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-black text-base sm:text-lg truncate">{workout.name}</h3>
                            <p className="text-sm text-gray-600">
                              <Calendar className="inline-block w-3 h-3 mr-1 align-middle" />
                              {formatDate(workout.date)} • {/* Changed here: Passing Date object directly */}
                              <Clock className="inline-block w-3 h-3 ml-2 mr-1 align-middle" />
                              {workout.duration} minutes
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <Badge variant="outline" className="bg-white text-black border-black text-xs">{workout.exercises.length} exercises</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditWorkout(workout)}
                              className="text-black hover:bg-gray-100 rounded-md"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWorkout(workout.id)}
                              className="text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {workout.exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <Target className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              <span className="text-black truncate flex-1">{exercise.name}</span>
                              <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                                {exercise.sets}×{exercise.reps}
                                {(exercise.weight || 0) > 0 && ` @ ${exercise.weight}kg`}
                              </span>
                            </div>
                          ))}
                        </div>

                        {workout.notes && (
                          <p className="text-sm text-gray-600 mt-3 text-xs sm:text-sm">{workout.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
