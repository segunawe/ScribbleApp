import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";

type Mode = "choose" | "email";
type EmailAction = "signin" | "signup";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called after successful sign-in/sign-up */
  onSuccess: () => void;
}

export default function AuthModal({ visible, onClose, onSuccess }: Props) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();

  const [mode, setMode] = useState<Mode>("choose");
  const [emailAction, setEmailAction] = useState<EmailAction>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMode("choose");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      if (emailAction === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      reset();
      onSuccess();
    } catch (e: any) {
      Alert.alert("Sign-in error", friendlyError(e?.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      reset();
      onSuccess();
    } catch (e: any) {
      if (e?.code !== "SIGN_IN_CANCELLED") {
        Alert.alert("Google sign-in failed", friendlyError(e?.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      reset();
      onSuccess();
    } catch (e: any) {
      if (e?.code !== "1001") { // 1001 = user cancelled
        Alert.alert("Apple sign-in failed", friendlyError(e?.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="book" size={28} color="#FFB703" />
            </View>
          </View>
          <Text style={styles.title}>Parent Sign-In</Text>
          <Text style={styles.subtitle}>
            Create a free account to save progress and unlock more books.
          </Text>

          {mode === "choose" ? (
            <>
              {/* Google */}
              <SocialButton
                icon="logo-google"
                label="Continue with Google"
                onPress={handleGoogle}
                disabled={loading}
              />

              {/* Apple — iOS only */}
              {Platform.OS === "ios" && (
                <SocialButton
                  icon="logo-apple"
                  label="Continue with Apple"
                  onPress={handleApple}
                  disabled={loading}
                  dark
                />
              )}

              {/* Email */}
              <SocialButton
                icon="mail-outline"
                label="Continue with Email"
                onPress={() => setMode("email")}
                disabled={loading}
                outline
              />

              {loading && (
                <ActivityIndicator style={{ marginTop: 16 }} color="#FFB703" />
              )}
            </>
          ) : (
            <>
              {/* Email form */}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {emailAction === "signin" ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setEmailAction(emailAction === "signin" ? "signup" : "signin")
                }
              >
                <Text style={styles.toggleText}>
                  {emailAction === "signin"
                    ? "No account? Create one"
                    : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode("choose")}>
                <Text style={styles.backText}>← Other options</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Social button helper ─────────────────────────────────────────────────────
function SocialButton({
  icon,
  label,
  onPress,
  disabled,
  dark,
  outline,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  dark?: boolean;
  outline?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.socialBtn,
        dark && styles.socialBtnDark,
        outline && styles.socialBtnOutline,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={20}
        color={dark ? "#fff" : outline ? "#0D2B6E" : "#333"}
        style={{ marginRight: 10 }}
      />
      <Text
        style={[
          styles.socialBtnText,
          dark && styles.socialBtnTextDark,
          outline && styles.socialBtnTextOutline,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Error messages ───────────────────────────────────────────────────────────
function friendlyError(code?: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "No internet connection. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 8,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D2B6E",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialBtnDark: {
    backgroundColor: "#111",
  },
  socialBtnOutline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#0D2B6E",
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  socialBtnTextDark: {
    color: "#fff",
  },
  socialBtnTextOutline: {
    color: "#0D2B6E",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#FFB703",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  toggleText: {
    textAlign: "center",
    color: "#0D2B6E",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  backText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },
});
