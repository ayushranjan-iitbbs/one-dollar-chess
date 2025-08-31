import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
 
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const BACKEND_URL = process.env.BACKEND_URL;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    try {
      const res = await axios.post("https://chess-backend-y4p3.onrender.com/api/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data;
      console.log("Login Success:", user);

      // Store token and user info in AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("Success", `Welcome back, ${user.username}!`);

      // Navigate to HomeScreen
      router.replace("/HomeScreen");
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Login Failed", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("./assets/images/chess-bg.png")}
        style={styles.backgroundImage}
      />

      {/* Login Form */}
      <View style={styles.formContainer}>
        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Ayush Ranjan"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            placeholderTextColor="#666"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={22}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <Text style={styles.orText}>Or continue with</Text>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <Image
            source={require("./assets/images/google-logo.webp")}
            style={styles.socialIcon}
          />
          <Ionicons name="logo-apple" size={32} color="#fff" />
          <Ionicons name="logo-twitter" size={32} color="#1DA1F2" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  backgroundImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
    marginTop: 45,
  },
  label: {
    color: "#bbb",
    marginBottom: 5,
    marginTop: 10,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 6,
    color: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: "#fff",
  },
  loginButton: {
    backgroundColor: "#6a0dad",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  signupText: {
    color: "#bbb",
    fontSize: 14,
  },
  signupLink: {
    color: "#6a0dad",
    fontWeight: "bold",
    fontSize: 14,
  },
  orText: {
    textAlign: "center",
    color: "#aaa",
    marginVertical: 20,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
