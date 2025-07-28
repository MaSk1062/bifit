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
import type { Workout, WorkoutExercise } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [workouts, setWorkouts] = useState<(Workout & { id: string })[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
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
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const workoutsRef = collection(db, 'workouts');
      const workoutsQuery = query(
        workoutsRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);

      const workoutsData: (Workout & { id: string })[] = [];
      workoutsSnapshot.forEach(doc => {
        const data = doc.data();
        workoutsData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || new Date(),
          exercises: data.exercises || [],
        } as Workout & { id: string });
      });
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading workouts:', error);
      setErrorMessage('Failed to load workouts');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [currentUser?.uid]);

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

    setIsSubmitting(true);
    setShowError(false);

    try {
      const workoutData = {
        name: formData.name,
        date: Timestamp.fromDate(new Date(formData.date)),
        duration: parseFloat(formData.duration),
        exercises: exercises,
        notes: formData.notes || undefined,
      };

      if (editingWorkout) {
        await updateWorkout(editingWorkout, workoutData);
      } else {
        await addWorkout(workoutData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        loadWorkouts(); // Reload workouts
      }, 2000);

    } catch (error) {
      console.error('Error saving workout:', error);
      setErrorMessage('Failed to save workout. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWorkout = (workout: Workout & { id: string }) => {
    setEditingWorkout(workout.id);
    setFormData({
      name: workout.name,
      date: workout.date.toDate().toISOString().split('T')[0],
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

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
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
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black rounded-md shadow-sm">
                Workout Management
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black rounded-md shadow-sm">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              {!isAddingWorkout && (
                <Button
                  onClick={() => setIsAddingWorkout(true)}
                  className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-white border-black rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-black">Workout saved successfully!</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-white border-black rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-black">{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add/Edit Workout Form */}
          {isAddingWorkout && (
            <div className="lg:col-span-1">
              <Card className="border-black rounded-lg shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span>{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-black hover:bg-gray-100 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-600">Create a new workout routine</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Workout Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-black">Workout Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Upper Body, Leg Day, Cardio"
                        className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black"
                      />
                    </div>

                    {/* Date and Duration */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-black">Date *</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-black">Duration (minutes) *</Label>
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
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-black">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any notes about your workout..."
                        rows={2}
                        className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black"
                      />
                    </div>

                    {/* Exercises Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-black font-semibold">Exercises *</Label>
                        <Badge variant="outline" className="bg-white text-black border-black">{exercises.length}</Badge>
                      </div>

                      {/* Add Exercise Form */}
                      <div className="p-6 border-2 border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <h4 className="font-medium text-black mb-3">Add New Exercise</h4>
                        
                        {/* Exercise Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-black">Exercise Name *</Label>
                          <Select
                            value={currentExercise.name}
                            onValueChange={(value) => handleExerciseChange('name', value)}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black border border-black rounded-md shadow-lg max-h-60">
                              {exerciseDatabase.map((exercise) => (
                                <SelectItem key={exercise.name} value={exercise.name} className="hover:bg-black hover:text-white cursor-pointer">
                                  <span className="flex items-center space-x-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{exercise.category}</span>
                                    <span>{exercise.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sets and Reps */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Sets *</Label>
                            <Input
                              type="number"
                              value={currentExercise.sets}
                              onChange={(e) => handleExerciseChange('sets', parseInt(e.target.value) || 1)}
                              min="1"
                              step="1"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
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
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
                              placeholder="12"
                            />
                          </div>
                        </div>

                        {/* Weight and Rest Time */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Weight (kg)</Label>
                            <Input
                              type="number"
                              value={currentExercise.weight}
                              onChange={(e) => handleExerciseChange('weight', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.5"
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
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
                              className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10"
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
                            className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black resize-none"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={addExercise}
                          disabled={!currentExercise.name}
                          variant="outline"
                          className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow-sm h-10 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Exercise
                        </Button>
                      </div>

                      {/* Exercise List */}
                      {exercises.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-black">Added Exercises ({exercises.length})</h4>
                          {exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-black transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Target className="w-4 h-4 text-gray-600" />
                                  <p className="font-medium text-black">{exercise.name}</p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                                  <p className="text-xs text-gray-500 mt-1 italic">"{exercise.notes}"</p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(index)}
                                className="text-red-600 hover:bg-red-50 rounded-md ml-2"
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
                      className="w-full bg-black text-white hover:bg-gray-800 rounded-md shadow-md"
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
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Dumbbell className="w-5 h-5" />
                  <span>Your Workouts</span>
                  <Badge variant="outline" className="bg-white text-black border-black">{workouts.length}</Badge>
                </CardTitle>
                <CardDescription className="text-gray-600">View and manage your workout history</CardDescription>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 && !isAddingWorkout ? (
                  <div className="text-center py-8">
                    <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-black mb-2">No workouts yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first workout</p>
                    <Button onClick={() => setIsAddingWorkout(true)}
                      className="bg-black text-white hover:bg-gray-800 rounded-md shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Workout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workouts.map((workout) => (
                      <div key={workout.id} className="p-4 border border-black rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-black">{workout.name}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(workout.date as Timestamp)} • {workout.duration} minutes
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-white text-black border-black">{workout.exercises.length} exercises</Badge>
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
                              className="text-red-600 hover:bg-gray-100 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {workout.exercises.map((exercise, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <Target className="w-4 h-4 text-gray-600" />
                              <span className="text-black">{exercise.name}</span>
                              <span className="text-gray-600">
                                {exercise.sets}×{exercise.reps}
                                {(exercise.weight || 0) > 0 && ` @ ${exercise.weight}kg`}
                              </span>
                            </div>
                          ))}
                        </div>

                        {workout.notes && (
                          <p className="text-sm text-gray-600 mt-3">{workout.notes}</p>
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
