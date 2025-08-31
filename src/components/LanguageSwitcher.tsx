import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
  showLabel?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className,
  showLabel = true 
}) => {
  const { currentLanguage, changeLanguage, getLanguageOptions } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const languages = getLanguageOptions();

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const getFlag = (code: string) => {
    const flags: Record<string, string> = {
      en: '🇺🇸',
      tr: '🇹🇷', 
      sv: '🇸🇪',
      es: '🇪🇸',
      fr: '🇫🇷'
    };
    return flags[code] || '🌐';
  };

  if (variant === 'floating') {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "h-14 w-14 rounded-full shadow-2xl border-0 transition-all duration-300",
                "bg-gradient-to-r from-primary via-primary/90 to-primary/80",
                "hover:shadow-primary/25 hover:shadow-2xl hover:scale-105",
                "dark:shadow-primary/20",
                isOpen && "scale-105 shadow-primary/30"
              )}
            >
              <Globe className="w-6 h-6 text-primary-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align="end"
            className={cn(
              "w-56 mb-2 shadow-2xl border-0 backdrop-blur-xl",
              "bg-background/80 dark:bg-background/90",
              "animate-in slide-in-from-bottom-2"
            )}
          >
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 cursor-pointer",
                  "hover:bg-primary/10 dark:hover:bg-primary/20",
                  "transition-all duration-200",
                  currentLanguage === language.code && "bg-primary/5 dark:bg-primary/10"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFlag(language.code)}</span>
                  <span className="font-medium">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center space-x-2 h-9 px-3 rounded-full",
              "hover:bg-accent/50 dark:hover:bg-accent/30",
              "transition-all duration-200",
              className
            )}
          >
            <span className="text-lg">{getFlag(currentLanguage)}</span>
            <ChevronDown className={cn(
              "w-3 h-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className={cn(
            "w-48 shadow-xl border-0",
            "bg-background/95 backdrop-blur-sm",
            "animate-in slide-in-from-top-2"
          )}
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center justify-between px-3 py-2 cursor-pointer",
                "hover:bg-accent/50 dark:hover:bg-accent/30",
                "transition-all duration-200",
                currentLanguage === language.code && "bg-accent/20"
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getFlag(language.code)}</span>
                <span className="text-sm font-medium">{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="w-3 h-3 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center space-x-3 h-11 px-4 rounded-xl",
            "border-2 border-border/50 hover:border-primary/50",
            "bg-background/50 hover:bg-background/80 backdrop-blur-sm",
            "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
            "dark:hover:shadow-primary/10",
            className
          )}
        >
          <Globe className="w-5 h-5 text-muted-foreground" />
          {showLabel && (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getFlag(currentLanguage)}</span>
                <span className="font-medium text-foreground">
                  {currentLang?.name || 'Language'}
                </span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className={cn(
          "w-64 shadow-2xl border-0 p-2",
          "bg-background/95 backdrop-blur-xl",
          "animate-in slide-in-from-top-2"
        )}
      >
        <div className="text-xs font-semibold text-muted-foreground px-3 py-2 mb-1">
          Choose Language
        </div>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg m-1",
              "hover:bg-primary/10 dark:hover:bg-primary/20",
              "transition-all duration-200 hover:scale-[1.02]",
              currentLanguage === language.code && "bg-primary/5 dark:bg-primary/10 shadow-sm"
            )}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFlag(language.code)}</span>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{language.name}</span>
                <span className="text-xs text-muted-foreground">{language.code.toUpperCase()}</span>
              </div>
            </div>
            {currentLanguage === language.code && (
              <div className="flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full">
                <Check className="w-3 h-3 text-primary" />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;