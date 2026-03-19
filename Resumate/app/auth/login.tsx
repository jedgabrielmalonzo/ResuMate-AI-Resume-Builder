import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useGoogleAuth } from '@/services/authService';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const RED = '#c40000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const { handleGoogleSignIn, isLoading: googleLoading } = useGoogleAuth();

  const anim = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: -14,
          duration: 3200,
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

    // Card entrance animation
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/home');
    } catch (error: any) {
      const message =
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/invalid-email'
          ? 'Invalid email or password'
          : 'Unable to login. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      const userCredential = await handleGoogleSignIn();
      if (userCredential?.user) {
        await signInWithGoogle(userCredential);
        router.replace('/home');
      }
    } catch (error) {
      console.error('onGoogleSignIn error:', error);
      Alert.alert('Google login failed', 'Unable to sign in with Google');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View
        style={[styles.bgTop, { transform: [{ translateY: float1 }] }]}
      />
      <Animated.View
        style={[styles.bgBottom, { transform: [{ translateY: float2 }] }]}
      />

      <Animated.View
        style={[
          styles.card,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Secure access to your account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.mainButton, loading && styles.mainButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading || googleLoading}
        >
          <Text style={styles.mainButtonText}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </Text>
        </TouchableOpacity>

        {/* Google SSO Button */}
        <TouchableOpacity 
          style={[styles.googleButton, (loading || googleLoading) && styles.googleButtonDisabled]} 
          onPress={onGoogleSignIn}
          disabled={loading || googleLoading}
        >
          <FontAwesome5 name="google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>
            {googleLoading ? 'WAITING...' : 'SIGN IN WITH GOOGLE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/auth/signup')}
          disabled={loading}
        >
          <Text style={styles.switchText}>Create new account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: -140,
    right: -140,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ffecec',
  },
  bgBottom: {
    position: 'absolute',
    bottom: -160,
    left: -160,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#fff2f2',
  },
  card: {
    width: '88%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 28,
    shadowColor: RED,
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: RED,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 18,
    padding: 15,
    marginTop: 14,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 18,
    marginTop: 14,
    backgroundColor: '#fafafa',
    paddingRight: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  eyeButton: {
    padding: 5,
  },
  mainButton: {
    backgroundColor: RED,
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 24,
  },
  mainButtonDisabled: {
    opacity: 0.6,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '700',
  },
  switchText: {
    marginTop: 18,
    textAlign: 'center',
    color: RED,
    fontSize: 13,
  },
});
