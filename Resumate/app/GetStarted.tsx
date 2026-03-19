import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');
const RED = '#c40000';

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered', desc: 'Smart resume generation' },
  { icon: '💼', title: 'Interview Prep', desc: 'Practice with AI questions' },
  { icon: '📄', title: 'PDF Export', desc: 'Share & print professionally' },
];

export default function GetStartedScreen() {
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating background blobs
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: -20, duration: 3400, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 3400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 18, duration: 4000, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    // Staggered entrance
    Animated.stagger(150, [
      Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(featuresAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(buttonsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const makeSlide = (anim: Animated.Value, fromY = 30) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [fromY, 0],
        }),
      },
    ],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Floating blobs */}
        <Animated.View style={[styles.blobTop, { transform: [{ translateY: float1 }] }]} />
        <Animated.View style={[styles.blobBottom, { transform: [{ translateY: float2 }] }]} />

        {/* Logo */}
        <Animated.View style={[styles.logoWrap, makeSlide(logoAnim, 20)]}>
          <Image
            source={require('../assets/images/newlogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.headlineWrap, makeSlide(textAnim)]}>
          <Text style={styles.headline}>RESUMATE</Text>
          <Text style={styles.tagline}>
            Land your dream job with{'\n'}AI-crafted resumes
          </Text>
        </Animated.View>

        {/* Feature pills */}
        <Animated.View style={[styles.featuresRow, makeSlide(featuresAnim)]}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonsWrap, makeSlide(buttonsAnim)]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          <Text style={styles.legalNote}>
            Free to use • No credit card required
          </Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  // Background blobs
  blobTop: {
    position: 'absolute',
    top: -130,
    right: -130,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#ffecec',
  },
  blobBottom: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#fff2f2',
  },

  // Logo
  logoWrap: {
    marginBottom: 8,
  },
  logo: {
    width: 160,
    height: 160,
  },

  // Headline
  headlineWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 38,
    fontWeight: '900',
    color: RED,
    letterSpacing: 5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Feature cards row
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 36,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0e0',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: RED,
    textAlign: 'center',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Buttons
  buttonsWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: RED,
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: RED,
  },
  secondaryBtnText: {
    color: RED,
    fontSize: 17,
    fontWeight: '700',
  },
  legalNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#aaa',
  },
});
