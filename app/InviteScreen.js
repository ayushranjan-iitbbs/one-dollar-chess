import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard"; // for copy functionality
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function InviteScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");

  // Fetch user data (from DB, not local generate)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setReferralCode("GUEST12345"); // fallback if not logged in
          setLoading(false);
          return;
        }

        const res = await fetch("https://chess-backend-y4p3.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setReferralCode(data.referralCode);  
        } else {
          console.log("Error fetching user:", data);
        }
      } catch (err) {
        console.log("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Copy referral code
  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
  };

  // Share referral code
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join this Chess Battle App using my referral code: ${referralCode} 🎉\nSignup here: https://yourapp.com/signup?ref=${referralCode}`,
      });
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
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
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 60 }}
      >
        {/* Referral Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Invite Friends & Earn
          </Text>
          <Text style={[styles.subTitle, { color: isDark ? "#ccc" : "#555" }]}>
            Get 10 Coins for every friend who joins!
          </Text>
        </View>

        {/* Referral Code Box */}
        <LinearGradient
          colors={
            isDark
              ? ["#4c2a80", "#1a1033"]  
              : ["#f4d9ff", "#fcefff"]  
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.referralBox,
            isDark && { borderColor: "#6a1b9a", borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.referralLabel,
              { color: isDark ? "#ede6ff" : "#27123B" },
            ]}
          >
            YOUR REFERRAL CODE
          </Text>
          <Text
            style={[
              styles.referralCode,
              { color: isDark ? "#fff" : "#27123B" },
            ]}
          >
            {referralCode || "N/A"}
          </Text>
          <View style={styles.referralButtons}>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: "#6a1b9a" }]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: "#c2185b" }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.copyBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Bonus Info */}
        <View style={styles.bonusBox}>
          <Text style={[styles.bonusText, { color: isDark ? "#fff" : "#000" }]}>
            🎁 Bonus Earned:{" "}
            <Text style={{ color: "green", fontWeight: "bold" }}>
              25 Coins
            </Text>
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { color: isDark ? "#fff" : "#000" }]}>
            How Referral Works:
          </Text>
          <Text style={[styles.infoText, { color: isDark ? "#aaa" : "#555" }]}>
            • Share your referral code with friends.{"\n"}
            • They sign up using your code.{"\n"}
            • You instantly get 10 Coins bonus.{"\n"}
            • More friends = More Coins!
          </Text>
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
            <Text
              style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}
            >
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
            <Text
              style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}
            >
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
            <Text
              style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}
            >
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
            <Text
              style={[styles.navText, { color: isDark ? "#fff" : "#000" }]}
            >
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
  header: { paddingHorizontal: 16, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold" },
  subTitle: { fontSize: 14, marginTop: 4 },
  referralBox: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  referralLabel: { fontSize: 14, fontWeight: "600" },
  referralCode: { fontSize: 28, fontWeight: "bold", marginVertical: 12 },
  referralButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  copyBtn: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  shareBtn: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  copyBtnText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  bonusBox: {
    margin: 16,
    backgroundColor: "#e5fbe9",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  bonusText: { fontSize: 16, fontWeight: "600" },
  infoBox: { marginHorizontal: 16, marginTop: 20 },
  infoTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
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
