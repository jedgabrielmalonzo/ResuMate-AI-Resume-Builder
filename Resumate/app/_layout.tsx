import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { ResumeContext } from '@/context/ResumeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [generatedResumeData, setGeneratedResumeData] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  return (
    <ResumeContext.Provider value={{ generatedResumeData, setGeneratedResumeData, selectedTemplateId, setSelectedTemplateId }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ResumeContext.Provider>
  );
}
