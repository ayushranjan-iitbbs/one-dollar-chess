import { Ionicons } from "@expo/vector-icons";
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

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // Build request body
      const requestBody = {
        username,
        email,
        password,
      };

      if (referralCode.trim() !== "") {
        requestBody.referralCode = referralCode.trim();  
      }

      const res = await axios.post("https://chess-backend-y4p3.onrender.com/api/auth/signup", requestBody);

      Alert.alert("Success", "Account created successfully!");
      console.log("Signup Success:", res.data);

      router.push("/LoginScreen");
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Signup Failed", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("./assets/images/chess-bg.png")}
        style={styles.backgroundImage}
      />

      {/* Signup Form */}
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

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
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

        {/* Referral Code (Optional) */}
        <Text style={styles.label}>Referral Code (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter referral code"
          placeholderTextColor="#666"
          value={referralCode}
          onChangeText={setReferralCode}
        />

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
            <Text style={styles.loginLink}>Login</Text>
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
  container: { flex: 1, backgroundColor: "#111" },
  backgroundImage: { width: "100%", height: 280, resizeMode: "cover" },
  formContainer: { flex: 1, backgroundColor: "#111", padding: 20, marginTop: 10 },
  label: { color: "#bbb", marginBottom: 5, marginTop: 2, fontSize: 14 },
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
  passwordInput: { flex: 1, padding: 12, color: "#fff" },
  signupButton: {
    backgroundColor: "#6a0dad",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loginContainer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  loginText: { color: "#bbb", fontSize: 14 },
  loginLink: { color: "#6a0dad", fontWeight: "bold", fontSize: 14 },
  orText: { textAlign: "center", color: "#aaa", marginVertical: 20 },
  socialContainer: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 },
  socialIcon: { width: 32, height: 32, resizeMode: "contain" },
});
