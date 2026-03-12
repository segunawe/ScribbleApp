import * as Haptics from "expo-haptics";
import React, { JSX, useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";

// ─── Book pages ──────────────────────────────────────────────────────────────
const PAGES = [
  require("../assets/CoverPage.png"),
  require("../assets/Scribble_Stories_Intro_Page_1.png"),
  require("../assets/Scribble_Stories_Circle_Page_2.png"),
  require("../assets/Scribble_Stories_Circle_Practice_Page_3.png"),
  require("../assets/Scribble_Stories_Square_Page_4.png"),
  require("../assets/Scribble_Stories_Square_Practice_Page_5.png"),
  require("../assets/Scribble_Stories_Triangle_Page_6.png"),
  require("../assets/Scribble_Stories_Triangle_Practice_Page_7.png"),
  require("../assets/Scribble_Stories_Rectangle_Page_8.png"),
  require("../assets/Scribble_Stories_Rectangle_Practice_Page_9.png"),
  require("../assets/Scribble_Stories_Shapes_Together_Page_10.png"),
  require("../assets/Scribble_Stories_Shapes_Together_Practice_Page_11.png"),
  require("../assets/page1.png"),
  require("../assets/train_boat_page2_centered.png"),
  require("../assets/page2_centered.png"),
  require("../assets/Star_page.png"),
  require("../assets/rocket_page2_final.png"),
  require("../assets/house_page1_final.png"),
  require("../assets/heart_page.png"),
  require("../assets/car_page.png"),
  require("../assets/cloud_page.png"),
  require("../assets/flower_page.png"),
  require("../assets/train_boat_page1_refined.png"),
  require("../assets/robot_page.png"),
  require("../assets/Back_Cover.png"),
];

const COLORS = [
  "#1a1a1a", // black
  "#FF3B30", // red
  "#007AFF", // blue
  "#34C759", // green
  "#FF9500", // orange
  "#AF52DE", // purple
];

const { width: W } = Dimensions.get("window");
const CANVAS_SIZE  = Math.min(W - 16, 720);

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function BookScreen(): JSX.Element {
  const [pageIndex, setPageIndex] = useState(0);
  const [penColor,  setPenColor]  = useState(COLORS[0]);

  const canvasRef = useRef<DrawingCanvasRef>(null);

  const bgUri = useMemo(
    () => Image.resolveAssetSource(PAGES[pageIndex]).uri,
    [pageIndex]
  );

  const goBack = useCallback(() => {
    if (pageIndex > 0) {
      const next = pageIndex - 1;
      const uri  = Image.resolveAssetSource(PAGES[next]).uri;
      setPageIndex(next);
      canvasRef.current?.setPage(uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [pageIndex]);

  const goNext = useCallback(() => {
    if (pageIndex < PAGES.length - 1) {
      const next = pageIndex + 1;
      const uri  = Image.resolveAssetSource(PAGES[next]).uri;
      setPageIndex(next);
      canvasRef.current?.setPage(uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [pageIndex]);

  const handleColor = useCallback((color: string) => {
    setPenColor(color);
    canvasRef.current?.setColor(color);
    Haptics.selectionAsync();
  }, []);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scribble Stories</Text>
        <Text style={styles.pageCount}>{pageIndex + 1} / {PAGES.length}</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasArea}>
        <View style={[styles.canvasBox, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}>
          <DrawingCanvas
            ref={canvasRef}
            bgUri={bgUri}
            size={CANVAS_SIZE}
          />
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>

        {/* Colors */}
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

        {/* Actions */}
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
            disabled={pageIndex === PAGES.length - 1}
            style={[styles.btn, styles.navBtn, pageIndex === PAGES.length - 1 && styles.btnDisabled]}
          >
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  pageCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#aaa",
  },

  canvasArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  canvasBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },

  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
  },

  colorRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorDotDark: {
    borderColor: "#E8E8E8",
  },
  colorDotSelected: {
    borderColor: "#FFB703",
    transform: [{ scale: 1.2 }],
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtn: {
    backgroundColor: "#FFB703",
    shadowColor: "#FFB703",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  toolBtn: {
    backgroundColor: "#EFEFEF",
  },
  btnDisabled: {
    backgroundColor: "#F5E9C0",
    shadowOpacity: 0,
    elevation: 0,
  },
  navArrow: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 34,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
});
