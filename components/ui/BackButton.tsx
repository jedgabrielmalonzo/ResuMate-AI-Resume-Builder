import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

const RED = "#c40000";

interface BackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  label?: string;
  color?: string;
}

export default function BackButton({
  onPress,
  style,
  label = "Back to Home",
  color = RED,
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/home");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={20} color={color} />
      <Text style={[styles.backText, { color: color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});
