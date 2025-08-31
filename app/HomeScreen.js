import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";


const CardSmall = ({ isDark, topLabel, winAmount, entryFee, matchingText, onPlayPress }) => {
  return (
    <View
      style={[
        styles.cardSmall,
        isDark
          ? { backgroundColor: "#181818" }
          : {
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#3c2a80", "#1a1033"] : ["#ede6ff", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <Text
          style={[
            styles.cardLabel,
            { color: isDark ? "#ede6ff" : "#3c2a80" },
          ]}
        >
          {topLabel}
        </Text>
      </LinearGradient>

      <View style={styles.cardRow}>
        <View>
          <Text
            style={[
              styles.winLabel,
              { color: isDark ? "#888" : "#777" },
            ]}
          >
            WIN
          </Text>
          <Text style={styles.amountText}>{winAmount}</Text>
        </View>
        <TouchableOpacity style={entryFee === "FREE" ? styles.entryFeeBtnFree : styles.entryFeeBtn} onPress={onPlayPress}>
          <Text style={styles.entryFeeText}>{entryFee}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.footerBar,
          { backgroundColor: isDark ? "#222" : "#f1f5ff" },
        ]}
      >
        <Text
          style={[
            styles.matchingText,
            { color: isDark ? "#aaa" : "#555" },
          ]}
        >
          {matchingText}
        </Text>
      </View>

      <Image
        source={require("./assets/images/trophy.png")}
        style={[styles.fadedTrophy, { opacity: isDark ? 0.25 : 0.15 }]}
      />
    </View>
  );
};

// Function to generate a random avatar URL based on username
const getAvatarUrl = (username) => {
  const seed = username || "guest"; // Use a consistent seed for a consistent avatar
  return `https://dummyimage.com/100x100/000/fff&text=${seed.slice(0, 1).toUpperCase()}`;
};

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          // If no token exists, assume guest user and stop loading
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await fetch("https://chess-backend-y4p3.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          // Handle non-ok response (e.g., token expired)
          console.log("Failed to fetch user:", data.msg);
          setUser(null); // Treat as guest
        }
      } catch (err) {
        console.log("Error fetching user:", err);
        setUser(null); // Treat as guest on network error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0f0f0f" : "#ffffff" },
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 30 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userRow}>
            <Image
              source={{ uri: getAvatarUrl(user?.username) }}
              style={styles.avatar}
            />
            <View>
              <Text style={[styles.username, { color: isDark ? "#fff" : "#000" }]}>
                {user ? user.username : "Guest"}
              </Text>
              <Text style={[styles.userid, { color: isDark ? "#aaa" : "#555" }]}>
                {user ? user.email : "Not logged in"}
              </Text>
            </View>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceText}>₹ 25</Text>
          </View>
        </View>

        {/* Tutorial Box */}
        <LinearGradient
          colors={["#f4d9ff", "#fcefff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tutorialBox}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.tutorialTitle}>TUTORIAL</Text>
            <Text style={styles.tutorialSub}>Learn How to Play</Text>
          </View>
          <Image
            source={require("./assets/images/ttrophy.png")}
            style={styles.ttrophy}
          />
        </LinearGradient>

        {/* Game Cards */}
        <Text
          style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}
        >
          1v1 Chess Battle:
        </Text>
        <Text
          style={[styles.sectionSub, { color: isDark ? "#aaa" : "#666" }]}
        >
          For you
        </Text>

        {/* Paid Card */}
        <View style={styles.cardWrapper}>
          <CardSmall
            isDark={isDark}
            topLabel="LAST PLAYED"
            winAmount="₹10"
            entryFee="₹7"
            matchingText="500 Matching your skill"
            onPlayPress={() => { /* Handle play action */ }}
          />
        </View>

        {/* Another Section */}
        <Text
          style={[
            styles.sectionTitle,
            { marginTop: 20, color: isDark ? "#fff" : "#000" },
          ]}
        >
          Other Live Games
        </Text>
        <Text
          style={[styles.sectionSub, { color: isDark ? "#aaa" : "#666" }]}
        >
          Improve your skills
        </Text>

        {/* Skill Booster Card */}
        <View style={styles.cardWrapper}>
          <CardSmall
            isDark={isDark}
            topLabel="SKILL BOOSTER"
            winAmount="₹0"
            entryFee="FREE"
            matchingText="Random opponent with similar skill (+-20)"
            onPlayPress={() => { /* Handle play action */ }}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={{ backgroundColor: isDark ? "#1c1c1c" : "#fff" }}>
        <View
          style={[
            styles.bottomNav,
            { backgroundColor: isDark ? "#1c1c1c" : "#fff" },
          ]}
        >
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/HomeScreen")}
          >
            <Ionicons
              name="game-controller"
              size={26}
              color={pathname === "/HomeScreen" ? "red" : "grey"}
            />
            <Text style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}>
              Play
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/InviteScreen")}
          >
            <Ionicons
              name="people"
              size={26}
              color={pathname === "/InviteScreen" ? "red" : "grey"}
            />
            <Text style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}>
              Invite
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/RoomScreen")}
          >
            <Ionicons
              name="cube-outline"
              size={26}
              color={pathname === "/RoomScreen" ? "red" : "grey"}
            />
            <Text style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}>
              Room
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/WalletScreen")}
          >
            <Ionicons
              name="wallet"
              size={26}
              color={pathname === "/WalletScreen" ? "red" : "grey"}
            />
            <Text style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}>
              Wallet
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  username: { fontSize: 16, fontWeight: "600" },
  userid: { fontSize: 13 },
  balanceBox: {
    backgroundColor: "#e5fbe9",
    borderRadius: 8,
    width: 80,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceText: { color: "green", fontWeight: "600" },
  tutorialBox: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    height: 90,
  },
  tutorialTitle: { fontSize: 30, fontWeight: "bold", color: "#27123B" },
  tutorialSub: { fontSize: 12, marginTop: 4, color: "#27123B" },
  ttrophy: { width: 170, height: 200, marginLeft: "auto", marginTop: -40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionSub: { fontSize: 14, marginHorizontal: 16, marginBottom: 12 },
  cardWrapper: { marginHorizontal: 16, marginBottom: 16 },
  cardSmall: { borderRadius: 14, overflow: "hidden", position: "relative" },
  topBar: { padding: 8, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  footerBar: { padding: 8, borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  cardLabel: { fontSize: 13, fontWeight: "bold" },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  winLabel: { fontSize: 12, fontWeight: "600" },
  amountText: { fontSize: 22, fontWeight: "bold", color: "#ffb300" },
  entryFeeBtn: {
    backgroundColor: "#00c853",
    paddingVertical: 8,
    borderRadius: 10,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  entryFeeBtnFree: {
    backgroundColor: "#e5fbe9",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  entryFeeText: { color: "#000", fontWeight: "600", fontSize: 14 },
  matchingText: { fontSize: 13, textAlign: "left" },
  fadedTrophy: {
    position: "absolute",
    alignSelf: "center",
    bottom: 10,
    width: 120,
    height: 140,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    marginBottom: 12,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2 },
});