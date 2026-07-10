// App.js
import { useState, useEffect } from "react";
import { View, Text } from "react-native"; // <-- IMPORT TEXT HERE
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./Components/SplashScreen";
import LoginScreen from "./UserAuthentication/LoginScreen";
import SignupScreen from "./UserAuthentication/SignupScreen";
import COLORS from "./Components/Colors";

// ✅ Fixed Dashboard Component
function Dashboard() {
  return (
    // <-- YOU MUST RETURN THE JSX!
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: COLORS.primary,
        }}
      >
        Dashboard Screen
      </Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
