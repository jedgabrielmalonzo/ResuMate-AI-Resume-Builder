import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { InterviewAI, JobDetails } from '@/services/interviewAI';
import BackButton from '@/components/ui/BackButton';
import ScreenHeader from '@/components/ui/ScreenHeader';

const RED = '#c40000';

export default function InterviewFormScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: ''
  });

  const handleGenerateQuestions = async () => {
    if (!formData.jobTitle || !formData.companyName) {
      Alert.alert('Error', 'Please fill in job title and company name');
      return;
    }

    setLoading(true);
    try {
      const jobDetails: JobDetails = {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription || undefined
      };

      const questions = await InterviewAI.generateQuestions(jobDetails);

      // Navigate to questions screen with generated questions
      router.push({
        pathname: '/interview/questions',
        params: {
          questions: JSON.stringify(questions),
          jobDetails: JSON.stringify(jobDetails)
        }
      });

    } catch (error) {
      Alert.alert(
        'AI Service Issue',
        'Using fallback questions for now. The AI feature will be improved soon!',
        [{
          text: 'Continue', onPress: () => {
            // Use fallback questions
            const fallbackQuestions = InterviewAI.getFallbackQuestions({
              jobTitle: formData.jobTitle,
              companyName: formData.companyName
            });
            router.push({
              pathname: '/interview/questions',
              params: {
                questions: JSON.stringify(fallbackQuestions),
                jobDetails: JSON.stringify({
                  jobTitle: formData.jobTitle,
                  companyName: formData.companyName,
                  jobDescription: formData.jobDescription
                })
              }
            });
          }
        }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ScreenHeader title="Interview Prep" />

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Fill in the target job details, and our AI will simulate real interview questions tailored to that specific company's culture and role requirements.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Senior Software Engineer"
                value={formData.jobTitle}
                onChangeText={(text) => setFormData(prev => ({ ...prev, jobTitle: text }))}
              />

              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Alogria"
                value={formData.companyName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              />

              <Text style={styles.label}>Job Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Paste the job description here for better accuracy..."
                value={formData.jobDescription}
                onChangeText={(text) => setFormData(prev => ({ ...prev, jobDescription: text }))}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.generateButton, loading && styles.generateButtonDisabled]}
                onPress={handleGenerateQuestions}
                disabled={loading}
              >
                <Text style={styles.generateButtonText}>
                  {loading ? "Generating..." : "Generate mock questions"}
                </Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={RED} />
                  <Text style={styles.loadingText}>AI is preparing your questions...</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#ffecec',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: RED,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: RED,
  },
});