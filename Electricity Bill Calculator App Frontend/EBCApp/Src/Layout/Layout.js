import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { COLORS } from "../Theme/colors";
import { auth } from "../Config/FirebaseConfig";

import SplashScreen from "../SplashScreen/SplashScreen";
import WelcomeScreen from "../WelcomeScreen/WelcomeScreen";
import SignUpScreen from "../Auth/SignupScreen/SignupScreen";
import LoginScreen from "../Auth/LoginScreen/LoginScreen";
import ForgotPasswordScreen from "../Auth/ForgotPasswordScreen/ForgotPasswordScreen";
import BillDataScreen from "../BillDataScreen/BillDataScreen";
import ReadingsScreen from "../ReadingsScreen/ReadingsScreen";
import DashboardScreen from "../DashboardScreen/DashboardScreen";
import TariffRatesScreen from "../TariffRatesScreen/TariffRatesScreen";
import SingleReadingScreen from "../SingleReadingScreen/SingleReadingScreen";

import ScreenShell from "./Components/ScreenShell";
import SplashSkeleton from "../Common/Components/SplashSkeleton";

const Stack = createNativeStackNavigator();

// Wrap a screen with the drawer + top bar
const withShell =
  (ScreenComponent, options = {}) =>
  (props) => (
    <ScreenShell
      ScreenComponent={ScreenComponent}
      route={props.route}
      navigation={props.navigation}
      rightIcon={options.rightIcon}
      onRightPress={options.onRightPress}
    />
  );

export default function Layout() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setInitialRoute(user ? "BillDataScreen" : "SplashScreen");
    });

    return unsubscribe;
  }, []);

  // Firebase hasn't resolved the session yet — show a splash-shaped skeleton.
  // Typically lasts <150ms.
  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <SplashSkeleton />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left",
        animationDuration: 500,
      }}
    >
      {/* ---------- Onboarding (no shell) ---------- */}
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />

      {/* ---------- Auth (no shell) ---------- */}
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />

      {/* ---------- Post-login, pre-shell (no shell) ---------- */}
      <Stack.Screen name="BillDataScreen" component={BillDataScreen} />

      {/* ---------- Post-login, with shell ---------- */}
      <Stack.Screen
        name="DashboardScreen"
        component={withShell(DashboardScreen)}
      />
      <Stack.Screen
        name="ReadingsScreen"
        component={withShell(ReadingsScreen)}
      />
      <Stack.Screen
        name="TariffRatesScreen"
        component={withShell(TariffRatesScreen)}
      />

      {/* ---------- Detail screens (no shell) ---------- */}
      <Stack.Screen
        name="SingleReadingScreen"
        component={SingleReadingScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
