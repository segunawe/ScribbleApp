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
import Signature from "react-native-signature-canvas";

/** ---------- Assets ---------- */
const pages = [
  require("../../assets/CoverPage.png"),
  require("../../assets/Scribble_Stories_Intro_Page_1.png"),
  require("../../assets/Scribble_Stories_Circle_Page_2.png"),
  require("../../assets/Scribble_Stories_Circle_Practice_Page_3.png"),
  require("../../assets/Scribble_Stories_Square_Page_4.png"),
  require("../../assets/Scribble_Stories_Square_Practice_Page_5.png"),
  require("../../assets/Scribble_Stories_Triangle_Page_6.png"),
  require("../../assets/Scribble_Stories_Triangle_Practice_Page_7.png"),
  require("../../assets/Scribble_Stories_Rectangle_Page_8.png"),
  require("../../assets/Scribble_Stories_Rectangle_Practice_Page_9.png"),
  require("../../assets/Scribble_Stories_Shapes_Together_Page_10.png"),
  require("../../assets/Scribble_Stories_Shapes_Together_Practice_Page_11.png"),
  require("../../assets/page1.png"),
  require("../../assets/train_boat_page2_centered.png"),
  require("../../assets/page2_centered.png"),
  require("../../assets/Star_page.png"),
  require("../../assets/rocket_page2_final.png"),
  require("../../assets/house_page1_final.png"),
  require("../../assets/heart_page.png"),
  require("../../assets/car_page.png"),
  require("../../assets/cloud_page.png"),
  require("../../assets/flower_page.png"),
  require("../../assets/train_boat_page1_refined.png"),
  require("../../assets/robot_page.png"),
  require("../../assets/Back_Cover.png"),
];

/** ---------- Helpers ---------- */
const { width: SCREEN_W } = Dimensions.get("window");

/**
 * Returns a CSS string for Signature's webView canvas background.
 * Keeps your background image *on the canvas* and lets the drawing sit on top.
 */
const makeSignatureWebStyle = (bgUri: string) => `
  .m-signature-pad--footer { display: none; }
  .m-signature-pad {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
  }
  body, html {
    background: transparent !important;
    margin: 0;
    padding: 0;
    overscroll-behavior: contain;
    touch-action: none;
  }
  canvas {
    position: absolute;
    top: 0; left: 0;
    background-image: url(${bgUri});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: transparent !important;
  }
`;

/** Drawn grid overlay (no extra libs) */
const GridOverlay = ({
  rows = 8,
  cols = 8,
  lineWidth = 1,
}: {
  rows?: number;
  cols?: number;
  lineWidth?: number;
}) => {
  const verticals = Array.from({ length: cols - 1 }, (_, i) => (i + 1) / cols);
  const horizontals = Array.from({ length: rows - 1 }, (_, i) => (i + 1) / rows);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Vertical lines */}
      {verticals.map((x, idx) => (
        <View
          key={`v-${idx}`}
          style={[
            styles.gridLine,
            {
              left: `${x * 100}%`,
              width: lineWidth,
              top: 0,
              bottom: 0,
            },
          ]}
        />
      ))}
      {/* Horizontal lines */}
      {horizontals.map((y, idx) => (
        <View
          key={`h-${idx}`}
          style={[
            styles.gridLine,
            {
              top: `${y * 100}%`,
              height: lineWidth,
              left: 0,
              right: 0,
            },
          ]}
        />
      ))}
      {/* Outer border */}
      <View style={styles.gridBorder} />
    </View>
  );
};

export default function BookScreen(): JSX.Element {
  const [pageIndex, setPageIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const sigRef = useRef<any>(null);

  /** ---- Navigation ---- */
  const goNext = useCallback(() => {
    if (pageIndex < pages.length - 1) setPageIndex((i) => i + 1);
  }, [pageIndex]);
  const goBack = useCallback(() => {
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  }, [pageIndex]);

  /** ---- Drawing ---- */
  const handleOK = useCallback((sig: string) => {
    // Base64 string from Signature
    console.log("Saved drawing:", sig?.slice?.(0, 64) + "...");
  }, []);
  const handleClear = useCallback(() => {
    sigRef.current?.clearSignature();
  }, []);
  /** ---- Signature Canvas (with background image) ---- */
  const bgUri = useMemo(
    () => Image.resolveAssetSource(pages[pageIndex]).uri,
    [pageIndex]
  );
  const webStyle = useMemo(() => makeSignatureWebStyle(bgUri), [bgUri]);

  /**
   * Keep the page square & responsive:
   * - Canvas zone takes full width on phones, capped on tablets/desktops.
   * - aspectRatio: 1 ensures a perfect square for your 8.5"x8.5" pages.
   */
  const maxCanvasSide = Math.min(SCREEN_W - 24, 720); // tweak 720 if you want larger on tablets

  return (
    <SafeAreaView style={styles.safe}>
      {/* ---------- Header Row ---------- */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Scribble Stories</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerMeta}>
            Page {pageIndex + 1} / {pages.length}
          </Text>
          <TouchableOpacity
            onPress={() => setShowGrid((v) => !v)}
            style={[styles.smallBtn, showGrid && styles.smallBtnActive]}
          >
            <Text style={styles.smallBtnText}>{showGrid ? "Hide Grid" : "Show Grid"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- Main Grid-ish Row ---------- */}
      <View style={styles.mainRow}>
        {/* Left Nav "Column" */}
        <View style={styles.navCol}>
          <TouchableOpacity
            onPress={goBack}
            disabled={pageIndex === 0}
            style={[styles.navBtn, pageIndex === 0 && styles.navBtnDisabled]}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Center Canvas "Column" (square) */}
        <View style={[styles.canvasZone, { width: maxCanvasSide }]}>
          <View style={styles.canvasInner}>
            {/* Square box that hosts the drawing surface */}
            <View style={styles.squareBox}>
              {/* Signature canvas */}
              <Signature
                key={pageIndex} // force re-mount when page changes
                ref={sigRef}
                onOK={handleOK}
                onClear={() => {}}
                descriptionText=""
                clearText="Clear"
                confirmText="Save"
                webStyle={webStyle}
              />

              {/* Optional grid overlay */}
              {showGrid && <GridOverlay rows={8} cols={8} lineWidth={1} />}
            </View>
          </View>
        </View>

        {/* Right Nav "Column" */}
        <View style={styles.navCol}>
          <TouchableOpacity
            onPress={goNext}
            disabled={pageIndex === pages.length - 1}
            style={[
              styles.navBtn,
              pageIndex === pages.length - 1 && styles.navBtnDisabled,
            ]}
          >
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- Toolbar Row ---------- */}
      <View style={styles.toolbarRow}>
        <TouchableOpacity
          onPress={goBack}
          disabled={pageIndex === 0}
          style={[styles.toolbarBtn, pageIndex === 0 && styles.toolbarBtnDisabled]}
        >
          <Text style={styles.toolbarBtnText}>⬅ Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleClear} style={styles.toolbarBtn}>
          <Text style={styles.toolbarBtnText}>Clear ✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goNext}
          disabled={pageIndex === pages.length - 1}
          style={[
            styles.toolbarBtn,
            pageIndex === pages.length - 1 && styles.toolbarBtnDisabled,
          ]}
        >
          <Text style={styles.toolbarBtnText}>Next ➡</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /** Header Grid Row */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerMeta: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#efefef",
    borderRadius: 8,
  },
  smallBtnActive: {
    backgroundColor: "#FFB703",
  },
  smallBtnText: {
    color: "#222",
    fontWeight: "600",
  },

  /** Main Grid-ish Row: [nav] [canvas] [nav] */
  mainRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 10,
    gap: 6,
  },
  navCol: {
    width: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFB703",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  navBtnDisabled: {
    backgroundColor: "#f0d28a",
  },
  navBtnText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 28,
  },

  canvasZone: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    height: undefined,
  },
  canvasInner: {
    width: "100%",
  },
  squareBox: {
    width: "100%",
    aspectRatio: 1, // keep your 8.5"x8.5" look
    backgroundColor: "transparent",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    position: "relative",
  },

  /** Toolbar Grid Row */
  toolbarRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  toolbarBtn: {
    backgroundColor: "#FFB703",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  toolbarBtnDisabled: {
    backgroundColor: "#f0d28a",
  },
  toolbarBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /** Grid overlay styling */
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  gridBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
  },
});
