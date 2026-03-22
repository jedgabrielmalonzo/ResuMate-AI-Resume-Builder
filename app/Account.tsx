import BackButton from "@/components/ui/BackButton";
import BottomNav from "@/components/ui/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useResumeContext } from "@/context/ResumeContext";
import { resumeService, SavedResume } from "@/services/resumeService";
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
const RED_LIGHT = "#fff0f0";

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
  const { logout, user } = useAuth();
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

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/auth/login");
          } catch {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={RED} />

      {/* Back Button */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <BackButton />
      </View>

      {/* Hero Header */}
      <View style={styles.header}>
        <Initials name={user?.displayName} email={user?.email} />

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.displayName || "User"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>✦ ResuMate Member</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Resumes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Resumes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Resumes</Text>
            <TouchableOpacity
              style={styles.newResumeChip}
              onPress={() => router.push("/resume/form")}
              activeOpacity={0.7}
            >
              <Text style={styles.newResumeChipText}>+ New</Text>
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
              <Text style={styles.emptyIcon}>📝</Text>
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
                  <Text style={styles.resumeIconText}>📄</Text>
                </View>
                <View style={styles.resumeInfo}>
                  <Text style={styles.resumeTitle} numberOfLines={2}>
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
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ Completed</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteResume(resume.id)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  // Header
  header: {
    backgroundColor: RED,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 8,
  },
  memberBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  memberBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },

  // Stats
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#eee",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: RED,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },

  // Section
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  newResumeChip: {
    backgroundColor: RED_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffd0d0",
  },
  newResumeChipText: {
    fontSize: 13,
    color: RED,
    fontWeight: "700",
  },

  // Resume cards
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resumeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: RED_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resumeIconText: { fontSize: 22 },
  resumeInfo: { flex: 1 },
  resumeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 3,
  },
  resumeDate: {
    fontSize: 11,
    color: "#999",
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e8f8f0",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: "#1a8a50",
    fontWeight: "700",
  },
  deleteBtn: {
    padding: 6,
    marginRight: 2,
  },
  deleteIcon: { fontSize: 16, opacity: 0.55 },
  chevron: {
    fontSize: 22,
    color: "#ccc",
    marginLeft: 2,
  },

  // Empty state
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  buildBtn: {
    backgroundColor: RED,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buildBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // Sign out
  signOutBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffd0d0",
    marginTop: 4,
    marginBottom: 10,
  },
  signOutText: {
    color: RED,
    fontSize: 15,
    fontWeight: "700",
  },
});
