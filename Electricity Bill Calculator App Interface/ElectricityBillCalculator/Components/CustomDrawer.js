// src/components/CustomDrawer.js
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";
import logo from "../assets/LightLogo.png";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.8, 320);

export default function CustomDrawer({
  isOpen,
  onClose,
  navigation,
  activeRoute = "OCR Meter Reading",
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
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  // --- Menu Data ---
  const menuItems = [
    { name: "Dashboard", icon: "view-dashboard-outline", disabled: true },
    { name: "OCR Meter Reading", icon: "camera", disabled: false },
    { name: "Reading History", icon: "history", disabled: true },
    { name: "Tariff Rates", icon: "currency-inr", disabled: true },
    {
      name: "Smart Recommendation",
      icon: "lightbulb-on-outline",
      disabled: true,
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
            {/* Header */}
            <View style={styles.header}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.appName}>
                Electricity{"\n"}Bill Calculator
              </Text>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>User Name</Text>
                <Text style={styles.profileEmail}>user@email.com</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => {
                const isActive = activeRoute === item.name;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      isActive && styles.activeMenuItem,
                      item.disabled && styles.disabledMenuItem,
                    ]}
                    onPress={() => {
                      if (!item.disabled && item.name === "OCR Meter Reading") {
                        closeDrawer();
                        setTimeout(
                          () => navigation.navigate("CaptureMeter"),
                          300,
                        );
                      }
                    }}
                    disabled={item.disabled}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={
                        isActive
                          ? COLORS.background
                          : item.disabled
                            ? "rgba(29, 46, 27, 0.3)"
                            : COLORS.primary
                      }
                      style={styles.icon}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        isActive && styles.activeMenuText,
                        item.disabled && styles.disabledMenuText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Logout Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color={COLORS.error}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// ⚠️ UPDATED STYLES: Converted to a function to accept `isOpen`
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
    backgroundColor: COLORS.background,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.1)",
    marginBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    lineHeight: 24,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
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
    color: "rgba(29, 46, 27, 0.7)",
  },
  menuContainer: {
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledMenuItem: {
    opacity: 0.8,
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
  disabledMenuText: {
    color: "rgba(29, 46, 27, 0.4)",
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(29, 46, 27, 0.1)",
    padding: 20,
    paddingBottom: 24,
    backgroundColor: COLORS.background,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.error,
    marginLeft: 12,
  },
};
