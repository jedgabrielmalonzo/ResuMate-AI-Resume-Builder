import BottomNav from "@/components/ui/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useResumeContext } from "@/context/ResumeContext";
import { resumeService, SavedResume } from "@/services/resumeService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/context/SettingsContext";

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

  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "#000000" : "#f8f9fa";
  const cardColor = isDark ? "#1a1a2e" : "white";
  const titleColor = isDark ? "#ffffff" : "#1a1a2e";
  const textColor = isDark ? "#adb5bd" : "#6c757d";
  const borderColor = isDark ? "#2c2c3e" : "#e9ecef";

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Page Transitions
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating Backgrounds
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: -15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 10,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Floating background shapes */}
      <Animated.View
        style={[styles.bgTop, { transform: [{ translateY: float1 }] }]}
      />
      <Animated.View
        style={[styles.bgBottom, { transform: [{ translateY: float2 }] }]}
      />

      <View style={[styles.pageHeader, { backgroundColor: bgColor }]}>
        <Text style={[styles.pageHeaderTitle, { color: titleColor }]}>Account</Text>
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fade,
          transform: [{ translateY: slide }],
        }}
      >
        {/* Profile Card instead of stretched header */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <View style={styles.profileSection}>
            <Initials name={user?.displayName || user?.email?.split('@')[0]} email={user?.email} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: titleColor }]} numberOfLines={1}>
                {user?.displayName || (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : "User")}
              </Text>
              <Text style={[styles.userEmail, { color: textColor }]} numberOfLines={1}>
                {user?.email}
              </Text>
              <View style={[styles.memberBadge, isDark && { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                <Ionicons name="sparkles" size={10} color={RED} style={{ marginRight: 4 }} />
                <Text style={styles.memberBadgeText}>RESUMATE MEMBER</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Stats Grid */}
        <View style={[styles.statsGrid, { backgroundColor: cardColor }]}>
          <View style={[styles.statBox, { borderRightColor: borderColor }]}>
            <Text style={[styles.statNumber, { color: titleColor }]}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Resume</Text>
          </View>
          <View style={[styles.statBox, { borderRightColor: borderColor }]}>
            <Text style={[styles.statNumber, { color: titleColor }]}>{resumes.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statBox, { borderRightWidth: 0 }]}>
            <Text style={[styles.statNumber, { color: titleColor }]}>0</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Resumes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: titleColor }]}>My Resumes</Text>
            <TouchableOpacity
              style={[styles.newResumeBtn, { backgroundColor: cardColor, borderColor: borderColor }]}
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
            <View style={[styles.emptyCard, { backgroundColor: cardColor }]}>
              <View style={[styles.emptyIconWrap, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                <Ionicons name="document-text-outline" size={40} color={isDark ? "#495057" : "#adb5bd"} />
              </View>
              <Text style={[styles.emptyTitle, { color: titleColor }]}>No resumes yet</Text>
              <Text style={[styles.emptySubtitle, { color: textColor }]}>
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
                style={[styles.resumeCard, { backgroundColor: cardColor }]}
                onPress={() => handleViewResume(resume)}
                activeOpacity={0.75}
              >
                <View style={[styles.resumeIconWrap, isDark && { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                  <Ionicons name="document" size={24} color={RED} />
                </View>
                <View style={styles.resumeInfo}>
                  <Text style={[styles.resumeTitle, { color: titleColor }]} numberOfLines={1}>
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
                    <Text style={[styles.statusText, { color: textColor }]}>Completed</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteResume(resume.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={isDark ? "#495057" : "#adb5bd"} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={isDark ? "#2c2c3e" : "#dee2e6"} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>

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
  bgTop: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#ffecec",
    opacity: 0.5,
    zIndex: -1,
  },
  bgBottom: {
    position: "absolute",
    bottom: -150,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#f1f3f5",
    opacity: 0.6,
    zIndex: -1,
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
