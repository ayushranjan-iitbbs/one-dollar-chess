import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const SERVER_URL = "https://chess-backend-y4p3.onrender.com";

export default function RoomScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    fetchUserAndRooms();
  }, []);

  const fetchUserAndRooms = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRes = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);

      const roomsRes = await fetch(`${SERVER_URL}/api/rooms`);
      const roomsData = await roomsRes.json();
      setRooms(roomsData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) return Alert.alert("Enter room name");
    if (!user || !user._id) return Alert.alert("Login to create a room");

    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName, createdBy: user._id }), // ✅ fixed
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Room created");
        setRoomName("");
        fetchUserAndRooms();
      } else {
        Alert.alert(data.msg || "Error creating room");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const joinRoom = (room) => {
    router.push({
      pathname: "/RoomDetailScreen",
      params: { roomId: room._id, roomName: room.name },
    });
  };

  const joinByCode = () => {
    const room = rooms.find(
      (r) => r.code.toUpperCase() === joinCode.toUpperCase()
    );
    if (!room) return Alert.alert("Room not found");
    joinRoom(room);
  };

  const deleteRoom = async (roomId) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}/${user._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Room deleted");
        setRooms((prev) => prev.filter((room) => room._id !== roomId));
      } else {
        Alert.alert(data.msg || "Cannot delete room");
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#6a1b9a" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? "#0f0f0f" : "#fff" }]}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140, paddingTop: 80 }}
      >
        {/* Create + Join Inputs */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Room name"
            placeholderTextColor={isDark ? "#888" : "#555"}
            style={[
              styles.input,
              { backgroundColor: isDark ? "#222" : "#f1f1f1", color: isDark ? "#fff" : "#000" },
            ]}
            value={roomName}
            onChangeText={setRoomName}
          />
          <TouchableOpacity style={styles.createBtn} onPress={createRoom}>
            <Text style={{ color: "#fff" }}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Room code"
            placeholderTextColor={isDark ? "#888" : "#555"}
            style={[
              styles.input,
              { backgroundColor: isDark ? "#222" : "#f1f1f1", color: isDark ? "#fff" : "#000" },
            ]}
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <TouchableOpacity style={styles.joinBtn} onPress={joinByCode}>
            <Text style={{ color: "#fff" }}>Join</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, { color: isDark ? "#fff" : "#000" }]}>
          Available Rooms
        </Text>

        {/* Rooms List */}
        {rooms.map((room) => (
          <View
            key={room._id}
            style={[
              styles.roomCard,
              { backgroundColor: isDark ? "#181818" : "#f9f9f9" },
            ]}
          >
            <View style={styles.roomInfo}>
              <Text
                style={{ fontWeight: "bold", color: isDark ? "#fff" : "#000" }}
              >
                Admin: {room.createdBy?.username || "Unknown"}
              </Text>
              <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                Participants:{" "}
                {room.participants?.map((p) => p.username).join(", ") || "None"}
              </Text>
              <Text style={{ color: isDark ? "#aaa" : "#555" }}>
                Code: {room.code}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.smallJoinBtn]}
                onPress={() => joinRoom(room)}
              >
                <Text style={{ color: "#fff" }}>Join</Text>
              </TouchableOpacity>

              {user && room.createdBy?._id === user._id && (
                <TouchableOpacity
                  style={[styles.smallDeleteBtn]}
                  onPress={() => deleteRoom(room._id)}
                >
                  <Text style={{ color: "#fff" }}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={{ backgroundColor: "#e0e0e0" }}>
        <View style={[styles.bottomNav, { backgroundColor: "#555" }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/HomeScreen")}
          >
            <Ionicons
              name="game-controller"
              size={26}
              color={pathname === "/HomeScreen" ? "red" : "grey"}
            />
            <Text style={[styles.navText, { color: isDark ? "#ff" : "#000" }]}>
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
  heading: { fontSize: 20, fontWeight: "bold", marginTop: 30, marginBottom: 15 },
  inputRow: { flexDirection: "row", marginBottom: 12 },
  input: { flex: 1, borderRadius: 8, padding: 10, marginRight: 8 },
  createBtn: {
    backgroundColor: "green",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  joinBtn: {
    backgroundColor: "#6a1b9a",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  roomCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomInfo: {
    flex: 1,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallJoinBtn: {
    backgroundColor: "#6a1b9a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    borderRadius: 5,
  },
  smallDeleteBtn: {
    backgroundColor: "gray",
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "center",
    borderRadius: 5,
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 18,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2 },
});
