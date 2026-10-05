import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

const NAV_ITEMS = [
  { name: "DashboardScreen", label: "Dashboard", icon: "grid-outline" },
  { name: "ReadingsScreen", label: "Readings", icon: "document-text-outline" },
  {
    name: "TariffRatesScreen",
    label: "Tariff Rates",
    icon: "pricetags-outline",
  },
];

const CustomDrawer = ({
  isOpen,
  onClose,
  onLogout,
  navigation,
  activeRoute,
  user,
}) => {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      translateX.setValue(-DRAWER_WIDTH);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
          mass: 0.9,
        }),
      ]).start();
    }
  }, [isOpen, translateX, backdropOpacity]);

  const handleClose = (callback) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start(() => {
      onClose?.();
      if (typeof callback === "function") callback();
    });
  };

  const handleNavigate = (routeName) => {
    handleClose(() => {
      if (routeName === activeRoute) return;
      navigation?.navigate(routeName);
    });
  };

  const handleLogoutPress = () => {
    handleClose(() => onLogout?.());
  };

  if (!isOpen) return null;

  const displayName = user?.displayName || "Guest";
  const displayEmail = user?.email || "Not signed in";
  const initial = displayName.trim().charAt(0).toUpperCase() || "G";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => handleClose()}
        />
      </Animated.View>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        {/* ---------- Profile header ---------- */}
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>
        </View>

        {/* ---------- Nav ---------- */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.navList}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => handleNavigate(item.name)}
                activeOpacity={0.85}
                style={[styles.navItem, isActive && styles.navItemActive]}
              >
                <View
                  style={[
                    styles.navIconWrap,
                    isActive && styles.navIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? COLORS.white : COLORS.primary}
                  />
                </View>
                <Text
                  style={[styles.navLabel, isActive && styles.navLabelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isActive ? COLORS.white : COLORS.primaryLight}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ---------- Logout ---------- */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            activeOpacity={0.85}
            style={styles.logoutButton}
          >
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.background,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.large,
  },

  // ---------- Profile ----------
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  profileText: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 2,
  },

  // ---------- Nav ----------
  navList: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryFade,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.small,
  },
  navItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  navIconWrapActive: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  navLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  navLabelActive: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // ---------- Footer / logout (RED) ----------
  footer: {
    marginTop: "auto",
    padding: SPACING.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: "#c0554eff", // ← softer, deeper red
    ...SHADOWS.medium,
  },
  logoutIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});

export { NAV_ITEMS };
export default CustomDrawer;
