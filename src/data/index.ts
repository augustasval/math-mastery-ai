// Data loader utility for curriculum content
import { useLanguage } from '@/contexts/LanguageContext';

// Import English content
import polynomialsLessonEn from './lessons/9-polynomials.json';
import quadraticsLessonEn from './lessons/9-quadratics.json';
import polynomialsExercisesEn from './exercises/9-polynomials.json';
import quadraticsExercisesEn from './exercises/9-quadratics.json';
import polynomialsPracticeEn from './practice/9-polynomials.json';
import quadraticsPracticeEn from './practice/9-quadratics.json';

// Import Lithuanian content
import polynomialsLessonLt from './lessons/9-polynomials-lt.json';
import quadraticsLessonLt from './lessons/9-quadratics-lt.json';
import polynomialsExercisesLt from './exercises/9-polynomials-lt.json';
import quadraticsExercisesLt from './exercises/9-quadratics-lt.json';
import polynomialsPracticeLt from './practice/9-polynomials-lt.json';
import quadraticsPracticeLt from './practice/9-quadratics-lt.json';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonStep {
  title: string;
  explanation: string;
  example?: string;
  tip?: string;
  quizQuestion: QuizQuestion;
}

export interface Lesson {
  topicId: string;
  title: string;
  introduction: string;
  steps: LessonStep[];
}

export interface DetailedStep {
  step: string;
  explanation: string;
}

export interface Problem {
  id: string;
  question: string;
  answer: string;
  hint: string;
  detailedSolution: DetailedStep[];
}

export interface ExerciseSet {
  topicId: string;
  problems: Problem[];
}

export interface PracticeSet {
  topicId: string;
  problems: Problem[];
}

// Lessons data (includes both EN and LT)
export const lessons: Record<string, Lesson> = {
  "9-polynomials": polynomialsLessonEn as Lesson,
  "9-quadratics": quadraticsLessonEn as Lesson,
  "9-polynomials-lt": polynomialsLessonLt as Lesson,
  "9-quadratics-lt": quadraticsLessonLt as Lesson,
};

// Exercises data (includes both EN and LT)
export const exercises: Record<string, ExerciseSet> = {
  "9-polynomials": polynomialsExercisesEn as ExerciseSet,
  "9-quadratics": quadraticsExercisesEn as ExerciseSet,
  "9-polynomials-lt": polynomialsExercisesLt as ExerciseSet,
  "9-quadratics-lt": quadraticsExercisesLt as ExerciseSet,
};

// Practice data (includes both EN and LT)
export const practice: Record<string, PracticeSet> = {
  "9-polynomials": polynomialsPracticeEn as PracticeSet,
  "9-quadratics": quadraticsPracticeEn as PracticeSet,
  "9-polynomials-lt": polynomialsPracticeLt as PracticeSet,
  "9-quadratics-lt": quadraticsPracticeLt as PracticeSet,
};

// Language-aware data loading functions
export const getLessonByLanguage = (topicId: string, language: 'en' | 'lt'): Lesson | undefined => {
  if (language === 'lt') {
    const ltKey = `${topicId}-lt`;
    return lessons[ltKey] || lessons[topicId];
  }
  return lessons[topicId];
};

export const getExercisesByLanguage = (topicId: string, language: 'en' | 'lt'): ExerciseSet | undefined => {
  if (language === 'lt') {
    const ltKey = `${topicId}-lt`;
    return exercises[ltKey] || exercises[topicId];
  }
  return exercises[topicId];
};

export const getPracticeByLanguage = (topicId: string, language: 'en' | 'lt'): PracticeSet | undefined => {
  if (language === 'lt') {
    const ltKey = `${topicId}-lt`;
    return practice[ltKey] || practice[topicId];
  }
  return practice[topicId];
};

// Legacy functions (for backward compatibility)
export const getLesson = (topicId: string): Lesson | undefined => {
  return lessons[topicId];
};

export const getExercises = (topicId: string): ExerciseSet | undefined => {
  return exercises[topicId];
};

export const getPractice = (topicId: string): PracticeSet | undefined => {
  return practice[topicId];
};

// Custom hook for language-aware content loading
export const useLocalizedContent = () => {
  const { language } = useLanguage();
  
  return {
    getLesson: (topicId: string) => getLessonByLanguage(topicId, language),
    getExercises: (topicId: string) => getExercisesByLanguage(topicId, language),
    getPractice: (topicId: string) => getPracticeByLanguage(topicId, language),
  };
};
