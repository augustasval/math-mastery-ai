import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lightbulb, PartyPopper, BookOpen, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import { SessionManager } from "@/lib/sessionManager";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSolutionQuestion } from "@/components/ExerciseSolutionQuestion";
import { mistakeStorage } from "@/lib/mistakeStorage";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { exercises, type Problem, type DetailedStep } from "@/data";
import { useTranslation } from "@/translations";


const Exercise = () => {
  const navigate = useNavigate();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedIncorrectSteps, setSelectedIncorrectSteps] = useState<number[]>([]);
  const { plan, tasks, markTaskComplete } = useLearningPlan();
  const { incrementExercise } = useTaskProgress();
  const t = useTranslation();

  // Get current task to determine topic
  const currentTask = tasks.find(t => {
    const taskDate = new Date(t.scheduled_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString() && !t.is_completed;
  });

  // Use topic from learning plan
  const topicId = plan?.topic_id || '9-quadratics';
  
  const exerciseSet = exercises[topicId] || exercises['9-quadratics'];
  const sampleProblems = exerciseSet?.problems || [];
  const currentProblem = sampleProblems[currentProblemIndex];
  const isAllComplete = completedCount >= 4;

  const getNextTask = () => {
    const incompleteTasks = tasks
      .filter(t => !t.is_completed)
      .sort((a, b) => a.day_number - b.day_number);
    return incompleteTasks[0] || null;
  };

  const handleKeepLearning = () => {
    const nextTask = getNextTask();
    if (nextTask) {
      localStorage.setItem('currentTaskId', nextTask.id);
      navigate('/learn');
    }
  };

  const goToNextQuestion = async () => {
    if (completedCount >= 4) {
      return; // Already completed all exercises
    }

    // Save mistake if any steps were marked incorrect
    if (selectedIncorrectSteps.length > 0) {
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      mistakeStorage.add({
        type: 'exercise',
        problem: currentProblem.question,
        topic: todayTask?.title || topicId,
        incorrectSteps: selectedIncorrectSteps,
        stepDetails: currentProblem.detailedSolution,
      });
    }

    // Increment exercise count
    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    // Save progress to database
    const sessionId = SessionManager.getSession();
    if (sessionId && tasks.length > 0) {
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      if (todayTask) {
        try {
          await incrementExercise(todayTask.id);
          
          // If completed all 4 exercises, mark task as complete
          if (newCount >= 4) {
            setIsCompleting(true);
            await markTaskComplete(todayTask.id);
            toast.success("Task completed! Great work!");
            return;
          }
        } catch (error) {
          console.error('Error saving exercise progress:', error);
        }
      }
    }

    // Move to next problem
    if (currentProblemIndex < sampleProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Loop back if more exercises needed
      setCurrentProblemIndex(0);
    }
    
    setShowHint(false);
    setShowSolution(false);
    setSelectedIncorrectSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToHome}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/learn?review=true')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t.backToTheory}
            </Button>
          </div>

          <Card className="p-6">
            {isCompleting || isAllComplete ? (
              <div className="text-center py-12 space-y-6">
                <div className="flex justify-center">
                  <PartyPopper className="h-20 w-20 text-primary animate-bounce" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{t.excellentWork}</h2>
                  <p className="text-muted-foreground text-lg">
                    {t.completedAllExercises}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {completedCount}/4 {t.exercisesCompleted} ✓
                </Badge>
                <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
                  {getNextTask() && (
                    <Button onClick={handleKeepLearning} size="lg" className="w-full">
                      {t.keepLearning}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t.backToHome}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">{t.practiceExercises}</h2>
                  <p className="text-muted-foreground">
                    {t.solveProblems}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary">
                      {t.problemOf} {currentProblemIndex + 1} {t.of} {sampleProblems.length}
                    </Badge>
                    <Badge variant="outline">
                      {t.completedExercises} {completedCount}/4
                    </Badge>
                  </div>
                </div>

                <Card className="p-6 bg-accent/5 border-accent mb-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentProblem.question}
                    </ReactMarkdown>
                  </div>
                </Card>

                <div className="flex gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHint ? t.hideHint : t.showHint}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    {showSolution ? t.hideSolution : t.showSolution}
                  </Button>
                </div>

                {showHint && (
                  <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
                    <p className="text-sm font-semibold text-primary mb-1">{t.hint}</p>
                    <p className="text-sm">{currentProblem.hint}</p>
                  </Card>
                )}

                {showSolution && (
                  <>
                    <Card className="p-4 bg-secondary/10 border-secondary/20 mb-4">
                      <p className="text-sm font-semibold mb-3">{t.detailedSolution}</p>
                      <p className="text-xs text-muted-foreground mb-4">{t.clickStepsToMark}</p>
                      <div className="space-y-3">
                        {currentProblem.detailedSolution.map((step, idx) => {
                          const isSelected = selectedIncorrectSteps.includes(idx);
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedIncorrectSteps(selectedIncorrectSteps.filter(i => i !== idx));
                                } else {
                                  setSelectedIncorrectSteps([...selectedIncorrectSteps, idx]);
                                }
                              }}
                              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                isSelected 
                                  ? "border-destructive bg-destructive/5" 
                                  : "border-transparent hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  {isSelected && (
                                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-1" />
                                  )}
                                  <div className="flex-1 prose prose-sm dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                      {step.step}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                <ExerciseSolutionQuestion
                                  problemQuestion={currentProblem.question}
                                  stepContent={step.step}
                                  stepExplanation={step.explanation}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground italic ml-6">{step.explanation}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Button onClick={goToNextQuestion} className="w-full" size="lg">
                      {t.goToNextQuestion}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Exercise;
