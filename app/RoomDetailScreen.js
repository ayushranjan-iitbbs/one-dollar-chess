import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import io from "socket.io-client";

const SERVER_URL = "https://chess-backend-y4p3.onrender.com";

export default function RoomDetailScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { roomId } = useLocalSearchParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Fetch user, room details, and setup socket
  useEffect(() => {
    const setup = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await fetch(`${SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUser(userData);

        const roomRes = await fetch(`${SERVER_URL}/api/rooms/${roomId}`);
        const roomData = await roomRes.json();
        setRoom(roomData);

        // Initialize socket only after user is fetched
        socketRef.current = io(SERVER_URL);

        socketRef.current.emit("joinRoom", {
          roomId,
          userId: userData._id,
        });

        socketRef.current.on("message", (msg) =>
          setMessages((prev) => [...prev, msg])
        );
      } catch (err) {
        console.error("❌ Error setting up room:", err);
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;
    const msgText = `${user.username}: ${message}`;
    socketRef.current.emit("sendMessage", { roomId, message: msgText });
    setMessages((prev) => [...prev, msgText]); // also add locally
    setMessage("");
  };

  const deleteRoom = async () => {
    if (!user || !user._id) return;
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_URL}/api/rooms/${room._id}/${user._id}`, {
                method: "DELETE",
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert("Room deleted successfully.");
                router.push('/RoomScreen');
              } else {
                Alert.alert(data.msg || "Error deleting room.");
              }
            } catch (err) {
              console.error("❌ Error deleting room:", err);
            }
          },
        },
      ]
    );
  };

  const leaveRoom = () => {
     
    router.push('/RoomScreen');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: isDark ? "#0f0f0f" : "#fff" }]}>
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    );
  }

  if (!room) {
      return (
          <SafeAreaView style={[styles.loadingContainer, { backgroundColor: isDark ? "#0f0f0f" : "#fff" }]}>
              <Text style={{color: isDark ? "#fff" : "#000"}}>Room not found or no longer exists.</Text>
              <TouchableOpacity onPress={() => router.push('/RoomScreen')} style={{marginTop: 20}}>
                  <Text style={{color: 'blue'}}>Go back to Rooms</Text>
              </TouchableOpacity>
          </SafeAreaView>
      );
  }

  const isAdmin = user && room.createdBy === user._id;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f0f0f" : "#fff" }]}>
      {/* Room Details Section */}
      <View style={[styles.detailsHeader, { backgroundColor: isDark ? "#1c1c1c" : "#f1f1f1" }]}>
        <Text style={[styles.roomTitle, { color: isDark ? "#fff" : "#000" }]}>
          {room.name}
        </Text>
        <Text style={[styles.detailText, { color: isDark ? "#888" : "#555" }]}>
          Room Code: {room.code}
        </Text>
        <Text style={[styles.detailText, { color: isDark ? "#888" : "#555" }]}>
          Admin: {room.createdBy.username}
        </Text>
        <Text style={[styles.detailText, { color: isDark ? "#888" : "#555" }]}>
          Participants: {room.participants.map(p => p.username).join(", ")}
        </Text>
        
        {isAdmin ? (
            <TouchableOpacity onPress={deleteRoom} style={[styles.actionBtn, styles.deleteBtn]}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Delete Room</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity onPress={leaveRoom} style={[styles.actionBtn, styles.leaveBtn]}>
                <Ionicons name="exit-outline" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Leave Room</Text>
            </TouchableOpacity>
        )}
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ color: isDark ? "#fff" : "#000", marginVertical: 2 }}>
            {item}
          </Text>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Message Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#222" : "#f1f1f1",
              color: isDark ? "#fff" : "#000",
            },
          ]}
          placeholder="Type a message"
          placeholderTextColor={isDark ? "#888" : "#555"}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteBtn: {
    backgroundColor: 'darkred',
  },
  leaveBtn: {
    backgroundColor: 'gray',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inputRow: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  input: { flex: 1, borderRadius: 8, padding: 10, marginRight: 8 },
  sendBtn: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
});