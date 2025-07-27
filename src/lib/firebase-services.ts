import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Types for our fitness data
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'running' | 'cycling' | 'strength' | 'yoga' | 'swimming' | 'walking' | 'other';
  title: string;
  duration: number; // in minutes
  distance?: number; // in kilometers
  calories?: number;
  notes?: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'steps' | 'calories' | 'distance' | 'weight' | 'workouts';
  title: string;
  target: number;
  current: number;
  unit: string;
  targetDate?: Timestamp;
  isCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User Services
export const userService = {
  // Get user by ID
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create or update user
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const userRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
      return userRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

// Activity Services
export const activityService = {
  // Get user activities
  async getUserActivities(userId: string, limitCount = 50): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity);
    } catch (error) {
      console.error('Error getting activities:', error);
      throw error;
    }
  },

  // Create activity
  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const activityRef = await addDoc(collection(db, 'activities'), {
        ...activityData,
        createdAt: now,
        updatedAt: now,
      });
      return activityRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  // Update activity
  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<void> {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await updateDoc(activityRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  // Delete activity
  async deleteActivity(activityId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'activities', activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  // Real-time activities listener
  onUserActivitiesChange(userId: string, callback: (activities: Activity[]) => void) {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity);
      callback(activities);
    });
  },
};

// Goal Services
export const goalService = {
  // Get user goals
  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Goal);
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  },

  // Create goal
  async createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const goalRef = await addDoc(collection(db, 'goals'), {
        ...goalData,
        createdAt: now,
        updatedAt: now,
      });
      return goalRef.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  // Update goal
  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  // Delete goal
  async deleteGoal(goalId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Real-time goals listener
  onUserGoalsChange(userId: string, callback: (goals: Goal[]) => void) {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Goal);
      callback(goals);
    });
  },
}; 