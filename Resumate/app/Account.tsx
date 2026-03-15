import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useResumeContext } from '@/context/ResumeContext';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Stack } from 'expo-router';

import { resumeService, SavedResume } from '@/services/resumeService';
import { useEffect, useState } from 'react';

const RED = '#c40000';

export default function Account() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      if (user?.uid) {
        try {
          const data = await resumeService.getUserResumes(user.uid);
          setResumes(data);
        } catch (error) {
          console.error('Error fetching resumes:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [user?.uid]);

  const { setGeneratedResumeData, setSelectedTemplateId } = useResumeContext();

  const handleViewResume = (resume: SavedResume) => {
    // Set the context with the selected resume data
    setGeneratedResumeData(resume.resumeData);
    setSelectedTemplateId(resume.templateId);
    // Navigate to the result page (which shows the preview/PDF export)
    router.push('/resume/result');
  };

  const handleDeleteResume = async (resumeId: string) => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this resume?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await resumeService.deleteResume(resumeId);
              setResumes(prev => prev.filter(r => r.id !== resumeId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete resume.');
            }
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleHome = () => {
    // Navigate to home screen
    router.push('/home');
  };

  const handleAccount = () => {
    // Already on account screen
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <ScreenHeader title="Account" backLabel="Home" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userIdText} numberOfLines={1}>ID: {user?.uid?.substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Account Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Resumes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {resumes.length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Previous Resumes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Resumes</Text>

          {loading ? (
            <ActivityIndicator size="small" color={RED} style={{ marginTop: 20 }} />
          ) : resumes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resumes found. Create one to get started!</Text>
            </View>
          ) : (
            resumes.map((resume) => (
              <TouchableOpacity
                key={resume.id}
                style={styles.resumeItem}
                onPress={() => handleViewResume(resume)}
              >
                <View style={styles.resumeIcon}>
                  <Text style={styles.resumeIconText}>📄</Text>
                </View>
                <View style={styles.resumeDetails}>
                  <Text style={styles.resumeTitle} numberOfLines={2}>{resume.title}</Text>
                  <Text style={styles.resumeDate}>
                    {resume.createdAt?.toDate ? resume.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </Text>
                  <View style={[styles.statusBadge, styles.completedBadge]}>
                    <Text style={[styles.statusText, styles.completedText]}>Completed</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteResume(resume.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Notifications</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionText}>Help & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.accountNavItem} onPress={handleAccount}>
          <View style={styles.accountCircle}>
            <Text style={styles.accountIcon}>👤</Text>
          </View>
          <Text style={styles.accountLabel}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleHome}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettings}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: RED,
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  quarterInput: {
    flex: 0.7,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userIdText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: RED,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 12,
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resumeIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resumeIconText: {
    fontSize: 18,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 4,
  },
  resumeDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedBadge: {
    backgroundColor: '#d1f2eb',
  },
  draftBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  completedText: {
    color: '#0f5132',
  },
  draftText: {
    color: '#664d03',
  },
  chevron: {
    fontSize: 18,
    color: '#adb5bd',
    marginLeft: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 22,
    textAlign: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#343a40',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6c757d',
    textAlign: 'center',
    fontSize: 14,
  },
  deleteButton: {
    padding: 10,
    marginRight: 5,
  },
  deleteIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingBottom: 35,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
  },
  accountNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  accountCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  accountIcon: {
    fontSize: 20,
    color: 'white',
  },
  accountLabel: {
    fontSize: 12,
    color: RED,
    fontWeight: '600',
  },
});