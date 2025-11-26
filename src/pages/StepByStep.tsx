import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { GradeTopicSelector, curriculumTopics } from "@/components/GradeTopicSelector";
import { StepQuestionDialog } from "@/components/StepQuestionDialog";
import { TheoryQuiz } from "@/components/TheoryQuiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import { SessionManager } from "@/lib/sessionManager";
import { lessons, type Lesson, type LessonStep, type QuizQuestion } from "@/data";
import { useTranslation } from "@/translations";


const StepByStep = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const { plan, tasks } = useLearningPlan();
  const { markQuizPassed } = useTaskProgress();
  const t = useTranslation();

  useEffect(() => {
    // Check if in review mode (from "Back to Theory" button)
    const isReviewMode = searchParams.get('review') === 'true';
    if (isReviewMode) {
      // Skip redirect if in review mode
      return;
    }

    // Check if quiz already passed for today's task
    const checkProgress = async () => {
      const sessionId = SessionManager.getSession();
      if (!sessionId || tasks.length === 0) return;

      // Get today's task
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      if (!todayTask) return;

      // Check if quiz passed
      const { data: progressData } = await supabase
        .from('task_progress')
        .select('quiz_passed')
        .eq('task_id', todayTask.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (progressData?.quiz_passed) {
        // Quiz already passed, redirect to exercises
        navigate('/exercice');
      }
    };

    checkProgress();
  }, [tasks, navigate, searchParams]);

  const topicId = plan?.topic_id || "9-quadratics";
  const currentLesson = lessons[topicId] || lessons["9-quadratics"];
  const totalSteps = currentLesson.steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const startQuiz = () => {
    // Collect pregenerated quiz questions from all steps
    const questions = currentLesson.steps.map(step => step.quizQuestion);
    setQuizQuestions(questions);
    setShowQuiz(true);
    toast.success(t.startQuiz);
  };

  const handleQuizComplete = async (score: number) => {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const mistakes = quizQuestions.length - score;
    
    toast.success(`Quiz complete! You scored ${score}/${quizQuestions.length} (${percentage}%)`);

    // If passed (2 or fewer mistakes), mark progress
    if (mistakes <= 2) {
      const sessionId = SessionManager.getSession();
      if (!sessionId || tasks.length === 0) return;

      // Get today's task
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      if (todayTask) {
        try {
          await markQuizPassed(todayTask.id);
        } catch (error) {
          console.error('Error saving quiz progress:', error);
        }
      }
    }
  };

  const handleReadTheory = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
    setCurrentStep(0);
  };

  const handleRetryQuiz = () => {
    setShowQuiz(false);
    // Small delay to allow reset
    setTimeout(() => {
      const questions = currentLesson.steps.map(step => step.quizQuestion);
      setQuizQuestions(questions);
      setShowQuiz(true);
    }, 100);
  };

  const handleStartPractice = () => {
    navigate('/practice');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToHome}
          </Button>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">{currentLesson.title}</h2>
              <p className="text-muted-foreground">{currentLesson.introduction}</p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary">
                  {t.stepOf} {currentStep + 1} {t.of} {totalSteps}
                </Badge>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {!showQuiz ? (
              <>
                <Card className="p-6 bg-accent/5 border-accent mb-6 min-h-[400px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      {currentLesson.steps[currentStep].title}
                    </h3>
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert mb-4 flex-1">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentLesson.steps[currentStep].explanation}
                    </ReactMarkdown>
                  </div>

                  {currentLesson.steps[currentStep].example && (
                    <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-primary">{t.example}</p>
                        <StepQuestionDialog
                          stepContent={currentLesson.steps[currentStep].title}
                          stepExplanation={currentLesson.steps[currentStep].explanation}
                          stepExample={currentLesson.steps[currentStep].example}
                          topic={topicId}
                          gradeLevel={selectedGrade}
                        />
                      </div>
                      <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {currentLesson.steps[currentStep].example}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  )}

                  {currentLesson.steps[currentStep].tip && (
                    <Card className="p-4 bg-secondary/10 border-secondary/20">
                      <p className="text-sm font-semibold mb-1">{t.proTip}</p>
                      <p className="text-sm">{currentLesson.steps[currentStep].tip}</p>
                    </Card>
                  )}
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    {t.previousStep}
                  </Button>
                  {isLastStep ? (
                    <Button onClick={startQuiz}>
                      {t.startQuiz}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                    >
                      {t.nextStep}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <TheoryQuiz
                questions={quizQuestions}
                onComplete={handleQuizComplete}
                onReadTheory={handleReadTheory}
                onRetry={handleRetryQuiz}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StepByStep;
