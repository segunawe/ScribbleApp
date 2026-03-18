import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { JSX, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BOOKS, Book } from "@/config/books";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const { width: W } = Dimensions.get("window");

// 2 books per shelf row, with padding and gap
const SHELF_PADDING = 24;
const BOOK_GAP      = 16;
const BOOK_WIDTH    = (W - SHELF_PADDING * 2 - BOOK_GAP) / 2;
const BOOK_HEIGHT   = BOOK_WIDTH * 1.35;

// ─── Chunk books into rows of 2 ──────────────────────────────────────────────
function chunkBooks(books: Book[], size: number): Book[][] {
  const rows: Book[][] = [];
  for (let i = 0; i < books.length; i += size) {
    rows.push(books.slice(i, i + size));
  }
  return rows;
}

// ─── Single book card ─────────────────────────────────────────────────────────
function BookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const isLocked = book.status === "locked";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isLocked ? 0.6 : 0.85}
      style={[styles.bookCard, { width: BOOK_WIDTH, height: BOOK_HEIGHT }]}
    >
      {/* Cover image or placeholder */}
      {book.cover ? (
        <Image
          source={book.cover}
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bookCoverPlaceholder}>
          <Ionicons name="book-outline" size={40} color="#4A6FA5" />
        </View>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={22} color="#fff" />
          </View>
        </View>
      )}

      {/* Title */}
      <View style={styles.bookTitleRow}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        {!isLocked && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Log shelf beam ───────────────────────────────────────────────────────────
function ShelfLog() {
  return (
    <View style={styles.shelfLog}>
      <View style={styles.shelfLogHighlight} />
      <View style={styles.shelfLogShadow} />
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function LibraryScreen(): JSX.Element {
  const router = useRouter();
  const { unlockedBooks } = useAuth();
  const rows = chunkBooks(BOOKS, 2);

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const pendingBookRef = useRef<Book | null>(null);

  const handleBookPress = (book: Book) => {
    if (unlockedBooks.includes(book.id)) {
      router.push(`/book/${book.id}`);
      return;
    }
    // Locked — prompt sign-in, then re-check entitlements
    pendingBookRef.current = book;
    setAuthModalVisible(true);
  };

  const handleAuthSuccess = () => {
    setAuthModalVisible(false);
    const book = pendingBookRef.current;
    if (!book) return;
    // After sign-in, unlockedBooks updates via AuthContext.
    // If they now have access, navigate; otherwise show coming-soon.
    // We use a short delay to let state settle.
    setTimeout(() => {
      if (unlockedBooks.includes(book.id)) {
        router.push(`/book/${book.id}`);
      } else {
        Alert.alert("Coming Soon", "This book isn't available yet. Check back soon!");
      }
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        {/* Decorative left column cap */}
        <View style={styles.columnCap} />
        <Text style={styles.headerTitle}>My Library</Text>
        {/* Decorative right column cap */}
        <View style={styles.columnCap} />
      </View>

      {/* Decorative columns + scroll area */}
      <View style={styles.body}>
        {/* Left column */}
        <View style={styles.column}>
          <View style={styles.columnShaft} />
        </View>

        {/* Shelves */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.shelfRow}>
              {/* Books */}
              <View style={styles.booksRow}>
                {row.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={() => handleBookPress(book)}
                  />
                ))}
                {/* Empty slot filler if odd number */}
                {row.length < 2 && (
                  <View style={{ width: BOOK_WIDTH }} />
                )}
              </View>

              {/* Log shelf below books */}
              <ShelfLog />
            </View>
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Right column */}
        <View style={styles.column}>
          <View style={styles.columnShaft} />
        </View>
      </View>

      {/* Floor beam */}
      <View style={styles.floorBeam} />

      {/* Parent auth modal — shown when a locked book is tapped */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={handleAuthSuccess}
      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D2B6E",
  },

  // ── Header ──
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  headerTitle: {
    fontSize:   26,
    fontWeight: "900",
    color:      "#FFB703",
    letterSpacing: 2,
    textTransform: "uppercase",
    flex: 1,
    textAlign: "center",
  },
  columnCap: {
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: "#FFB703",
  },

  // ── Body layout ──
  body: {
    flex:           1,
    flexDirection:  "row",
  },

  // ── Decorative side columns ──
  column: {
    width:           28,
    alignItems:      "center",
    paddingVertical: 4,
  },
  columnShaft: {
    flex:            1,
    width:           18,
    backgroundColor: "#1A4AAA",
    borderRadius:    9,
    borderLeftWidth:  2,
    borderRightWidth: 2,
    borderColor:      "#2A5ACA",
  },

  // ── Scroll area ──
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // ── Shelf row ──
  shelfRow: {
    marginBottom: 8,
  },
  booksRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    paddingHorizontal: SHELF_PADDING - 24, // columns already take 28px each side
    gap: BOOK_GAP,
    paddingBottom: 10,
  },

  // ── Log shelf beam ──
  shelfLog: {
    height:           26,
    marginHorizontal: 4,
    backgroundColor:  "#1A4EC8",
    borderRadius:     13,
    shadowColor:      "#000",
    shadowOpacity:    0.4,
    shadowOffset:     { width: 0, height: 4 },
    shadowRadius:     5,
    elevation:        5,
    overflow:         "hidden",
  },
  shelfLogHighlight: {
    position:        "absolute",
    top:             3,
    left:            20,
    right:           20,
    height:          7,
    backgroundColor: "#4A7EE8",
    borderRadius:    4,
    opacity:         0.7,
  },
  shelfLogShadow: {
    position:        "absolute",
    bottom:          2,
    left:            20,
    right:           20,
    height:          4,
    backgroundColor: "#0A1E5A",
    borderRadius:    2,
    opacity:         0.5,
  },

  // ── Floor beam ──
  floorBeam: {
    height:          20,
    backgroundColor: "#1A4EC8",
    borderTopLeftRadius:  10,
    borderTopRightRadius: 10,
    shadowColor:     "#000",
    shadowOpacity:   0.3,
    shadowOffset:    { width: 0, height: -2 },
    shadowRadius:    4,
    elevation:       4,
  },

  // ── Book card ──
  bookCard: {
    backgroundColor:    "#FFFEF7",
    borderRadius:        10,
    overflow:           "hidden",
    shadowColor:        "#000",
    shadowOpacity:      0.2,
    shadowOffset:       { width: 0, height: 3 },
    shadowRadius:       5,
    elevation:          4,
  },
  bookCover: {
    width:  "100%",
    height: "75%",
  },
  bookCoverPlaceholder: {
    width:           "100%",
    height:          "75%",
    backgroundColor: "#C8D8EE",
    alignItems:      "center",
    justifyContent:  "center",
  },
  lockOverlay: {
    position:        "absolute",
    top:             0,
    left:            0,
    right:           0,
    bottom:          "25%",
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  lockBadge: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems:      "center",
    justifyContent:  "center",
  },
  bookTitleRow: {
    height:          "25%",
    paddingHorizontal: 8,
    paddingVertical:   6,
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    gap:             4,
  },
  bookTitle: {
    flex:       1,
    fontSize:   12,
    fontWeight: "700",
    color:      "#1a1a1a",
  },
  freeBadge: {
    backgroundColor: "#FFB703",
    borderRadius:    4,
    paddingHorizontal: 5,
    paddingVertical:   2,
  },
  freeBadgeText: {
    fontSize:   9,
    fontWeight: "900",
    color:      "#fff",
    letterSpacing: 0.5,
  },
});
