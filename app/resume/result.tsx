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
import { Ionicons } from '@expo/vector-icons';
import { exportResumeToPDF } from '@/utils/pdfGenerator';
import { resumeService } from '@/services/resumeService';
import { useEffect } from 'react';

const RED = '#c40000';

export default function ResumeResultScreen() {
  const router = useRouter();
  const { generatedResumeData, selectedTemplateId } = useResumeContext();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [useLegacyStyle, setUseLegacyStyle] = useState(true);

  let templateId = selectedTemplateId ?? 'chronological';
  
  // Check if it's an old template ID
  const isOldTemplate = ['chronological', 'functional', 'hybrid', 'mini', 'student-entry', 'creative', 'executive'].includes(templateId);
  
  if (isOldTemplate && !useLegacyStyle) {
    if (templateId === 'chronological' || templateId === 'executive') {
       templateId = 'history-no-photo';
    } else {
       templateId = 'skill-no-photo';
    }
  }

  const handleSavePDF = async () => {
    if (!generatedResumeData) return;
    try {
      setSaving(true);
      await exportResumeToPDF(generatedResumeData, templateId, useLegacyStyle && isOldTemplate);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Your Resume</Text>
            <View style={styles.templateBadge}>
              <Text style={styles.templateBadgeText}>
                {templateId.charAt(0).toUpperCase() + templateId.slice(1).replace('-', ' ')}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isOldTemplate && (
            <View style={styles.legacyToggleContainer}>
              <Text style={styles.legacyToggleText}>
                {useLegacyStyle ? "Currently viewing original layout" : "Previewing new ATS-friendly clean layout"}
              </Text>
              <TouchableOpacity 
                style={styles.legacyToggleBtn} 
                onPress={() => setUseLegacyStyle(!useLegacyStyle)}
              >
                <Text style={styles.legacyToggleBtnText}>
                  {useLegacyStyle ? "View New Style" : "View Legacy Style"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {generatedResumeData ? (
            <ResumeDocument data={generatedResumeData} templateId={templateId} legacyColors={useLegacyStyle && isOldTemplate} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resume generated yet.</Text>
            </View>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.pdfBtn]}
            onPress={handleSavePDF}
            disabled={saving || !generatedResumeData}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.pdfBtnText}>Download as PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.rowActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={() => router.push('/resume/form?step=templates')}
              activeOpacity={0.6}
            >
              <Ionicons name="create-outline" size={18} color="#4B5563" />
              <Text style={styles.secondaryBtnText}>Edit Template</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={() => router.push('/home')}
              activeOpacity={0.6}
            >
              <Ionicons name="home-outline" size={18} color="#4B5563" />
              <Text style={styles.secondaryBtnText}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  templateBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  templateBadgeText: {
    color: RED,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
  legacyToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legacyToggleText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  legacyToggleBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  legacyToggleBtnText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },

  actions: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBtn: {
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});