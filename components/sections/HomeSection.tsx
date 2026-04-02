import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { ScrollView } from "react-native-gesture-handler";

const RED = "#c40000";

interface HomeSectionProps {
  onBuildResume: () => void;
  onInterviewPrep: () => void;
  onOpenChat: () => void;
}

export default function HomeSection({ onBuildResume, onInterviewPrep, onOpenChat }: HomeSectionProps) {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "#000000" : "#f8f9fa";
  const cardColor = isDark ? "#1a1a2e" : "white";
  const titleColor = isDark ? "#ffffff" : "#1a1a2e";
  const textColor = isDark ? "#adb5bd" : "#6c757d";

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Animated.View
        style={[styles.bgTop, { transform: [{ translateY: float1 }] }]}
      />
      <Animated.View
        style={[styles.bgBottom, { transform: [{ translateY: float2 }] }]}
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/newlogo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>RESUMATE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fade,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <Text style={[styles.greetingTitle, { color: titleColor }]}>
            Build your future
          </Text>
          <Text style={[styles.description, { color: textColor }]}>
            Your intelligent AI companion for finding and securing your dream career.
          </Text>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: cardColor }]}
              onPress={onBuildResume}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, isDark && { backgroundColor: 'rgba(196, 0, 0, 0.1)' }]}>
                <Ionicons name="document-text" size={32} color={RED} />
              </View>
              <Text style={[styles.cardTitle, { color: titleColor }]}>Build my resume</Text>
              <Text style={styles.cardSubtitle}>AI-powered templates</Text>
              <Ionicons name="arrow-forward" size={18} color={RED} style={styles.cardArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: cardColor }]}
              onPress={onInterviewPrep}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(196, 0, 0, 0.1)' : '#fff5f5' }]}>
                <Ionicons name="briefcase" size={32} color={RED} />
              </View>
              <Text style={[styles.cardTitle, { color: titleColor }]}>Interview prep</Text>
              <Text style={styles.cardSubtitle}>Practice with AI</Text>
              <Ionicons name="arrow-forward" size={18} color={RED} style={styles.cardArrow} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onOpenChat}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: RED,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6c757d",
    lineHeight: 22,
    marginBottom: 35,
  },
  cardsGrid: {
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#adb5bd",
  },
  cardArrow: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    opacity: 0.6,
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
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
