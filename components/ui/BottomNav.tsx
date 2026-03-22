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
const INACTIVE_COLOR = "rgba(255,255,255,0.4)";
const PILL_BG = "#d3d2d2ff";
const ACTIVE_DOT = "#c40000";

type NavItemProps = {
  route: string;
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function NavItem({ icon, label, active, onPress }: NavItemProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(active ? 1 : 0)).current;

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
          <Text style={styles.icon}>{icon}</Text>
        </Animated.View>
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color: active ? ACTIVE_COLOR : INACTIVE_COLOR },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: string) => {
    if (pathname === route) return;
    router.replace(route as any);
  };

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.pill}>
        <NavItem
          route="/Account"
          icon="👤"
          label="Account"
          active={isActive("/Account")}
          onPress={() => handleNavigation("/Account")}
        />
        <NavItem
          route="/home"
          icon="🏠"
          label="Home"
          active={isActive("/home")}
          onPress={() => handleNavigation("/home")}
        />
        <NavItem
          route="/settings"
          icon="⚙️"
          label="Settings"
          active={isActive("/settings")}
          onPress={() => handleNavigation("/settings")}
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
    backgroundColor: PILL_BG,
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
