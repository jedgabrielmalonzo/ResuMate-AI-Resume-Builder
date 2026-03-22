import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemePreference = 'system' | 'light' | 'dark';
type Language = 'en' | 'tl';

interface SettingsContextType {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: '@resumate_theme',
  NOTIFICATIONS: '@resumate_notifications',
  LANGUAGE: '@resumate_language',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemeState] = useState<ThemePreference>('system');
  const [notificationsEnabled, setNotificationsState] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [storedTheme, storedNotifs, storedLang] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
      ]);

      if (storedTheme) setThemeState(storedTheme as ThemePreference);
      if (storedNotifs !== null) setNotificationsState(storedNotifs === 'true');
      if (storedLang) setLanguageState(storedLang as Language);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemePreference = async (theme: ThemePreference) => {
    setThemeState(theme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    setNotificationsState(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(enabled));
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const resolvedTheme = themePreference === 'system' 
    ? (deviceColorScheme ?? 'light') 
    : themePreference;

  return (
    <SettingsContext.Provider
      value={{
        themePreference,
        setThemePreference,
        notificationsEnabled,
        setNotificationsEnabled,
        language,
        setLanguage,
        resolvedTheme,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
