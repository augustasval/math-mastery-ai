import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSelector = () => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Lithuanian' : 'Perjungti į anglų kalbą'}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">{language === 'en' ? 'EN' : 'LT'}</span>
      <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
        {language.toUpperCase()}
      </span>
    </Button>
  );
};
