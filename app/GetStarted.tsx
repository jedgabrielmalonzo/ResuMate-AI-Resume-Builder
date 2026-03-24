import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");
const RED = "#c40000";

const ONBOARDING_DATA = [
  {
    id: "1",
    title: "AI-Powered",
    description: "Build a professional resume in minutes with our advanced AI assistant.",
    icon: "robot-outline",
  },
  {
    id: "2",
    title: "Interview Prep",
    description: "Get ready for your dream job with AI-generated practice questions.",
    icon: "chat-processing-outline",
  },
  {
    id: "3",
    title: "Modern Templates",
    description: "Choose from a variety of ATS-friendly and visually stunning templates.",
    icon: "file-document-outline",
  },
];

export default function GetStartedScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(buttonsAnim, {
      toValue: 1,
      duration: 800,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderItem = ({ item }: { item: typeof ONBOARDING_DATA[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={item.icon as any} size={120} color={RED} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {ONBOARDING_DATA.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.listContainer}>
        <Animated.FlatList
          data={ONBOARDING_DATA}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <Paginator />

      <Animated.View style={[styles.footer, { opacity: buttonsAnim }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/auth/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Skip"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ResuMate v1.0 • Resume AI Builder</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    flex: 3,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    flex: 0.7,
    justifyContent: "center",
  },
  textContainer: {
    flex: 0.3,
  },
  title: {
    fontWeight: "800",
    fontSize: 32,
    marginBottom: 10,
    color: RED,
    textAlign: "center",
  },
  description: {
    fontWeight: "400",
    color: "#62656b",
    textAlign: "center",
    paddingHorizontal: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  paginatorContainer: {
    flexDirection: "row",
    height: 64,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: RED,
    marginHorizontal: 8,
  },
  footer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: RED,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  versionText: {
    marginTop: 20,
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
  },
});
