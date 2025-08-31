import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function WalletScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [skillScore, setSkillScore] = useState(1000);
  const [referredCount, setReferredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Utility to safely parse JSON
  const safeJson = async (res) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch (err) {
      console.log("Response not JSON:", err);
      return {};
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setUser({ username: "Guest", _id: null });
          setPoints(0);
          setSkillScore(1000);
          setLoading(false);
          return;
        }

        const res = await fetch("https://chess-backend-y4p3.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await safeJson(res);
        if (res.ok) {
          setUser(data);

          // Set game points & skill score
          setPoints(data.points || 1000);
          setSkillScore(data.skillScore || 1000);

          // If user signed up with referral → give +20 points
          if (data.referredBy) {
            await fetch("https://chess-backend-y4p3.onrender.com/api/wallet/add-referral-points", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ referredBy: data.referredBy }),
            });
            
          }

          // Fetch count of people referred by this user
          const refRes = await fetch(
            `https://chess-backend-y4p3.onrender.com/api/wallet/referred-count/${data._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const refData = await safeJson(refRes);
          if (refRes.ok) setReferredCount(refData.count || 0);
        }
      } catch (err) {
        console.log("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  //Logout handler
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/LoginScreen");
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
      style={[styles.container, { backgroundColor: isDark ? "#1e1d1dff" : "#fff" }]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Wallet
          </Text>

          {/* Game Points */}
          <View style={[styles.pointsBox, { backgroundColor: isDark ? "#fff" : "#e5fbe9" }]}>
            <Text style={[styles.pointsLabel, { color: "#000" }]}>
              Game Points
            </Text>
            <Text style={[styles.pointsValue, { color: "#000" }]}>{points}</Text>
          </View>

          {/* Skill Score */}
          <View style={[styles.pointsBox, { backgroundColor: isDark ? "#fff" : "#e9f0ff" }]}>
            <Text style={[styles.pointsLabel, { color: "#000" }]}>
              Skill Score
            </Text>
            <Text style={[styles.pointsValue, { color: "#000" }]}>{skillScore}</Text>
          </View>
        </View>

        {/* Referral Info */}
        {user?.referredBy && (
          <LinearGradient
            colors={isDark ? ["#fff", "#f0f0f0"] : ["#f4d9ff", "#fcefff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.referralBox}
          >
            <Text style={[styles.referralText, { color: "#000" }]}>
              You signed up using referral code: {user.referredBy} (+20 bonus points!)
            </Text>
          </LinearGradient>
        )}

        {/* Your Referred Logins */}
        <View style={[styles.referralBox, { backgroundColor: isDark ? "#fff" : "#f5f5f5" }]}>
          <Text style={[styles.referralText, { color: "#000" }]}>
            People who signed up using your referral code: {referredCount}
          </Text>
        </View>

        {/*  Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={{ backgroundColor: "#fff" }}>
        <View style={[styles.bottomNav, { backgroundColor: "#555" }]}>
          <NavItem
            icon="game-controller"
            label="Play"
            active={pathname === "/HomeScreen"}
            onPress={() => router.push("/HomeScreen")}
          />
          <NavItem
            icon="people"
            label="Invite"
            active={pathname === "/InviteScreen"}
            onPress={() => router.push("/InviteScreen")}
          />
          <NavItem
            icon="cube-outline"
            label="Room"
            active={pathname === "/RoomScreen"}
            onPress={() => router.push("/RoomScreen")}
          />
          <NavItem
            icon="wallet"
            label="Wallet"
            active={pathname === "/WalletScreen"}
            onPress={() => router.push("/WalletScreen")}
          />
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={26}
        color={active ? "red" : "#fff"}
      />
      <Text style={[styles.navText, { color: active ? "red" : "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold" },
  pointsBox: {
    marginTop: 16,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  pointsLabel: { fontSize: 16, fontWeight: "500" },
  pointsValue: { fontSize: 36, fontWeight: "bold" },
  referralBox: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  referralText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  logoutBtn: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
