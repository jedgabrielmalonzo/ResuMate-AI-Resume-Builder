import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useResumeContext } from '@/context/ResumeContext';
import { useAuth } from '@/context/AuthContext';
import ResumeDocument from '@/components/resume/ResumeDocument';
import { exportResumeToPDF } from '@/utils/pdfGenerator';
import { resumeService } from '@/services/resumeService';
import { useEffect } from 'react';

const RED = '#c40000';

export default function ResumeResultScreen() {
  const router = useRouter();
  const { generatedResumeData, selectedTemplateId } = useResumeContext();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const templateId = selectedTemplateId ?? 'chronological';


  const handleSavePDF = async () => {
    if (!generatedResumeData) return;
    try {
      setSaving(true);
      const savedFile = await exportResumeToPDF(generatedResumeData, templateId);
      Alert.alert(
        'Resume Saved',
        Platform.OS === 'android'
          ? `Your resume has been saved as ${savedFile.fileName}.\n\nTip: On first save, choose your Downloads folder when prompted.`
          : `Your resume has been saved as ${savedFile.fileName}.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save PDF.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Resume</Text>
          <Text style={styles.headerSubtitle}>
            Template: {templateId.charAt(0).toUpperCase() + templateId.slice(1)}
          </Text>
        </View>

        {/* Resume document scroll area */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {generatedResumeData ? (
            <ResumeDocument data={generatedResumeData} templateId={templateId} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resume generated yet.</Text>
            </View>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.pdfBtn]}
            onPress={handleSavePDF}
            disabled={saving || !generatedResumeData}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.pdfBtnText}>Save Document</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryBtnText}>✏️  Continue Editing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.secondaryBtnText}>🏠  Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },

  header: {
    backgroundColor: RED,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#ffcdd2',
    fontSize: 13,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 16 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: '#888' },

  actions: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBtn: {
    backgroundColor: RED,
  },
  pdfBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryBtnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});