import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InterviewQuestion, JobDetails } from '@/services/interviewAI';

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
          
          // Validate data before setting state
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

  // Handle error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#666', textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 20, padding: 12, backgroundColor: '#c40000', borderRadius: 8 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Handle loading state
  if (isLoading || questions.length === 0 || !jobDetails) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#c40000" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
            Loading questions...
          </Text>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
      'You\'ve completed the interview practice session. Keep practicing to improve!',
      [
        { text: 'Try New Job', onPress: () => router.back() },
        { text: 'Home', onPress: () => router.push('/home') }
      ]
    );
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>Loading questions...</Text>
      </View>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return '#FF6B6B';
      case 'BEHAVIORAL': return '#4ECDC4';
      case 'SITUATIONAL': return '#45B7D1';
      case 'COMPANY_SPECIFIC': return '#96CEB4';
      default: return '#95A5A6';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#2ECC71';
      case 'MEDIUM': return '#F39C12';
      case 'HARD': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.jobTitle}>
          Questions for {jobDetails?.jobTitle}
        </Text>
        <Text style={styles.company}>
          at {jobDetails?.companyName}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getCategoryColor(currentQuestion.category) }]}>
              <Text style={styles.badgeText}>{currentQuestion.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) }]}>
              <Text style={styles.badgeText}>{currentQuestion.difficulty}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Expert Tip */}
          {currentQuestion.tips && (
            <View style={styles.tipContainer}>
              <TouchableOpacity 
                style={styles.tipButton}
                onPress={() => setShowTip(!showTip)}
              >
                <Text style={styles.tipButtonText}>
                  💡 {showTip ? 'Hide' : 'Show'} Expert Tip
                </Text>
              </TouchableOpacity>
              
              {showTip && (
                <View style={styles.tipContent}>
                  <Text style={styles.tipText}>{currentQuestion.tips}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Practice Area */}
        <View style={styles.practiceArea}>
          <Text style={styles.practiceTitle}>Practice Your Answer</Text>
          <Text style={styles.practiceSubtitle}>
            Think through your response or practice speaking aloud. 
            Consider using the STAR method for behavioral questions.
          </Text>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finish Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next Question</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: RED,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  tipContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  tipButton: {
    alignSelf: 'flex-start',
  },
  tipButtonText: {
    fontSize: 14,
    color: RED,
    fontWeight: '600',
  },
  tipContent: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  practiceArea: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RED,
    alignItems: 'center',
  },
  navButtonDisabled: {
    borderColor: '#ccc',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: RED,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButton: {
    flex: 2,
    backgroundColor: RED,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  finishButton: {
    flex: 2,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});