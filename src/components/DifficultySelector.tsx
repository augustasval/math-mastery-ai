import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/translations";

interface DifficultySelectorProps {
  value: "easy" | "medium" | "hard";
  onChange: (value: "easy" | "medium" | "hard") => void;
}

export const DifficultySelector = ({ value, onChange }: DifficultySelectorProps) => {
  const t = useTranslation();
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t.level}</span>
      <div className="flex gap-1">
        <Button
          variant={value === "easy" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("easy")}
          className="text-xs"
        >
          {t.easy}
        </Button>
        <Button
          variant={value === "medium" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("medium")}
          className="text-xs"
        >
          {t.medium}
        </Button>
        <Button
          variant={value === "hard" ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("hard")}
          className="text-xs"
        >
          {t.hard}
        </Button>
      </div>
    </div>
  );
};
