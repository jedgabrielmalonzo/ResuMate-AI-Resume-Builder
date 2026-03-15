import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useRouter } from 'expo-router';

const RED = "#c40000";

export default function Home() {
  const router = useRouter();
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
      ])
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
      ])
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
    router.push('/resume/form');
  };

  const handleInterviewPrep = () => {
    router.push('/interview/form');
  };

  const handleHome = () => {
    // Already on home screen
  };

  const handleAccount = () => {
    // Navigate to account screen
    router.push('/Account');
  };

  const handleSettings = () => {
    router.push('/settings');
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
          }
        ]}
      >
        <View style={styles.logoBox}>
          <Image
            source={require('../assets/images/newlogo.png')}
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
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={handleAccount}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeNavItem} onPress={handleHome}>
          <View style={styles.homeCircle}>
            <Text style={styles.homeIcon}>🏠</Text>
          </View>
          <Text style={styles.homeLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleSettings}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },

  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '45%',
    minHeight: 140,
  },

  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: RED,
    textAlign: 'center',
    lineHeight: 20,
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

  homeNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  homeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  homeIcon: {
    fontSize: 20,
    color: 'white',
  },

  homeLabel: {
    fontSize: 12,
    color: RED,
    fontWeight: '600',
  },
});
