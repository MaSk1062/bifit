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
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
 
 
  Save, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addGoal, updateGoal, deleteGoal } from '@/lib/firebase';
import type { Goal } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const goalTypes = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📊' },
  { value: 'monthly', label: 'Monthly', icon: '📈' }
];



export function GoalManagement() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goals, setGoals] = useState<(Goal & { id: string })[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    current: '0',
    unit: '',
    type: '',
    targetDate: '',
    notes: ''
  });

  // Load goals from Firestore
  const loadGoals = async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const goalsRef = collection(db, 'goals');
      const goalsQuery = query(
        goalsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const goalsSnapshot = await getDocs(goalsQuery);
      
      const goalsData: (Goal & { id: string })[] = [];
      goalsSnapshot.forEach(doc => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal & { id: string });
      });
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      setErrorMessage('Failed to load goals');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [currentUser?.uid]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target: '',
      current: '0',
      unit: '',
      type: '',
      targetDate: '',
      notes: ''
    });
    setIsAddingGoal(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target || !formData.unit || !formData.type) {
      setErrorMessage('Please fill in all required fields');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    
    try {
      const goalData = {
        name: formData.name,
        target: parseFloat(formData.target),
        current: parseFloat(formData.current),
        unit: formData.unit,
        type: formData.type as 'daily' | 'weekly' | 'monthly',
        targetDate: formData.targetDate ? Timestamp.fromDate(new Date(formData.targetDate)) : undefined,
        achieved: parseFloat(formData.current) >= parseFloat(formData.target),
        notes: formData.notes || undefined
      };

      if (editingGoal) {
        await updateGoal(editingGoal, goalData);
      } else {
        await addGoal(goalData);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        loadGoals(); // Reload goals
      }, 2000);
      
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrorMessage('Failed to save goal. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: Goal & { id: string }) => {
    setEditingGoal(goal.id);
    setFormData({
      name: goal.name,
      target: goal.target.toString(),
      current: goal.current.toString(),
      unit: goal.unit,
      type: goal.type,
      targetDate: goal.targetDate ? goal.targetDate.toDate().toISOString().split('T')[0] : '',
      notes: goal.notes || ''
    });
    setIsAddingGoal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        loadGoals(); // Reload goals
      }, 2000);
    } catch (error) {
      console.error('Error deleting goal:', error);
      setErrorMessage('Failed to delete goal');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalIcon = (type: string) => {
    const goalType = goalTypes.find(t => t.value === type);
    return goalType ? goalType.icon : '🎯';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading goals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <MobileHeader title="Goals" showBackButton onBack={() => window.history.back()} />
      
      {/* Desktop Header */}
      <div className="bg-black text-white hidden md:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black text-xs sm:text-sm">
                Goals
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button asChild variant="outline" size="sm" className="bg-black text-white border-white hover:bg-white hover:text-black text-xs w-full sm:w-auto">
                <Link to="/dashboard">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              {!isAddingGoal && (
                <Button
                  onClick={() => setIsAddingGoal(true)}
                  size="sm"
                  className="bg-white text-black hover:bg-gray-100 text-xs w-full sm:w-auto"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Goal
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium text-sm sm:text-base">Goal saved successfully!</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium text-sm sm:text-base">{errorMessage}</span>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Add/Edit Goal Form */}
          {isAddingGoal && (
            <div className="lg:col-span-1">
              <Card className="border-2 border-gray-200 rounded-xl shadow-xl bg-white">
                <CardHeader className="pb-6 bg-gray-50 rounded-t-xl border-b-2 border-gray-200">
                  <CardTitle className="flex items-center justify-between text-black text-lg sm:text-xl">
                    <span>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm sm:text-base mt-2">Set a new fitness goal to track your progress</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Goal Name */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="name" className="text-black font-semibold text-sm sm:text-base">Goal Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Daily Steps, Weekly Workouts"
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>

                    {/* Goal Type */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="type" className="text-black font-semibold text-sm sm:text-base">Goal Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-black border-2 border-gray-300 rounded-lg shadow-xl">
                          {goalTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-md cursor-pointer h-10 sm:h-12">
                              <span className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base">
                                <span className="text-lg sm:text-xl">{type.icon}</span>
                                <span>{type.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target and Current */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="target" className="text-black font-semibold text-sm sm:text-base">Target *</Label>
                        <Input
                          id="target"
                          type="number"
                          value={formData.target}
                          onChange={(e) => handleInputChange('target', e.target.value)}
                          placeholder="10000"
                          min="1"
                          step="1"
                          className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="current" className="text-black font-semibold text-sm sm:text-base">Current</Label>
                        <Input
                          id="current"
                          type="number"
                          value={formData.current}
                          onChange={(e) => handleInputChange('current', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1"
                          className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Unit and Target Date */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="unit" className="text-black font-semibold text-sm sm:text-base">Unit *</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => handleInputChange('unit', e.target.value)}
                          placeholder="steps, workouts, km"
                          className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="targetDate" className="text-black font-semibold text-sm sm:text-base">Target Date</Label>
                        <Input
                          id="targetDate"
                          type="date"
                          value={formData.targetDate}
                          onChange={(e) => handleInputChange('targetDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="notes" className="text-black font-semibold text-sm sm:text-base">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional notes about your goal..."
                        rows={3}
                        className="border-2 border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20 rounded-lg text-black text-sm sm:text-base resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.target || !formData.unit || !formData.type}
                      className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 rounded-lg shadow-lg h-10 sm:h-12 text-sm sm:text-base font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          {editingGoal ? 'Update Goal' : 'Save Goal'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Goals List */}
          <div className={isAddingGoal ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card className="border-2 border-gray-200 rounded-xl shadow-xl bg-white">
              <CardHeader className="pb-6 bg-gray-50 rounded-t-xl border-b-2 border-gray-200">
                <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-black text-lg sm:text-xl">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Your Goals</span>
                  <Badge variant="outline" className="bg-white text-black border-black text-xs sm:text-sm px-2 sm:px-3 py-1">{goals.length}</Badge>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base mt-2">View and manage your fitness goals</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {goals.length === 0 && !isAddingGoal ? (
                  <div className="text-center py-8 sm:py-12">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2">No goals yet</h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start by setting your first fitness goal</p>
                    <Button 
                      onClick={() => setIsAddingGoal(true)}
                      className="bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add Your First Goal
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-black transition-colors bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-xl sm:text-2xl">{getGoalIcon(goal.type)}</span>
                            <h3 className="font-semibold text-black text-sm sm:text-lg truncate">{goal.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="text-black hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-600">Progress</span>
                            <span className="text-xs sm:text-sm font-semibold text-black">
                              {goal.current} / {goal.target} {goal.unit}
                            </span>
                          </div>
                          
                          <Progress value={getProgressPercentage(goal.current, goal.target)} className="h-2 sm:h-3" />
                          
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-gray-600">{Math.round(getProgressPercentage(goal.current, goal.target))}%</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs sm:text-sm px-2 py-1 ${
                                goal.achieved ? 'bg-green-50 text-green-700 border-green-200' : 
                                getProgressPercentage(goal.current, goal.target) > 75 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                getProgressPercentage(goal.current, goal.target) > 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {goal.achieved ? 'Achieved' : 
                               getProgressPercentage(goal.current, goal.target) > 75 ? 'On Track' :
                               getProgressPercentage(goal.current, goal.target) > 50 ? 'Good Progress' : 'Needs Focus'}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize">{goal.type}</span>
                            </div>
                            {goal.targetDate && (
                              <div className="flex justify-between">
                                <span>Target Date:</span>
                                <span className="text-xs">{goal.targetDate.toDate().toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {goal.notes && (
                            <p className="text-xs sm:text-sm text-gray-600 italic border-t border-gray-200 pt-3 truncate">"{goal.notes}"</p>
                          )}
                        </div>
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