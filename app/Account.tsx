import BottomNav from "@/components/ui/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useResumeContext } from "@/context/ResumeContext";
import { resumeService, SavedResume } from "@/services/resumeService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#c40000";
const OFF_WHITE = "#f8f9fa";
const BORDER_COLOR = "#e9ecef";

function Initials({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const text = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (email?.[0]?.toUpperCase() ?? "U");
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{text}</Text>
    </View>
  );
}

export default function Account() {
  const router = useRouter();
  const { user } = useAuth();
  const { setGeneratedResumeData, setSelectedTemplateId } = useResumeContext();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      if (user?.uid) {
        try {
          const data = await resumeService.getUserResumes(user.uid);
          setResumes(data);
        } catch (error) {
          console.error("Error fetching resumes:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [user?.uid]);

  const handleViewResume = (resume: SavedResume) => {
    setGeneratedResumeData(resume.resumeData);
    setSelectedTemplateId(resume.templateId);
    router.push("/resume/result");
  };

  const handleDeleteResume = async (resumeId: string) => {
    Alert.alert(
      "Delete Resume",
      "Are you sure you want to delete this resume?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await resumeService.deleteResume(resumeId);
              setResumes((prev) => prev.filter((r) => r.id !== resumeId));
            } catch {
              Alert.alert("Error", "Failed to delete resume.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Account</Text>
      </View>

      {/* Profile Card instead of stretched header */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Initials name={user?.displayName} email={user?.email} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.displayName || "User"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email}
              </Text>
              <View style={styles.memberBadge}>
                <Ionicons name="sparkles" size={10} color={RED} style={{ marginRight: 4 }} />
                <Text style={styles.memberBadgeText}>RESUMATE MEMBER</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Resume</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 0 }]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Resumes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Resumes</Text>
            <TouchableOpacity
              style={styles.newResumeBtn}
              onPress={() => router.push("/resume/form")}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={RED} />
              <Text style={styles.newResumeBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={RED}
              style={{ marginTop: 20 }}
            />
          ) : resumes.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="document-text-outline" size={40} color="#adb5bd" />
              </View>
              <Text style={styles.emptyTitle}>No resumes yet</Text>
              <Text style={styles.emptySubtitle}>
                Build your first AI-powered resume to get started!
              </Text>
              <TouchableOpacity
                style={styles.buildBtn}
                onPress={() => router.push("/resume/form")}
                activeOpacity={0.85}
              >
                <Text style={styles.buildBtnText}>Build Resume</Text>
              </TouchableOpacity>
            </View>
          ) : (
            resumes.map((resume) => (
              <TouchableOpacity
                key={resume.id}
                style={styles.resumeCard}
                onPress={() => handleViewResume(resume)}
                activeOpacity={0.75}
              >
                <View style={styles.resumeIconWrap}>
                  <Ionicons name="document" size={24} color={RED} />
                </View>
                <View style={styles.resumeInfo}>
                  <Text style={styles.resumeTitle} numberOfLines={1}>
                    {resume.title}
                  </Text>
                  <Text style={styles.resumeDate}>
                    {resume.createdAt?.toDate
                      ? resume.createdAt.toDate().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Just now"}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteResume(resume.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#adb5bd" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#dee2e6" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },

  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 5,
    backgroundColor: OFF_WHITE,
  },
  pageHeaderTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  // Profile Card Header
  header: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 24,
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#ffe3e3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: RED,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  memberBadgeText: {
    fontSize: 10,
    color: RED,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 24,
    paddingVertical: 20,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f1f3f5",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#adb5bd",
    fontWeight: "600",
  },

  // Section
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  newResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  newResumeBtnText: {
    fontSize: 14,
    color: RED,
    fontWeight: "700",
    marginLeft: 2,
  },

  // Resume cards
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  resumeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  resumeInfo: { flex: 1 },
  resumeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  resumeDate: {
    fontSize: 12,
    color: "#adb5bd",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2dc937", // Green for completed
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#495057",
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 8,
    marginRight: 4,
  },

  // Empty state
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#f8f9fa",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  buildBtn: {
    backgroundColor: RED,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buildBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },
});
