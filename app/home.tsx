import ChatbotModal from "@/components/ChatbotModal";
import BottomNav from "@/components/ui/BottomNav";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import PagerView from 'react-native-pager-view';
import HomeSection from "@/components/sections/HomeSection";
import AccountSection from "@/components/sections/AccountSection";
import SettingsSection from "@/components/sections/SettingsSection";

export default function Home() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "#000000" : "#f8f9fa";

  const [activeIndex, setActiveIndex] = useState(1); // Default to Home (index 1)
  const pagerRef = useRef<PagerView>(null);

  const handleBuildResume = () => {
    router.push("/resume/form");
  };

  const handleInterviewPrep = () => {
    router.push("/interview/form");
  };

  const onPageSelected = (e: any) => {
    setActiveIndex(e.nativeEvent.position);
  };

  const onTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <PagerView 
        style={styles.pagerView} 
        initialPage={1} 
        ref={pagerRef}
        onPageSelected={onPageSelected}
      >
        <View key="0">
          <AccountSection />
        </View>
        <View key="1">
          <HomeSection 
            onBuildResume={handleBuildResume} 
            onInterviewPrep={handleInterviewPrep} 
            onOpenChat={() => setChatOpen(true)}
          />
        </View>
        <View key="2">
          <SettingsSection />
        </View>
      </PagerView>

      <BottomNav activeIndex={activeIndex} onTabPress={onTabPress} />

      <ChatbotModal visible={chatOpen} onClose={() => setChatOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
});
