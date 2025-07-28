import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
// You can either use environment variables or replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only if supported)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Types for Firestore data
export interface Activity {
  userId: string;
  type: string;
  duration: number;
  distance?: number;
  calories: number;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Goal {
  userId: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetDate?: Timestamp;
  achieved: boolean;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Workout {
  userId: string;
  name: string;
  date: Timestamp;
  duration: number;
  exercises: WorkoutExercise[];
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  notes?: string;
}

// Activity Functions
export const addActivity = async (activityData: Omit<Activity, 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to add activities');
    }

    // Validate required fields
    if (!activityData.type || !activityData.duration || !activityData.calories || !activityData.date) {
      throw new Error('Missing required activity fields: type, duration, calories, and date are required');
    }

    // Validate data types and ranges
    if (typeof activityData.duration !== 'number' || activityData.duration <= 0) {
      throw new Error('Duration must be a positive number');
    }

    if (typeof activityData.calories !== 'number' || activityData.calories < 0) {
      throw new Error('Calories must be a non-negative number');
    }

    if (activityData.distance !== undefined && (typeof activityData.distance !== 'number' || activityData.distance < 0)) {
      throw new Error('Distance must be a non-negative number if provided');
    }

    // Clean the data to remove undefined values
    const cleanActivityData = {
      type: activityData.type.trim(),
      duration: activityData.duration,
      calories: activityData.calories,
      date: activityData.date,
      ...(activityData.distance !== undefined && { distance: activityData.distance }),
      ...(activityData.notes && { notes: activityData.notes.trim() })
    };

    const activity: Omit<Activity, 'id'> = {
      ...cleanActivityData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'activities'), activity);
    return { id: docRef.id, ...activity };
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: string, updates: Partial<Omit<Activity, 'userId' | 'createdAt'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update activities');
    }

    // Validate activityId
    if (!activityId || typeof activityId !== 'string') {
      throw new Error('Valid activity ID is required');
    }

    // Clean the updates to remove undefined values
    const cleanUpdates: any = {
      updatedAt: Timestamp.now()
    };

    if (updates.type !== undefined) {
      if (!updates.type.trim()) {
        throw new Error('Activity type cannot be empty');
      }
      cleanUpdates.type = updates.type.trim();
    }

    if (updates.duration !== undefined) {
      if (typeof updates.duration !== 'number' || updates.duration <= 0) {
        throw new Error('Duration must be a positive number');
      }
      cleanUpdates.duration = updates.duration;
    }

    if (updates.calories !== undefined) {
      if (typeof updates.calories !== 'number' || updates.calories < 0) {
        throw new Error('Calories must be a non-negative number');
      }
      cleanUpdates.calories = updates.calories;
    }

    if (updates.distance !== undefined) {
      if (typeof updates.distance !== 'number' || updates.distance < 0) {
        throw new Error('Distance must be a non-negative number');
      }
      cleanUpdates.distance = updates.distance;
    }

    if (updates.notes !== undefined) {
      cleanUpdates.notes = updates.notes ? updates.notes.trim() : null;
    }

    if (updates.date !== undefined) {
      cleanUpdates.date = updates.date;
    }

    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete activities');
    }

    if (!activityId || typeof activityId !== 'string') {
      throw new Error('Valid activity ID is required');
    }

    const activityRef = doc(db, 'activities', activityId);
    await deleteDoc(activityRef);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

// Goal Functions
export const addGoal = async (goalData: Omit<Goal, 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to add goals');
    }

    // Validate required fields
    if (!goalData.name || !goalData.target || !goalData.unit || !goalData.type) {
      throw new Error('Missing required goal fields: name, target, unit, and type are required');
    }

    // Validate data types and ranges
    if (typeof goalData.target !== 'number' || goalData.target <= 0) {
      throw new Error('Target must be a positive number');
    }

    if (typeof goalData.current !== 'number' || goalData.current < 0) {
      throw new Error('Current progress must be a non-negative number');
    }

    if (!['daily', 'weekly', 'monthly'].includes(goalData.type)) {
      throw new Error('Goal type must be daily, weekly, or monthly');
    }

    // Clean the data to remove undefined values
    const cleanGoalData = {
      name: goalData.name.trim(),
      target: goalData.target,
      current: goalData.current,
      unit: goalData.unit.trim(),
      type: goalData.type,
      achieved: goalData.current >= goalData.target,
      ...(goalData.targetDate && { targetDate: goalData.targetDate }),
      ...(goalData.notes && { notes: goalData.notes.trim() })
    };

    const goal: Omit<Goal, 'id'> = {
      ...cleanGoalData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'goals'), goal);
    return { id: docRef.id, ...goal };
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const updateGoal = async (goalId: string, updates: Partial<Omit<Goal, 'userId' | 'createdAt'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update goals');
    }

    if (!goalId || typeof goalId !== 'string') {
      throw new Error('Valid goal ID is required');
    }

    // Clean the updates to remove undefined values
    const cleanUpdates: any = {
      updatedAt: Timestamp.now()
    };

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        throw new Error('Goal name cannot be empty');
      }
      cleanUpdates.name = updates.name.trim();
    }

    if (updates.target !== undefined) {
      if (typeof updates.target !== 'number' || updates.target <= 0) {
        throw new Error('Target must be a positive number');
      }
      cleanUpdates.target = updates.target;
    }

    if (updates.current !== undefined) {
      if (typeof updates.current !== 'number' || updates.current < 0) {
        throw new Error('Current progress must be a non-negative number');
      }
      cleanUpdates.current = updates.current;
    }

    if (updates.unit !== undefined) {
      if (!updates.unit.trim()) {
        throw new Error('Unit cannot be empty');
      }
      cleanUpdates.unit = updates.unit.trim();
    }

    if (updates.type !== undefined) {
      if (!['daily', 'weekly', 'monthly'].includes(updates.type)) {
        throw new Error('Goal type must be daily, weekly, or monthly');
      }
      cleanUpdates.type = updates.type;
    }

    if (updates.targetDate !== undefined) {
      cleanUpdates.targetDate = updates.targetDate;
    }

    if (updates.notes !== undefined) {
      cleanUpdates.notes = updates.notes ? updates.notes.trim() : null;
    }

    // Update achieved status if target or current changed
    if (updates.target !== undefined || updates.current !== undefined) {
      const newTarget = updates.target !== undefined ? updates.target : (updates as any).target;
      const newCurrent = updates.current !== undefined ? updates.current : (updates as any).current;
      if (newTarget && newCurrent !== undefined) {
        cleanUpdates.achieved = newCurrent >= newTarget;
      }
    }

    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete goals');
    }

    if (!goalId || typeof goalId !== 'string') {
      throw new Error('Valid goal ID is required');
    }

    const goalRef = doc(db, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Workout Functions
export const addWorkout = async (workoutData: Omit<Workout, 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = auth.currentUser;
    console.log('addWorkout called with user:', user?.uid);
    console.log('workoutData:', workoutData);
    
    if (!user) {
      throw new Error('User must be authenticated to add workouts');
    }

    // Validate required fields
    if (!workoutData.name || !workoutData.duration || !workoutData.exercises || workoutData.exercises.length === 0) {
      throw new Error('Missing required workout fields: name, duration, and at least one exercise are required');
    }

    // Validate data types and ranges
    if (typeof workoutData.duration !== 'number' || workoutData.duration <= 0) {
      throw new Error('Duration must be a positive number');
    }

    if (!Array.isArray(workoutData.exercises) || workoutData.exercises.length === 0) {
      throw new Error('At least one exercise is required');
    }

    // Validate each exercise
    workoutData.exercises.forEach((exercise, index) => {
      if (!exercise.name || !exercise.name.trim()) {
        throw new Error(`Exercise ${index + 1} must have a name`);
      }
      if (typeof exercise.sets !== 'number' || exercise.sets <= 0) {
        throw new Error(`Exercise ${index + 1} must have positive sets`);
      }
      if (typeof exercise.reps !== 'number' || exercise.reps <= 0) {
        throw new Error(`Exercise ${index + 1} must have positive reps`);
      }
    });

    // Clean the data to remove undefined values
    const cleanExercises = workoutData.exercises.map(exercise => ({
      name: exercise.name.trim(),
      sets: exercise.sets,
      reps: exercise.reps,
      ...(exercise.weight !== undefined && exercise.weight > 0 && { weight: exercise.weight }),
      ...(exercise.duration !== undefined && exercise.duration > 0 && { duration: exercise.duration }),
      ...(exercise.distance !== undefined && exercise.distance > 0 && { distance: exercise.distance }),
      ...(exercise.restTime !== undefined && exercise.restTime > 0 && { restTime: exercise.restTime }),
      ...(exercise.notes && { notes: exercise.notes.trim() })
    }));

    const cleanWorkoutData = {
      name: workoutData.name.trim(),
      date: workoutData.date,
      duration: workoutData.duration,
      exercises: cleanExercises,
      ...(workoutData.notes && { notes: workoutData.notes.trim() })
    };

    const workout: Omit<Workout, 'id'> = {
      ...cleanWorkoutData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    console.log('Final workout object to save:', workout);
    console.log('Adding to workouts collection...');
    
    const docRef = await addDoc(collection(db, 'workouts'), workout);
    console.log('Workout saved successfully with ID:', docRef.id);
    
    return { id: docRef.id, ...workout };
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
};

export const updateWorkout = async (workoutId: string, updates: Partial<Omit<Workout, 'userId' | 'createdAt'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update workouts');
    }

    if (!workoutId || typeof workoutId !== 'string') {
      throw new Error('Valid workout ID is required');
    }

    // Clean the updates to remove undefined values
    const cleanUpdates: any = {
      updatedAt: Timestamp.now()
    };

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        throw new Error('Workout name cannot be empty');
      }
      cleanUpdates.name = updates.name.trim();
    }

    if (updates.duration !== undefined) {
      if (typeof updates.duration !== 'number' || updates.duration <= 0) {
        throw new Error('Duration must be a positive number');
      }
      cleanUpdates.duration = updates.duration;
    }

    if (updates.date !== undefined) {
      cleanUpdates.date = updates.date;
    }

    if (updates.exercises !== undefined) {
      if (!Array.isArray(updates.exercises) || updates.exercises.length === 0) {
        throw new Error('At least one exercise is required');
      }

      // Validate each exercise
      updates.exercises.forEach((exercise, index) => {
        if (!exercise.name || !exercise.name.trim()) {
          throw new Error(`Exercise ${index + 1} must have a name`);
        }
        if (typeof exercise.sets !== 'number' || exercise.sets <= 0) {
          throw new Error(`Exercise ${index + 1} must have positive sets`);
        }
        if (typeof exercise.reps !== 'number' || exercise.reps <= 0) {
          throw new Error(`Exercise ${index + 1} must have positive reps`);
        }
      });

      cleanUpdates.exercises = updates.exercises.map(exercise => ({
        name: exercise.name.trim(),
        sets: exercise.sets,
        reps: exercise.reps,
        ...(exercise.weight !== undefined && exercise.weight > 0 && { weight: exercise.weight }),
        ...(exercise.duration !== undefined && exercise.duration > 0 && { duration: exercise.duration }),
        ...(exercise.distance !== undefined && exercise.distance > 0 && { distance: exercise.distance }),
        ...(exercise.restTime !== undefined && exercise.restTime > 0 && { restTime: exercise.restTime }),
        ...(exercise.notes && { notes: exercise.notes.trim() })
      }));
    }

    if (updates.notes !== undefined) {
      cleanUpdates.notes = updates.notes ? updates.notes.trim() : null;
    }

    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
};

export const deleteWorkout = async (workoutId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete workouts');
    }

    if (!workoutId || typeof workoutId !== 'string') {
      throw new Error('Valid workout ID is required');
    }

    const workoutRef = doc(db, 'workouts', workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

// Firebase configuration object for reference
export const firebaseConfigExport = firebaseConfig;

// Default export
export default app; 