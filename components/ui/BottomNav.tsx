import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RED = "#c40000";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: string) => {
    if (pathname === route) return; // Prevent pushing same route
    router.replace(route as any);
  };

  const isActive = (route: string) => {
    return pathname === route;
  };

  const NavItem = ({
    route,
    icon,
    label,
  }: {
    route: string;
    icon: string;
    label: string;
  }) => {
    const active = isActive(route);

    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation(route)}
        activeOpacity={0.7}
      >
        {active ? (
          <View style={styles.navActiveCircle}>
            <Text style={styles.navActiveIcon}>{icon}</Text>
          </View>
        ) : (
          <Text style={styles.navIcon}>{icon}</Text>
        )}
        <Text style={[styles.navLabel, active && styles.navActiveLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      <NavItem route="/Account" icon="👤" label="Account" />
      <NavItem route="/home" icon="🏠" label="Home" />
      <NavItem route="/settings" icon="⚙️" label="Settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navActiveCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  navActiveIcon: {
    fontSize: 22,
    color: "#fff",
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 6,
    opacity: 0.7,
  },
  navLabel: {
    fontSize: 12,
    color: "#666",
  },
  navActiveLabel: {
    color: RED,
    fontWeight: "700",
  },
});
