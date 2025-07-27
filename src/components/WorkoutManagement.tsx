import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Plus, 
  Minus,
  Clock,
  Target,
  ArrowLeft,
  Save,
  Calendar,
  Trash2,
  Copy
} from 'lucide-react';

// Exercise database with common exercises
const exerciseDatabase = [
  // Cardio
  { category: 'Cardio', exercises: [
    { id: 'running', name: 'Running', type: 'cardio', defaultSets: 1, defaultReps: '30 min' },
    { id: 'cycling', name: 'Cycling', type: 'cardio', defaultSets: 1, defaultReps: '30 min' },
    { id: 'swimming', name: 'Swimming', type: 'cardio', defaultSets: 1, defaultReps: '30 min' },
    { id: 'rowing', name: 'Rowing', type: 'cardio', defaultSets: 1, defaultReps: '20 min' },
  ]},
  // Upper Body
  { category: 'Upper Body', exercises: [
    { id: 'pushups', name: 'Push-ups', type: 'strength', defaultSets: 3, defaultReps: '10 reps' },
    { id: 'pullups', name: 'Pull-ups', type: 'strength', defaultSets: 3, defaultReps: '8 reps' },
    { id: 'bench-press', name: 'Bench Press', type: 'strength', defaultSets: 3, defaultReps: '8 reps' },
    { id: 'overhead-press', name: 'Overhead Press', type: 'strength', defaultSets: 3, defaultReps: '8 reps' },
    { id: 'dumbbell-rows', name: 'Dumbbell Rows', type: 'strength', defaultSets: 3, defaultReps: '10 reps' },
  ]},
  // Lower Body
  { category: 'Lower Body', exercises: [
    { id: 'squats', name: 'Squats', type: 'strength', defaultSets: 3, defaultReps: '12 reps' },
    { id: 'deadlifts', name: 'Deadlifts', type: 'strength', defaultSets: 3, defaultReps: '8 reps' },
    { id: 'lunges', name: 'Lunges', type: 'strength', defaultSets: 3, defaultReps: '10 reps' },
    { id: 'leg-press', name: 'Leg Press', type: 'strength', defaultSets: 3, defaultReps: '12 reps' },
    { id: 'calf-raises', name: 'Calf Raises', type: 'strength', defaultSets: 3, defaultReps: '15 reps' },
  ]},
  // Core
  { category: 'Core', exercises: [
    { id: 'planks', name: 'Planks', type: 'strength', defaultSets: 3, defaultReps: '30 sec' },
    { id: 'crunches', name: 'Crunches', type: 'strength', defaultSets: 3, defaultReps: '15 reps' },
    { id: 'russian-twists', name: 'Russian Twists', type: 'strength', defaultSets: 3, defaultReps: '20 reps' },
    { id: 'leg-raises', name: 'Leg Raises', type: 'strength', defaultSets: 3, defaultReps: '12 reps' },
  ]},
];

// Workout templates
const workoutTemplates = [
  {
    id: 'full-body',
    name: 'Full Body Workout',
    description: 'Complete full body workout for all muscle groups',
    exercises: [
      { exerciseId: 'squats', sets: 3, reps: '12 reps', weight: 0, rest: 60 },
      { exerciseId: 'pushups', sets: 3, reps: '10 reps', weight: 0, rest: 60 },
      { exerciseId: 'dumbbell-rows', sets: 3, reps: '10 reps', weight: 0, rest: 60 },
      { exerciseId: 'planks', sets: 3, reps: '30 sec', weight: 0, rest: 60 },
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body Focus',
    description: 'Target chest, back, shoulders, and arms',
    exercises: [
      { exerciseId: 'bench-press', sets: 3, reps: '8 reps', weight: 0, rest: 90 },
      { exerciseId: 'pullups', sets: 3, reps: '8 reps', weight: 0, rest: 90 },
      { exerciseId: 'overhead-press', sets: 3, reps: '8 reps', weight: 0, rest: 90 },
      { exerciseId: 'dumbbell-rows', sets: 3, reps: '10 reps', weight: 0, rest: 60 },
    ]
  },
  {
    id: 'cardio',
    name: 'Cardio Session',
    description: 'High-intensity cardio workout',
    exercises: [
      { exerciseId: 'running', sets: 1, reps: '30 min', weight: 0, rest: 0 },
      { exerciseId: 'cycling', sets: 1, reps: '20 min', weight: 0, rest: 0 },
    ]
  }
];

interface Exercise {
  exerciseId: string;
  sets: number;
  reps: string;
  weight: number;
  rest: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  notes: string;
}

export function WorkoutManagement() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({
    id: '',
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    exercises: [],
    notes: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  const getExerciseName = (exerciseId: string) => {
    for (const category of exerciseDatabase) {
      const exercise = category.exercises.find(e => e.id === exerciseId);
      if (exercise) return exercise.name;
    }
    return exerciseId;
  };

  const getExerciseCategory = (exerciseId: string) => {
    for (const category of exerciseDatabase) {
      const exercise = category.exercises.find(e => e.id === exerciseId);
      if (exercise) return category.category;
    }
    return 'Other';
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exerciseDatabase
      .flatMap(cat => cat.exercises)
      .find(e => e.id === exerciseId);
    
    if (exercise) {
      const newExercise: Exercise = {
        exerciseId,
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        weight: 0,
        rest: 60
      };
      
      setCurrentWorkout(prev => ({
        ...prev,
        exercises: [...prev.exercises, newExercise]
      }));
    }
    setShowExerciseModal(false);
  };

  const removeExercise = (index: number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const loadTemplate = (templateId: string) => {
    const template = workoutTemplates.find(t => t.id === templateId);
    if (template) {
      setCurrentWorkout(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        exercises: template.exercises.map(ex => ({ ...ex, notes: '' }))
      }));
      setSelectedTemplate(templateId);
    }
  };

  const saveWorkout = () => {
    if (!currentWorkout.name.trim()) return;
    
    const workout: Workout = {
      ...currentWorkout,
      id: Date.now().toString(),
      duration: currentWorkout.exercises.reduce((total, ex) => total + (ex.sets * ex.rest), 0) / 60
    };
    
    setWorkouts(prev => [workout, ...prev]);
    setCurrentWorkout({
      id: '',
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 0,
      exercises: [],
      notes: ''
    });
    setIsCreating(false);
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const duplicateWorkout = (workout: Workout) => {
    setCurrentWorkout({
      ...workout,
      id: '',
      name: `${workout.name} (Copy)`,
      date: new Date().toISOString().split('T')[0]
    });
    setIsCreating(true);
  };

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
              <h1 className="text-2xl font-bold">Workout Management</h1>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isCreating ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Workout Details */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Details</CardTitle>
                <CardDescription>Set up your workout session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workout Name *</Label>
                    <Input
                      id="name"
                      value={currentWorkout.name}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Morning Workout"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={currentWorkout.date}
                      onChange={(e) => setCurrentWorkout(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentWorkout.description}
                    onChange={(e) => setCurrentWorkout(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your workout focus..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Workout Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Templates</CardTitle>
                <CardDescription>Choose a pre-built workout template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {workoutTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'border-black bg-gray-50' : ''
                      }`}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-black mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {template.exercises.length} exercises
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exercises */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Exercises</CardTitle>
                    <CardDescription>Add exercises to your workout</CardDescription>
                  </div>
                  <Button onClick={() => setShowExerciseModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {currentWorkout.exercises.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No exercises added yet. Click "Add Exercise" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentWorkout.exercises.map((exercise, index) => (
                      <Card key={index} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-black">
                                {getExerciseName(exercise.exerciseId)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {getExerciseCategory(exercise.exerciseId)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Sets</Label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateExercise(index, 'sets', Math.max(1, exercise.sets - 1))}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                                  className="w-16 text-center"
                                  min="1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateExercise(index, 'sets', exercise.sets + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Reps/Duration</Label>
                              <Input
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                                placeholder="10 reps"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Weight (kg)</Label>
                              <Input
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="text-sm"
                                min="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Rest (sec)</Label>
                              <Input
                                type="number"
                                value={exercise.rest}
                                onChange={(e) => updateExercise(index, 'rest', parseInt(e.target.value) || 0)}
                                placeholder="60"
                                className="text-sm"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <Input
                              placeholder="Notes (optional)"
                              value={exercise.notes || ''}
                              onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workout Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Notes</CardTitle>
                <CardDescription>Add any additional notes about your workout</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentWorkout.notes}
                  onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How did you feel? Any achievements or challenges?"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveWorkout}
                disabled={!currentWorkout.name.trim()}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workout
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Workout History */}
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>Your recent workout sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No workouts yet. Create your first workout to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workouts.map((workout) => (
                      <Card key={workout.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-black">{workout.name}</h3>
                              <p className="text-sm text-gray-600">{workout.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                {workout.exercises.length} exercises
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => duplicateWorkout(workout)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteWorkout(workout.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{workout.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{workout.duration.toFixed(1)} min</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {workout.exercises.reduce((total, ex) => total + ex.sets, 0)} total sets
                              </span>
                            </div>
                          </div>
                          {workout.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">{workout.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Exercise</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExerciseModal(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              {exerciseDatabase.map((category) => (
                <div key={category.category}>
                  <h3 className="font-medium text-black mb-2">{category.category}</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {category.exercises.map((exercise) => (
                      <Button
                        key={exercise.id}
                        variant="outline"
                        className="justify-start h-auto p-3"
                        onClick={() => addExercise(exercise.id)}
                      >
                        <div className="text-left">
                          <div className="font-medium text-black">{exercise.name}</div>
                          <div className="text-sm text-gray-600">
                            {exercise.defaultSets} sets × {exercise.defaultReps}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 