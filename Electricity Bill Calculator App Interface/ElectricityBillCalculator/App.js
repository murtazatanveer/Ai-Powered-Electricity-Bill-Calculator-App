// App.js
import { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import SplashScreen from "./Components/SplashScreen";
import LoginScreen from "./UserAuthentication/LoginScreen";
import SignupScreen from "./UserAuthentication/SignupScreen";
import CaptureMeterScreen from "./OCRMeterReading/CaptureMeterScreen";
import CustomDrawer from "./Components/CustomDrawer"; // <-- Import the Custom Drawer
import COLORS from "./Components/Colors";

const Stack = createNativeStackNavigator();

// --- DRAWER WRAPPER SCREEN ---
// This wraps the CaptureMeterScreen and adds the Drawer + Hamburger button on top
function DrawerWrapper({ navigation, route }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* The Actual Screen Content */}
      <View style={{ flex: 1 }}>
        {/* Custom Header with Hamburger Menu */}
        <View
          style={{
            paddingTop: 50,
            paddingHorizontal: 20,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.background,
          }}
        >
          <TouchableOpacity onPress={() => setDrawerOpen(true)}>
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <Text
            style={{
              marginLeft: 16,
              fontSize: 18,
              fontWeight: "700",
              color: COLORS.primary,
            }}
          >
            Meter Reading
          </Text>
        </View>

        {/* The actual screen content (CaptureMeter) */}
        <CaptureMeterScreen navigation={navigation} route={route} />
      </View>

      {/* The Custom Drawer Overlay */}
      <CustomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
        activeRoute="OCR Meter Reading"
      />
    </View>
  );
}

// --- MAIN APP COMPONENT ---
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

        {/* ✅ After Login, user goes to the DrawerWrapper instead of plain CaptureMeter */}
        <Stack.Screen name="AppDrawer" component={DrawerWrapper} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
