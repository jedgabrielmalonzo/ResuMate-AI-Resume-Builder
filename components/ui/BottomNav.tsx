import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACTIVE_COLOR = "#c40000";
const ACTIVE_DOT = "#c40000";

import { useSettings } from "@/context/SettingsContext";

type NavItemProps = {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
};

interface BottomNavProps {
  activeIndex?: number;
  onTabPress?: (index: number) => void;
}

function NavItem({ icon, label, active, onPress }: NavItemProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const inactiveColor = isDark ? "#adb5bd" : "#000000";

  useEffect(() => {
    // Scale uses native driver - runs separately
    Animated.spring(scale, {
      toValue: active ? 1.08 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

    // Background color uses JS driver - runs separately (cannot mix with native)
    Animated.timing(bgOpacity, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active]);

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Outer: JS-animated backgroundColor (useNativeDriver: false) */}
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: bgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(196, 0, 0, 0)", ACTIVE_DOT],
            }),
          },
        ]}
      >
        {/* Inner: native-animated scale (useNativeDriver: true) */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={active ? icon : (`${icon}-outline` as any)}
            size={22}
            color={active ? "#fff" : inactiveColor}
          />
        </Animated.View>
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color: active ? ACTIVE_COLOR : inactiveColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav({ activeIndex, onTabPress }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isControlled = activeIndex !== undefined && onTabPress !== undefined;

  const handleNavigation = (route: string, index: number) => {
    if (isControlled) {
      onTabPress(index);
      return;
    }
    
    if (pathname === route) return;
    router.replace(route as any);
  };

  const isActive = (route: string, index: number) => {
    if (isControlled) return activeIndex === index;
    return pathname === route;
  };

  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const pillBg = isDark ? "#1a1a2e" : "#f0f0f0";

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: pillBg }]}>
        <NavItem
          route="/Account"
          icon="person"
          label="Account"
          active={isActive("/Account", 0)}
          onPress={() => handleNavigation("/Account", 0)}
        />
        <NavItem
          route="/home"
          icon="home"
          label="Home"
          active={isActive("/home", 1)}
          onPress={() => handleNavigation("/home", 1)}
        />
        <NavItem
          route="/settings"
          icon="settings"
          label="Settings"
          active={isActive("/settings", 2)}
          onPress={() => handleNavigation("/settings", 2)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    width: 46,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
