import { describe, it, expect } from 'vitest';

// Fitness utility functions
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const calculateCalories = (duration: number, activityType: string): number => {
  const caloriesPerMinute: Record<string, number> = {
    running: 11.5,
    cycling: 8.0,
    swimming: 9.0,
    walking: 4.0,
    strength_training: 6.0,
  };
  
  return Math.round((caloriesPerMinute[activityType] || 5.0) * duration);
};

const calculateTargetHeartRate = (age: number, intensity: number = 0.7): number => {
  const maxHeartRate = 220 - age;
  return Math.round(maxHeartRate * intensity);
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

describe('Fitness Utility Functions', () => {
  describe('calculateBMI', () => {
    it('calculates BMI correctly for normal weight', () => {
      const bmi = calculateBMI(70, 170);
      expect(bmi).toBeCloseTo(24.22, 2);
    });

    it('calculates BMI correctly for overweight', () => {
      const bmi = calculateBMI(85, 170);
      expect(bmi).toBeCloseTo(29.41, 2);
    });

    it('calculates BMI correctly for underweight', () => {
      const bmi = calculateBMI(50, 170);
      expect(bmi).toBeCloseTo(17.30, 2);
    });

    it('handles zero values', () => {
      const bmi = calculateBMI(0, 170);
      expect(bmi).toBe(0);
    });
  });

  describe('calculateCalories', () => {
    it('calculates calories for running', () => {
      const calories = calculateCalories(30, 'running');
      expect(calories).toBe(345); // 11.5 * 30
    });

    it('calculates calories for cycling', () => {
      const calories = calculateCalories(45, 'cycling');
      expect(calories).toBe(360); // 8.0 * 45
    });

    it('calculates calories for swimming', () => {
      const calories = calculateCalories(20, 'swimming');
      expect(calories).toBe(180); // 9.0 * 20
    });

    it('calculates calories for walking', () => {
      const calories = calculateCalories(60, 'walking');
      expect(calories).toBe(240); // 4.0 * 60
    });

    it('uses default calories for unknown activity', () => {
      const calories = calculateCalories(20, 'unknown_activity');
      expect(calories).toBe(100); // 5.0 * 20
    });
  });

  describe('calculateTargetHeartRate', () => {
    it('calculates target heart rate for 30-year-old at 70% intensity', () => {
      const heartRate = calculateTargetHeartRate(30);
      expect(heartRate).toBe(133); // (220 - 30) * 0.7
    });

    it('calculates target heart rate for 50-year-old at 80% intensity', () => {
      const heartRate = calculateTargetHeartRate(50, 0.8);
      expect(heartRate).toBe(136); // (220 - 50) * 0.8
    });

    it('calculates target heart rate for 20-year-old at 60% intensity', () => {
      const heartRate = calculateTargetHeartRate(20, 0.6);
      expect(heartRate).toBe(120); // (220 - 20) * 0.6
    });
  });

  describe('formatDuration', () => {
    it('formats minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(45)).toBe('45m');
    });

    it('formats hours and minutes correctly', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(120)).toBe('2h 0m');
      expect(formatDuration(145)).toBe('2h 25m');
    });

    it('handles zero minutes', () => {
      expect(formatDuration(0)).toBe('0m');
    });
  });
});

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('rejects password without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('rejects password without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('rejects password without numbers', () => {
      const result = validatePassword('NoNumbers');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });
}); 