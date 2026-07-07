import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useWindowDimensions } from "react-native";
import logo from "./assets/Logo.png";

export default function LoginScreen({ onLogin }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const [email, setEmail] = useState("jamesbond123@gmail.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#C8D2A6" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View className="flex-1 justify-center px-6 md:px-10 pt-8">
            {/* Logo Area - Using your imported logo */}
            <View className="items-center mb-6">
              <Image
                source={logo}
                resizeMode="contain"
                style={{
                  width: isSmallScreen ? 100 : 130,
                  height: isSmallScreen ? 100 : 130,
                }}
              />
              <Text className="text-primary font-bold text-3xl md:text-4xl tracking-tight mt-2">
                Log In
              </Text>
            </View>

            {/* Email Input Field */}
            <View className="bg-white/80 border border-border rounded-2xl px-4 py-3 mb-4 flex-row items-center shadow-shadow">
              <Text className="text-2xl text-primary mr-3">✉️</Text>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-semibold mb-0.5 text-primary/70">
                  Email
                </Text>
                <TextInput
                  className="text-primary text-base font-medium p-0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="#8A9B7A"
                />
              </View>
            </View>

            {/* Password Input Field */}
            <View className="bg-white/80 border border-border rounded-2xl px-4 py-3 mb-2 flex-row items-center shadow-shadow">
              <Text className="text-2xl text-primary mr-3">🔒</Text>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-semibold mb-0.5 text-primary/70">
                  Password
                </Text>
                <TextInput
                  className="text-primary text-base font-medium p-0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8A9B7A"
                />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text className="text-primary text-xl opacity-60">
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View className="flex-row justify-between items-center mb-6 mt-1">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${rememberMe ? "bg-primary-support border-primary-support" : "border-primary/50"}`}
                >
                  {rememberMe && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-primary text-sm font-medium">
                  Remember Me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text className="text-primary-support text-sm font-semibold">
                  Forgotten Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Log In Button */}
            <TouchableOpacity
              className="bg-primary-support py-4 rounded-2xl shadow-shadow mb-6"
              onPress={() => onLogin && onLogin()}
            >
              <Text className="text-white text-center text-lg font-bold tracking-wide">
                Log In
              </Text>
            </TouchableOpacity>

            {/* Divider "Or Login with" */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-border" />
              <Text className="text-primary/60 text-xs mx-4 font-medium">
                Or Log in with
              </Text>
              <View className="flex-1 h-[1px] bg-border" />
            </View>

            {/* Google Login Button (Facebook removed as requested) */}
            <TouchableOpacity className="bg-white border border-border py-3.5 rounded-2xl flex-row justify-center items-center shadow-shadow mb-8">
              <Text className="text-2xl mr-3">🇬</Text>
              <Text className="text-primary font-bold text-base">
                Log In with Google
              </Text>
            </TouchableOpacity>

            {/* Footer - Create Account Link */}
            <View className="flex-row justify-center items-center pb-4">
              <Text className="text-primary/70 text-sm">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity>
                <Text className="text-primary-support font-bold text-sm">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
