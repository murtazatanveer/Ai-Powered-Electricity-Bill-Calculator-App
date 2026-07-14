// App.js (or Layout.js)
import { useState, useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../Components/SplashScreen";
import LoginScreen from "../UserAuthentication/LoginScreen";
import SignupScreen from "../UserAuthentication/SignupScreen";
import CaptureMeterScreen from "../OCRMeterReading/CaptureMeterScreen";
import CustomDrawer from "../Components/CustomDrawer";
import HamburgerMenu from "../Components/HamburgerMenu";
import COLORS from "../Components/Colors";
import TariffRatesScreen from "../TariffManagement/TariffRatesScreen";
import SmartRecommendationScreen from "../SmartRecommendation/SmartRecommendationScreen";
import ReadingHistoryScreen from "../ReadingHistory/ReadingHistoryScreen";
import DashboardScreen from "../Dashboard/DashboardScreen";

const Stack = createNativeStackNavigator();

function WrappedScreen({ ScreenComponent, route, ...props }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-Hide Animation Logic
  const topBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const diff = currentY - lastScrollY.current;

        if (Math.abs(diff) > 8) {
          if (currentY > 10 && diff > 0) {
            Animated.timing(topBarTranslateY, {
              toValue: -100,
              duration: 250,
              useNativeDriver: true,
            }).start();
          } else if (diff < 0 || currentY < 10) {
            Animated.timing(topBarTranslateY, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          }
          lastScrollY.current = currentY;
        }
      },
    },
  );

  const handleLogout = () => {
    setDrawerOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* TOP BAR */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transform: [{ translateY: topBarTranslateY }],
        }}
      >
        <HamburgerMenu
          title={route?.name || "Menu"}
          onPress={() => setDrawerOpen(true)}
        />
      </Animated.View>

      {/* SCROLLABLE CONTENT */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 90 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <ScreenComponent {...props} route={route} />
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* DRAWER */}
      <CustomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        navigation={props.navigation}
        activeRoute={route?.name || "OCR Meter Reading"}
      />
    </View>
  );
}

export default function Layout() {
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
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* ✅ All real screens wrapped in the Drawer */}
        <Stack.Screen name="CaptureMeter">
          {(props) => (
            <WrappedScreen ScreenComponent={CaptureMeterScreen} {...props} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {(props) => (
            <WrappedScreen ScreenComponent={DashboardScreen} {...props} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Reading History">
          {(props) => (
            <WrappedScreen ScreenComponent={ReadingHistoryScreen} {...props} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Tariff Rates">
          {(props) => (
            <WrappedScreen ScreenComponent={TariffRatesScreen} {...props} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Smart Recommendation">
          {(props) => (
            <WrappedScreen
              ScreenComponent={SmartRecommendationScreen}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
