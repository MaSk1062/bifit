import { describe, it, expect } from 'vitest';

// Import utility functions (you may need to create these or import from existing files)
// For now, I'll create some example utility functions to test

// Example utility functions
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const calculateCalories = (duration: number, activityType: string): number => {
  const caloriesPerMinute: Record<string, number> = {
    running: 11.5,
    cycling: 8.0,
    swimming: 9.0,
    walking: 4.0,
    strength_training: 6.0,
  };
  
  return Math.round((caloriesPerMinute[activityType] || 5.0) * duration);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 15, 2024');
    });

    it('handles different dates', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date);
      expect(formatted).toBe('Dec 25, 2024');
    });
  });

  describe('calculateBMI', () => {
    it('calculates BMI correctly', () => {
      const bmi = calculateBMI(70, 170);
      expect(bmi).toBeCloseTo(24.22, 2);
    });

    it('handles zero values', () => {
      const bmi = calculateBMI(0, 170);
      expect(bmi).toBe(0);
    });

    it('handles very tall person', () => {
      const bmi = calculateBMI(80, 200);
      expect(bmi).toBe(20);
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

    it('uses default calories for unknown activity', () => {
      const calories = calculateCalories(20, 'unknown_activity');
      expect(calories).toBe(100); // 5.0 * 20
    });

    it('handles zero duration', () => {
      const calories = calculateCalories(0, 'running');
      expect(calories).toBe(0);
    });
  });

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

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('This is a very long...');
      expect(truncated.length).toBe(23); // 20 + 3 for '...'
    });

    it('does not truncate short text', () => {
      const text = 'Short text';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('Short text');
    });

    it('handles exact length text', () => {
      const text = 'Exactly twenty chars';
      const truncated = truncateText(text, 20);
      expect(truncated).toBe('Exactly twenty chars');
    });

    it('handles empty string', () => {
      const truncated = truncateText('', 10);
      expect(truncated).toBe('');
    });
  });
}); 