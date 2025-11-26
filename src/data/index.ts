// Data loader utility for curriculum content
import { useLanguage } from '@/contexts/LanguageContext';
import polynomialsLesson from './lessons/9-polynomials.json';
import quadraticsLesson from './lessons/9-quadratics.json';
import polynomialsExercises from './exercises/9-polynomials.json';
import quadraticsExercises from './exercises/9-quadratics.json';
import polynomialsPractice from './practice/9-polynomials.json';
import quadraticsPractice from './practice/9-quadratics.json';

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

// Lessons data
const lessons: Record<string, Lesson> = {
  "9-polynomials": polynomialsLesson as Lesson,
  "9-quadratics": quadraticsLesson as Lesson,
};

// Exercises data
const exercises: Record<string, ExerciseSet> = {
  "9-polynomials": polynomialsExercises as ExerciseSet,
  "9-quadratics": quadraticsExercises as ExerciseSet,
};

// Practice data
const practice: Record<string, PracticeSet> = {
  "9-polynomials": polynomialsPractice as PracticeSet,
  "9-quadratics": quadraticsPractice as PracticeSet,
};

export const getLesson = (topicId: string): Lesson | undefined => {
  return lessons[topicId];
};

export const getExercises = (topicId: string): ExerciseSet | undefined => {
  return exercises[topicId];
};

export const getPractice = (topicId: string): PracticeSet | undefined => {
  return practice[topicId];
};

export { lessons, exercises, practice };
