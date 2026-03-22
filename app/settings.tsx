import BottomNav from "@/components/ui/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const RED = "#c40000";
const OFF_WHITE = "#f8f9fa";
const BORDER_COLOR = "#e9ecef";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

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

  const SettingItem = ({
    icon,
    label,
    onPress,
    value,
    isLast = false,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    value?: string;
    isLast?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, isLast && { borderBottomWidth: 0 }]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={RED} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#dee2e6" />
      </View>
    </TouchableOpacity>
  );

  const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Summary Card */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push("/Account")}
          activeOpacity={0.9}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName
                ? user.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : user?.email?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || "User"}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#dee2e6" />
        </TouchableOpacity>

        {/* Preferences Section */}
        <Section title="Preferences">
          <SettingItem
            icon="color-palette-outline"
            label="Theme"
            value="Light"
            onPress={() => Alert.alert("Theme", "Dark mode is coming soon!")}
          />
          <SettingItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() =>
              Alert.alert("Notifications", "Notification settings coming soon!")
            }
          />
          <SettingItem
            icon="language-outline"
            label="Language"
            value="English"
            isLast={true}
            onPress={() => {}}
          />
        </Section>

        {/* Support Section */}
        <Section title="Support & Info">
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
          />
          <SettingItem
            icon="information-circle-outline"
            label="About Resumate"
            value="v1.0.0"
            isLast={true}
            onPress={() => {}}
          />
        </Section>

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Made with ❤️ for your career</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: OFF_WHITE,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: RED,
    fontSize: 22,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  profileEmail: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#adb5bd",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "600",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: "#adb5bd",
    marginRight: 8,
    fontWeight: "500",
  },
  accountActions: {
    marginTop: 10,
    alignItems: 'center',
    gap: 15,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe3e3',
  },
  logoutText: {
    color: RED,
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 12,
    color: "#adb5bd",
    fontWeight: "500",
  },
});
