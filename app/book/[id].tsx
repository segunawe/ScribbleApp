import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { JSX, useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { BOOKS } from "@/config/books";

const COLORS = [
  "#1a1a1a",
  "#FF3B30",
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#AF52DE",
];

const { width: W } = Dimensions.get("window");
const CANVAS_SIZE   = Math.min(W - 16, 720);

async function getBgBase64(uri: string): Promise<string> {
  if (uri.startsWith("file://") || uri.startsWith("asset://")) {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  }
  const response = await fetch(uri);
  const blob     = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror   = reject;
    reader.readAsDataURL(blob);
  });
}

export default function BookScreen(): JSX.Element {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const book    = BOOKS.find(b => b.id === id);

  const [pageIndex,  setPageIndex]  = useState(0);
  const [penColor,   setPenColor]   = useState(COLORS[0]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const canvasRef = useRef<DrawingCanvasRef>(null);

  const pages = book?.pages ?? [];

  const bgUri = useMemo(
    () => pages.length ? Image.resolveAssetSource(pages[pageIndex]).uri : "",
    [pageIndex, pages]
  );

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const bgBase64 = await getBgBase64(bgUri);
      canvasRef.current?.save(bgBase64);
    } catch (e) {
      Alert.alert("Oops", "Something went wrong preparing your drawing.");
      setSaveStatus("idle");
    }
  }, [saveStatus, bgUri]);

  const handleSaveData = useCallback(async (dataUrl: string) => {
    try {
      const base64  = dataUrl.replace(/^data:image\/png;base64,/, "");
      const fileUri = `${FileSystem.cacheDirectory}drawing_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await promptSaveOrShare(fileUri);
    } catch (e) {
      Alert.alert("Oops", "Something went wrong saving your drawing.");
      setSaveStatus("idle");
    }
  }, []);

  const promptSaveOrShare = async (fileUri: string) => {
    Alert.alert(
      "Your Drawing is Ready! 🎨",
      "What would you like to do with it?",
      [
        { text: "Save to Photos", onPress: () => saveToPhotos(fileUri) },
        { text: "Share",          onPress: () => shareDrawing(fileUri)  },
        { text: "Cancel", style: "cancel", onPress: () => setSaveStatus("idle") },
      ]
    );
  };

  const saveToPhotos = async (fileUri: string) => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status === "undetermined") {
      await new Promise<void>(resolve =>
        Alert.alert(
          "Save Your Drawing",
          "Scribble Stories needs permission to save drawings to your Photos.",
          [{ text: "Continue", onPress: () => resolve() }]
        )
      );
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== "granted") { showPermissionDenied(); return; }
    } else if (status !== "granted") {
      showPermissionDenied();
      return;
    }
    await MediaLibrary.saveToLibraryAsync(fileUri);
    showSavedFeedback();
  };

  const shareDrawing = async (fileUri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, { mimeType: "image/png", dialogTitle: "Share your drawing" });
    }
    showSavedFeedback();
  };

  const showPermissionDenied = () => {
    setSaveStatus("idle");
    Alert.alert(
      "Permission Required",
      "To save drawings to Photos, enable access in Settings > Privacy > Photos.",
      [
        { text: "Open Settings", onPress: () => Linking.openSettings() },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const showSavedFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    if (pageIndex > 0) {
      const next = pageIndex - 1;
      setPageIndex(next);
      canvasRef.current?.setPage(Image.resolveAssetSource(pages[next]).uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [pageIndex, pages]);

  const goNext = useCallback(() => {
    if (pageIndex < pages.length - 1) {
      const next = pageIndex + 1;
      setPageIndex(next);
      canvasRef.current?.setPage(Image.resolveAssetSource(pages[next]).uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [pageIndex, pages]);

  const handleColor = useCallback((color: string) => {
    setPenColor(color);
    canvasRef.current?.setColor(color);
    Haptics.selectionAsync();
  }, []);

  const handleUndo  = useCallback(() => {
    canvasRef.current?.undo();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  if (!book) return <View style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.pageCount}>{pageIndex + 1} / {pages.length}</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasArea}>
        <View style={{ position: "relative" }}>
          <View style={[styles.canvasBox, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}>
            {bgUri ? (
              <DrawingCanvas
                ref={canvasRef}
                bgUri={bgUri}
                size={CANVAS_SIZE}
                onSaveData={handleSaveData}
              />
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saveStatus === "saving"}
            style={[styles.saveBtn, saveStatus === "saving" && styles.saveBtnDisabled]}
          >
            <Ionicons
              name={saveStatus === "saved" ? "checkmark-circle" : "camera"}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {saveStatus === "saved" && (
        <View style={styles.savedBanner}>
          <Text style={styles.savedBannerText}>✓ Saved!</Text>
        </View>
      )}

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => handleColor(color)}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                color === "#1a1a1a" && styles.colorDotDark,
                penColor === color && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={goBack}
            disabled={pageIndex === 0}
            style={[styles.btn, styles.navBtn, pageIndex === 0 && styles.btnDisabled]}
          >
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleUndo} style={[styles.btn, styles.toolBtn]}>
            <Text style={styles.toolLabel}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClear} style={[styles.btn, styles.toolBtn]}>
            <Text style={styles.toolLabel}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goNext}
            disabled={pageIndex === pages.length - 1}
            style={[styles.btn, styles.navBtn, pageIndex === pages.length - 1 && styles.btnDisabled]}
          >
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#FFFDF7" },
  header:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8 },
  backBtn:    { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title:      { fontSize: 17, fontWeight: "800", color: "#1a1a1a", flex: 1, textAlign: "center" },
  pageCount:  { fontSize: 13, fontWeight: "600", color: "#aaa", width: 50, textAlign: "right" },
  canvasArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  canvasBox:  { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E0E0E0", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
  saveBtn:    { position: "absolute", top: -18, right: -18, width: 56, height: 56, borderRadius: 28, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center", shadowColor: "#FF3B30", shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6, zIndex: 10 },
  saveBtnDisabled: { backgroundColor: "#ffb3b0", shadowOpacity: 0, elevation: 0 },
  savedBanner: { alignSelf: "center", backgroundColor: "#34C759", paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginBottom: 4 },
  savedBannerText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  toolbar:    { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 10 },
  colorRow:   { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  colorDot:   { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: "transparent" },
  colorDotDark: { borderColor: "#E8E8E8" },
  colorDotSelected: { borderColor: "#FFB703", transform: [{ scale: 1.2 }] },
  actionRow:  { flexDirection: "row", gap: 8 },
  btn:        { flex: 1, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  navBtn:     { backgroundColor: "#FFB703", shadowColor: "#FFB703", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3 },
  toolBtn:    { backgroundColor: "#EFEFEF" },
  btnDisabled: { backgroundColor: "#F5E9C0", shadowOpacity: 0, elevation: 0 },
  navArrow:   { fontSize: 30, fontWeight: "700", color: "#fff", lineHeight: 34 },
  toolLabel:  { fontSize: 14, fontWeight: "700", color: "#555" },
});
