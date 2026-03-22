import ChatbotModal from "@/components/ChatbotModal";
import BottomNav from "@/components/ui/BottomNav";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const RED = "#c40000";

export default function Home() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 18,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBuildResume = () => {
    router.push("/resume/form");
  };

  const handleInterviewPrep = () => {
    router.push("/interview/form");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating background shapes */}
      <Animated.View
        style={[styles.bgTop, { transform: [{ translateY: float1 }] }]}
      />
      <Animated.View
        style={[styles.bgBottom, { transform: [{ translateY: float2 }] }]}
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: slide }],
          },
        ]}
      >
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/images/newlogo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.logoText}>RESUMATE</Text>

        <Text style={styles.description}>
          Your intelligent companion for finding{"\n"}
          and securing your dream career.
        </Text>

        {/* Action Buttons - Horizontal Layout */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBuildResume}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionButtonText}>Build my{"\n"}resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleInterviewPrep}
          >
            <Text style={styles.actionIcon}>💼</Text>
            <Text style={styles.actionButtonText}>Interview{"\n"}prep</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Floating Chatbot Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setChatOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <ChatbotModal visible={chatOpen} onClose={() => setChatOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  bgTop: {
    position: "absolute",
    top: -140,
    right: -140,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#ffecec",
  },

  bgBottom: {
    position: "absolute",
    bottom: -160,
    left: -160,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#fff2f2",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for bottom navigation
  },

  logoBox: {
    marginBottom: 2,
  },

  logoImage: {
    width: 200,
    height: 200,
  },

  logoText: {
    fontSize: 42,
    fontWeight: "900",
    color: RED,
    letterSpacing: 4,
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },

  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },

  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "45%",
    minHeight: 140,
  },

  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: RED,
    textAlign: "center",
    lineHeight: 20,
  },

  // Floating Action Button (chatbot)
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 26,
  },
});
