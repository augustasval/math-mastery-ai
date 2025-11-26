import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/translations";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CurriculumTopic {
  id: string;
  name: string;
  grade: string;
}

export const curriculumTopics: Record<string, CurriculumTopic[]> = {
  "9": [
    { id: "9-polynomials", name: "Polynomials", grade: "9" },
    { id: "9-quadratics", name: "Quadratic Equations", grade: "9" },
  ],
};

const getTopicName = (topicId: string, language: 'en' | 'lt') => {
  const translations = {
    en: {
      "9-polynomials": "Polynomials",
      "9-quadratics": "Quadratic Equations"
    },
    lt: {
      "9-polynomials": "Polinomai",
      "9-quadratics": "Kvadratinės lygtys"
    }
  };
  return translations[language][topicId as keyof typeof translations.en] || topicId;
};

interface GradeTopicSelectorProps {
  selectedGrade: string;
  selectedTopic: string;
  onGradeChange: (grade: string) => void;
  onTopicChange: (topic: string) => void;
}

export const GradeTopicSelector = ({
  selectedGrade,
  selectedTopic,
  onGradeChange,
  onTopicChange,
}: GradeTopicSelectorProps) => {
  const topics = curriculumTopics[selectedGrade] || [];
  const t = useTranslation();
  const { language } = useLanguage();

  return (
    <Card className="p-4 bg-accent/5 border-accent">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.gradeLevel}</label>
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder={t.selectGrade} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">{t.grade9}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t.curriculumTopic}</label>
          <Select value={selectedTopic} onValueChange={onTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder={t.selectTopic} />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {getTopicName(topic.id, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
