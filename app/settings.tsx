import BottomNav from "@/components/ui/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch,
    Modal,
    Linking,
} from "react-native";

const RED = "#c40000";
const OFF_WHITE = "#f8f9fa";

type ModalContent = 'privacy' | 'terms' | 'about' | null;

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { 
    themePreference, setThemePreference, 
    notificationsEnabled, setNotificationsEnabled,
    language, setLanguage,
    resolvedTheme 
  } = useSettings();

  const [activeModal, setActiveModal] = useState<ModalContent>(null);

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

  const showThemePicker = () => {
    Alert.alert(
      "Select Theme",
      "Choose your preferred appearance.",
      [
        { text: "System Default", onPress: () => setThemePreference('system') },
        { text: "Light", onPress: () => setThemePreference('light') },
        { text: "Dark", onPress: () => setThemePreference('dark') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const showLanguagePicker = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language.",
      [
        { text: "English", onPress: () => setLanguage('en') },
        { text: "Tagalog", onPress: () => setLanguage('tl') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const SettingItem = ({
    icon,
    label,
    onPress,
    value,
    isLast = false,
    hasSwitch = false,
    switchValue = false,
    onSwitchChange,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    value?: string;
    isLast?: boolean;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (val: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, isLast && { borderBottomWidth: 0 }]} 
      onPress={onPress}
      disabled={hasSwitch}
      activeOpacity={0.6}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={RED} />
        </View>
        <Text style={[styles.settingLabel, resolvedTheme === 'dark' && styles.textDark]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange}
            trackColor={{ false: "#eee", true: RED }}
            thumbColor="#fff"
          />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={18} color="#dee2e6" />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const InfoModal = () => {
    const getContent = () => {
      switch (activeModal) {
        case 'privacy':
          return {
            title: 'Privacy Policy',
            body: 'At Resumate, we value your privacy. We only collect data necessary to provide you with the best resume generating experience. Your personal details are stored securely on our encrypted servers and are never shared with third parties without your explicit consent.\n\nWe use Gemini AI to process your inputs, but we do not use your personal data to train public models.'
          };
        case 'terms':
          return {
            title: 'Terms of Service',
            body: 'By using Resumate, you agree to our terms. This application is provided "as is" to help you prepare for your career. You are responsible for the accuracy of information provided in your resumes.\n\nPlease use the AI features ethically and ensure all claims in your generated resumes are truthful.'
          };
        case 'about':
          return {
            title: 'About Resumate',
            body: 'Resumate is your all-in-one AI career assistant. Built with ❤️ for developers and job seekers alike, our mission is to empower you with professional tools to land your dream job.\n\nVersion: 1.0.0\nDeveloper: Resumate Team\nBuilt with Expo & Gemini.'
          };
        default: return { title: '', body: '' };
      }
    };

    const { title, body } = getContent();

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, resolvedTheme === 'dark' && styles.bgDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, resolvedTheme === 'dark' && styles.textDark]}>{title}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalBody, resolvedTheme === 'dark' && styles.textSecondaryDark]}>{body}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, resolvedTheme === 'dark' && styles.bgDarkContainer]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={resolvedTheme === 'dark' ? "light-content" : "dark-content"} />

      <View style={[styles.header, resolvedTheme === 'dark' && styles.bgDarkContainer]}>
        <Text style={[styles.headerTitle, resolvedTheme === 'dark' && styles.textDark]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.profileCard, resolvedTheme === 'dark' && styles.bgDark]}
          onPress={() => router.push("/Account")}
          activeOpacity={0.9}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName
                ? user.displayName.split(" ").map((n) => n[0]).join("")
                : user?.email?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, resolvedTheme === 'dark' && styles.textDark]}>
              {user?.displayName || "User"}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#dee2e6" />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.sectionCard, resolvedTheme === 'dark' && styles.bgDark]}>
            <SettingItem
              icon="color-palette-outline"
              label="Theme"
              value={themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}
              onPress={showThemePicker}
            />
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              hasSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            <SettingItem
              icon="language-outline"
              label="Language"
              value={language === 'en' ? 'English' : 'Tagalog'}
              isLast={true}
              onPress={showLanguagePicker}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Info</Text>
          <View style={[styles.sectionCard, resolvedTheme === 'dark' && styles.bgDark]}>
            <SettingItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => setActiveModal('privacy')}
            />
            <SettingItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => setActiveModal('terms')}
            />
            <SettingItem
              icon="mail-outline"
              label="Contact Support"
              onPress={async () => {
                const url = 'mailto:support@resumate.app';
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert("Error", "No email app found. Please contact us at support@resumate.app");
                }
              }}
            />
            <SettingItem
              icon="information-circle-outline"
              label="About Resumate"
              value="v1.0.0"
              isLast={true}
              onPress={() => setActiveModal('about')}
            />
          </View>
        </View>

        <View style={styles.accountActions}>
          <TouchableOpacity style={[styles.logoutButton, resolvedTheme === 'dark' && styles.bgDark]} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Made with ❤️ for your career</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <InfoModal />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  bgDarkContainer: {
    backgroundColor: '#000',
  },
  bgDark: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2a2a4e',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#adb5bd',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
});
