import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const RED = '#c40000';

interface BackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  label?: string;
}

export default function BackButton({ onPress, style, label = 'Back to Home' }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/home');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={20} color={RED} />
      <Text style={styles.backText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: RED,
    marginLeft: 8,
    fontWeight: '600',
  },
});
