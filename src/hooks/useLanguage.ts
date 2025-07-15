import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getLanguageOptions = () => [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'sv', name: 'Svenska' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ];

  return {
    changeLanguage,
    getCurrentLanguage,
    getLanguageOptions,
    currentLanguage: i18n.language,
  };
};