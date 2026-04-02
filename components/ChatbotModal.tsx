import { ChatMessage, sendChatMessage } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";

const RED = "#c40000";

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Animated typing dots
function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingWrap}>
      <View style={styles.botAvatarSmall}>
        <Ionicons name="sparkles" size={12} color={RED} />
      </View>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowBot,
      ]}
    >
      {!isUser && (
        <View style={styles.botAvatarSmall}>
          <Ionicons name="sparkles" size={12} color={RED} />
        </View>
      )}
      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
      >
        <Markdown
          style={{
            body: {
              ...StyleSheet.flatten(styles.bubbleText),
              ...(isUser ? styles.userText : styles.botText),
            },
            paragraph: { marginTop: 0, marginBottom: 0 },
          }}
        >
          {message.text}
        </Markdown>
      </View>
    </View>
  );
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "model",
  text: "Hi! I'm **ResumAI** 👋\n\nI can help you with:\n• 🚀 Career roadmaps & what to put on your resume\n• ❓ How to use the ResuMate app\n\nWhat would you like to know?",
};

export default function ChatbotModal({ visible, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (visible) scrollToEnd();
  }, [messages, isTyping, visible]);

  // Reset chat when modal opens fresh
  useEffect(() => {
    if (visible) {
      setMessages([WELCOME_MESSAGE]);
      setInput("");
      setIsTyping(false);
    }
  }, [visible]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
    };

    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build history to send (exclude welcome, which is UI-only)
      const history = messages.filter((m) => m.id !== "welcome");
      const responseText = await sendChatMessage(history, text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "Sorry, something went wrong. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
          <View style={styles.touchableBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBotAvatar}>
                <Ionicons name="sparkles" size={16} color={RED} />
              </View>
              <View>
                <Text style={styles.headerTitle}>ResumAI</Text>
                <Text style={styles.headerSubtitle}>Always ready to help</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#adb5bd" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <View style={styles.flex}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={scrollToEnd}
              ListFooterComponent={isTyping ? <TypingIndicator /> : null}
              showsVerticalScrollIndicator={false}
            />

            {/* Input bar */}
            <View style={styles.inputBar}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#adb5bd"
                  multiline
                  maxLength={500}
                  editable={!isTyping}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!input.trim() || isTyping) && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim() || isTyping}
                activeOpacity={0.8}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  touchableBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  flex: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: RED,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#868e96",
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },

  // Messages
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 0,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowBot: { justifyContent: "flex-start" },

  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  bubble: {
    maxWidth: "75%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: RED,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#f4f4f5", // Light sleek gray
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "#fff" },
  botText: { color: "#1a1a2e" },

  // Typing
  typingWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#adb5bd",
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    maxHeight: 120,
    fontSize: 15,
    color: "#1a1a2e",
    minHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // align visually with single line input
  },
  sendBtnDisabled: {
    backgroundColor: "#e9ecef",
  },
});
