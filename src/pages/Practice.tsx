import { useState, useEffect } from "react";
import { Target, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { GradeTopicSelector } from "@/components/GradeTopicSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { practice, type Problem, type DetailedStep } from "@/data";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { useTranslation } from "@/translations";

const Practice = () => {
  const { plan } = useLearningPlan();
  const t = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedTopic, setSelectedTopic] = useState(plan?.topic_id || "9-quadratics");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem("9-quadratics", difficulty));
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Update topic when plan loads
  useEffect(() => {
    if (plan?.topic_id && plan.topic_id !== selectedTopic) {
      setSelectedTopic(plan.topic_id);
      setCurrentProblem(generateProblem(plan.topic_id, difficulty));
    }
  }, [plan?.topic_id]);

  function generateProblem(topicId: string, level: string): Problem {
    const practiceSet = practice[topicId] || practice["9-quadratics"];
    const topicProblems = practiceSet?.problems || [];
    return topicProblems[Math.floor(Math.random() * topicProblems.length)];
  }

  const checkAnswer = () => {
    const userAns = userAnswer.toLowerCase().replace(/\s/g, "");
    const correctAns = currentProblem.answer.toLowerCase().replace(/\s/g, "");

    setAttempts(attempts + 1);

    if (userAns === correctAns) {
      setIsCorrect(true);
      setCorrectCount(correctCount + 1);
      toast({
        title: "Correct!",
        description: "Excellent work! You got it right.",
      });

      // Save to mistakes tracking if there were attempts
      if (attempts > 0) {
        const mistakes = JSON.parse(localStorage.getItem("mathMistakes") || "[]");
        mistakes.push({
          problem: currentProblem.question,
          attempts: attempts + 1,
          date: new Date().toISOString(),
          topic: selectedTopic,
        });
        localStorage.setItem("mathMistakes", JSON.stringify(mistakes));
      }
    } else {
      setIsCorrect(false);
      toast({
        title: "Not quite right",
        description: "Try again or check the hint!",
        variant: "destructive",
      });
    }
  };

  const nextProblem = () => {
    setCurrentProblem(generateProblem(selectedTopic, difficulty));
    setUserAnswer("");
    setShowHint(false);
    setShowSolution(false);
    setIsCorrect(null);
    setAttempts(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Navigation />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{t.practiceMode}</h1>
              <p className="text-muted-foreground">
                {t.score} {correctCount}/{correctCount + (isCorrect === false ? 1 : 0)}
              </p>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

        <div className="space-y-6">
          <GradeTopicSelector
            selectedGrade={selectedGrade}
            selectedTopic={selectedTopic}
            onGradeChange={setSelectedGrade}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              nextProblem();
            }}
          />

          <Card className="p-6">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                Problem #{attempts + 1}
              </Badge>
              <div className="prose prose-lg dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentProblem.question}
                </ReactMarkdown>
              </div>
            </div>

              <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t.enterYourAnswer}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                  className="text-lg"
                  disabled={isCorrect === true}
                />
                <Button onClick={checkAnswer} disabled={isCorrect === true || !userAnswer}>
                  {t.checkAnswer}
                </Button>
              </div>

              {isCorrect !== null && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">{t.correct}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">{t.incorrect}</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowHint(!showHint)} className="flex-1">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHint ? t.hide : t.show} {t.hint}
                </Button>
                <Button variant="outline" onClick={() => setShowSolution(!showSolution)} className="flex-1">
                  {showSolution ? t.hide : t.show} Solution
                </Button>
              </div>

              {showHint && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-primary mb-1">{t.hint}</p>
                      <p className="text-sm">{currentProblem.hint}</p>
                    </div>
                  </div>
                </Card>
              )}

              {showSolution && (
                <Card className="p-4 bg-accent/5 border-accent">
                  <h3 className="font-semibold mb-4">{t.stepByStepSolution}</h3>
                  <div className="space-y-4">
                    {currentProblem.detailedSolution.map((step, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <Badge variant="outline" className="mb-2">
                          {t.step} {index + 1}
                        </Badge>
                        <div className="prose prose-sm dark:prose-invert mb-2">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {step.step}
                          </ReactMarkdown>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.explanation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {isCorrect && (
                <Button onClick={nextProblem} className="w-full" size="lg">
                  {t.nextProblem}
                </Button>
              )}
            </div>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
