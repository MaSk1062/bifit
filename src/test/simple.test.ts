import { describe, it, expect } from 'vitest';

// Simple utility functions for testing
const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;
const isEven = (num: number) => num % 2 === 0;
const formatName = (firstName: string, lastName: string) => `${firstName} ${lastName}`;

describe('Simple Math Functions', () => {
  it('adds two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  it('multiplies two numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 5)).toBe(0);
  });

  it('checks if number is even', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven(0)).toBe(true);
    expect(isEven(-2)).toBe(true);
  });

  it('formats name correctly', () => {
    expect(formatName('John', 'Doe')).toBe('John Doe');
    expect(formatName('Jane', 'Smith')).toBe('Jane Smith');
  });
});

describe('String Operations', () => {
  it('truncates text correctly', () => {
    const truncate = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    expect(truncate('Hello World', 5)).toBe('Hello...');
    expect(truncate('Short', 10)).toBe('Short');
    expect(truncate('', 5)).toBe('');
  });

  it('validates email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

describe('Array Operations', () => {
  it('filters array correctly', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const evenNumbers = numbers.filter(num => num % 2 === 0);
    expect(evenNumbers).toEqual([2, 4, 6]);
  });

  it('maps array correctly', () => {
    const numbers = [1, 2, 3];
    const doubled = numbers.map(num => num * 2);
    expect(doubled).toEqual([2, 4, 6]);
  });

  it('reduces array correctly', () => {
    const numbers = [1, 2, 3, 4];
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    expect(sum).toBe(10);
  });
});

describe('Object Operations', () => {
  it('merges objects correctly', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    const merged = { ...obj1, ...obj2 };
    expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('destructures objects correctly', () => {
    const person = { name: 'John', age: 30, city: 'New York' };
    const { name, age } = person;
    expect(name).toBe('John');
    expect(age).toBe(30);
  });
}); 