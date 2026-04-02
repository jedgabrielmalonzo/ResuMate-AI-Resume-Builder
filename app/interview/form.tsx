import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InputField from '@/components/ui/InputField';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { InterviewAI, JobDetails } from '@/services/interviewAI';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <ScreenHeader
          title="Interview Prep"
          subtitle="Practice with AI-generated questions tailored to your target role"
          showBorder
        />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#666" />
              <ThemedText style={styles.infoText}>
                Our AI will simulate real interview questions tailored to the company's culture and role requirements.
              </ThemedText>
            </View>

            <ThemedView style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconTitle}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                    <Ionicons name="briefcase" size={20} color={RED} />
                  </View>
                  <ThemedText style={styles.sectionTitle}>Job Details</ThemedText>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Job Title</ThemedText>
                <InputField
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.jobTitle}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, jobTitle: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Company Name</ThemedText>
                <InputField
                  placeholder="e.g. Google"
                  value={formData.companyName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <ThemedText style={styles.inputLabel}>Job Description</ThemedText>
                  <ThemedText style={styles.optionalLabel}>(Optional)</ThemedText>
                </View>
                <InputField
                  placeholder="Paste the job description for better accuracy..."
                  value={formData.jobDescription}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, jobDescription: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ThemedView>

            <TouchableOpacity
              style={[styles.generateButton, loading && styles.generateButtonDisabled]}
              onPress={handleGenerateQuestions}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.generateButtonText}>
                {loading ? "Preparing your questions..." : "Generate Mock Questions"}
              </Text>
              {!loading && <Ionicons name="sparkles" size={20} color="#fff" />}
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={RED} />
                <ThemedText style={styles.loadingText}>AI is analyzing the role and generating questions...</ThemedText>
              </View>
            )}
          </ThemedView>
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
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#E9ECEF',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: RED,
    fontWeight: '600',
  },
});
