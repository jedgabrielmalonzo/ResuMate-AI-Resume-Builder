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

const RED = '#c40000';

type UserRole = 'student' | 'worker';

function RoleButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.roleButton,
        active && { backgroundColor: RED },
      ]}
    >
      <Text
        style={[
          styles.roleText,
          active && { color: '#fff' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

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

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, role);

      Alert.alert('Success', 'Account created successfully.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error: any) {
      console.error('🔥 Signup Error:', error);
      let message = 'Unable to create account. Please try again.';

      if (error?.code === 'auth/email-already-in-use') {
        message = 'This email is already in use.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'The email address is invalid.';
      } else if (error?.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }

      Alert.alert('Signup Failed', message);
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Tell us who you are</Text>

        <View style={styles.roleContainer}>
          <RoleButton
            label="Student"
            active={role === 'student'}
            onPress={() => setRole('student')}
          />
          <RoleButton
            label="Worker"
            active={role === 'worker'}
            onPress={() => setRole('worker')}
          />
        </View>

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

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.mainButton, loading && styles.mainButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.mainButtonText}>
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.switchText}>Already have an account?</Text>
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
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RED,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  roleText: {
    color: RED,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 18,
    padding: 15,
    marginTop: 14,
    backgroundColor: '#fafafa',
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
  switchText: {
    marginTop: 18,
    textAlign: 'center',
    color: RED,
    fontSize: 13,
  },
});
