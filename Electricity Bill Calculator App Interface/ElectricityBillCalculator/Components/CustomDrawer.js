// src/components/CustomDrawer.js
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";
import logo from "../assets/GreenLogo.png";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.85, 350);

export default function CustomDrawer({
  isOpen,
  onClose,
  navigation, // <-- Already passed from App.js
  activeRoute = "Meter Reading", // 👈 Updated default name
}) {
  // Animation Values
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0 && gestureState.dx > -DRAWER_WIDTH) {
          translateX.setValue(-DRAWER_WIDTH + gestureState.dx);
          opacity.setValue(0.3 + (gestureState.dx / DRAWER_WIDTH) * 0.7);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -DRAWER_WIDTH * 0.3) {
          closeDrawer();
        } else {
          openDrawer();
        }
      },
    }),
  ).current;

  // Control animations based on `isOpen` prop
  useEffect(() => {
    if (isOpen) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isOpen]);

  const openDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.6,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  // --- MENU DATA ---
  const menuItems = [
    { name: "Dashboard", icon: "view-dashboard-outline", screen: "Dashboard" },
    { name: "Meter Reading", icon: "camera", screen: "CaptureMeter" }, // 👈 Renamed here
    { name: "Reading History", icon: "history", screen: "Reading History" },
    { name: "Tariff Rates", icon: "currency-inr", screen: "Tariff Rates" },
    {
      name: "Smart Recommendation",
      icon: "lightbulb-on-outline",
      screen: "Smart Recommendation",
    },
  ];

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => navigation.replace("Login"), 400);
  };

  return (
    <View style={styles.container(isOpen)}>
      {/* Overlay (Darkening background) */}
      <Animated.View style={[styles.overlay, { opacity: opacity }]}>
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Drawer Container */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: translateX }] }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* ✅ HEADER */}
            <View style={styles.header}>
              <Image
                source={logo}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Electricity Bill Calculator</Text>
            </View>

            {/* ✅ PROFILE SECTION */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>User Name</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  user@email.com
                </Text>
              </View>
            </View>

            {/* ✅ MENU ITEMS */}
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => {
                const isActive = activeRoute === item.name;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    onPress={() => {
                      closeDrawer(); // Close the drawer first
                      setTimeout(() => {
                        // Then navigate to the correct screen
                        if (navigation && item.screen) {
                          navigation.navigate(item.screen);
                        }
                      }, 300);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={isActive ? COLORS.background : COLORS.primary}
                      style={styles.icon}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        isActive && styles.activeMenuText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ✅ BOTTOM SECTION (Logout) */}
          <View style={styles.bottomContainer}>
            <View style={styles.bottomDivider} />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={22} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* ✅ Added a subtle helper text for polish */}
            <Text style={styles.helperText}>v1.0.0 • Secure Session</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// --- STYLES ---
const styles = {
  container: (isOpen) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: isOpen ? "auto" : "none",
  }),
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFFFFF",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  content: {
    flex: 1,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primarySupport,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "left",
    lineHeight: 24,
    letterSpacing: 0.5,
  },

  // PROFILE SECTION
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: "rgba(200, 210, 166, 0.3)",
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySupport,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(29, 46, 27, 0.6)",
  },

  // MENU ITEMS
  menuContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activeMenuItem: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },
  activeMenuText: {
    color: COLORS.background,
    fontWeight: "600",
  },

  // BOTTOM CONTAINER (LOGOUT)
  bottomContainer: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  bottomDivider: {
    height: 1,
    backgroundColor: "rgba(29, 46, 27, 0.08)",
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.4,
    textAlign: "center",
    marginTop: 12,
  },
};
