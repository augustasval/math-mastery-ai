import { useLanguage } from '@/contexts/LanguageContext';
import { en } from './en';
import { lt } from './lt';

export const translations = { en, lt };

export const useTranslation = () => {
  const { language } = useLanguage();
  return translations[language];
};

export { useLanguage };
