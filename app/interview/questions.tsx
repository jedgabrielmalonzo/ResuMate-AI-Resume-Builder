import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InterviewQuestion, JobDetails } from '@/services/interviewAI';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ScreenHeader from '@/components/ui/ScreenHeader';

const RED = '#c40000';

export default function InterviewQuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        if (params.questions && params.jobDetails) {
          const parsedQuestions = JSON.parse(params.questions as string);
          const parsedJobDetails = JSON.parse(params.jobDetails as string);
          
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            setJobDetails(parsedJobDetails);
            setError(null);
          } else {
            setError('No questions available');
          }
        } else {
          setError('Missing data');
        }
      } catch (parseError) {
        console.error('Failed to parse data:', parseError);
        setError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.questions, params.jobDetails]);

  if (error || isLoading || questions.length === 0 || !jobDetails) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centeredContent}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={RED} />
              <ThemedText style={styles.loadingText}>Preparing questions...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="alert-circle" size={48} color="#ccc" />
              <ThemedText style={styles.errorText}>{error || 'Something went wrong'}</ThemedText>
              <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
                <ThemedText style={styles.errorButtonText}>Go Back</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ThemedView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowTip(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowTip(false);
    }
  };

  const handleFinish = () => {
    Alert.alert(
      'Great Job!',
      'You\'ve completed the interview practice session.',
      [
        { text: 'Try Another', onPress: () => router.back() },
        { text: 'Done', style: 'cancel', onPress: () => router.push('/home') }
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return '#4dabf7';
      case 'BEHAVIORAL': return '#51cf66';
      case 'SITUATIONAL': return '#fcc419';
      case 'COMPANY_SPECIFIC': return '#ff922b';
      default: return '#adb5bd';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#40c057';
      case 'MEDIUM': return '#fab005';
      case 'HARD': return '#fa5252';
      default: return '#adb5bd';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title="Practice" 
          subtitle={`${jobDetails.jobTitle} at ${jobDetails.companyName}`}
          showBorder
        />
        <ThemedView style={styles.content}>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Session Progress</ThemedText>
              <ThemedText style={styles.progressCount}>{currentQuestionIndex + 1} / {questions.length}</ThemedText>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.questionCard}>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: getCategoryColor(currentQuestion.category) }]}>
                  <ThemedText style={styles.badgeText}>{currentQuestion.category}</ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) }]}>
                  <ThemedText style={styles.badgeText}>{currentQuestion.difficulty}</ThemedText>
                </View>
              </View>

              <ThemedText style={styles.questionText}>{currentQuestion.question}</ThemedText>

              {currentQuestion.tips && (
                <View style={styles.tipSection}>
                  <TouchableOpacity 
                    style={styles.tipHeader}
                    onPress={() => setShowTip(!showTip)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tipTitleRow}>
                      <Ionicons name="bulb" size={18} color={RED} />
                      <ThemedText style={styles.tipTitle}>Expert Advice</ThemedText>
                    </View>
                    <Ionicons name={showTip ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                  </TouchableOpacity>
                  
                  {showTip && (
                    <View style={styles.tipBody}>
                      <ThemedText style={styles.tipText}>{currentQuestion.tips}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </ThemedView>

            <View style={styles.practiceHint}>
              <Ionicons name="mic-outline" size={24} color="#666" />
              <ThemedText style={styles.hintText}>
                Try answering this aloud. Pay attention to your pace and clarity.
              </ThemedText>
            </View>
          </ScrollView>

          <View style={styles.navigation}>
            <TouchableOpacity 
              style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <Ionicons name="arrow-back" size={20} color={currentQuestionIndex === 0 ? "#ccc" : RED} />
            </TouchableOpacity>

            {currentQuestionIndex === questions.length - 1 ? (
              <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                <ThemedText style={styles.finishButtonText}>Complete Session</ThemedText>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <ThemedText style={styles.nextButtonText}>Next Question</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: RED,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '800',
    color: RED,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: RED,
    borderRadius: 4,
  },
  scrollArea: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 32,
    marginBottom: 24,
  },
  tipSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: RED,
  },
  tipBody: {
    marginTop: 12,
    backgroundColor: '#fff9db',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#fab005',
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  practiceHint: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginVertical: 20,
    opacity: 0.6,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  navButtonDisabled: {
    borderColor: '#eee',
  },
  nextButton: {
    flex: 1,
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    gap: 10,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    gap: 10,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});