import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../../Theme/colors";
import CustomDrawer from "./CustomDrawer";

import { signOutUser } from "../../Config/authService";

const ScreenShell = ({ ScreenComponent, route, navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // Logout — clears the Firebase session and navigates to Login.
  // The try/catch guarantees navigation even if signOut fails.
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Non-fatal — we still transition to Login
    }
    navigation?.replace("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <ScreenComponent
        navigation={navigation}
        route={route}
        openDrawer={openDrawer}
      />

      <CustomDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onLogout={handleLogout}
        navigation={navigation}
        activeRoute={route?.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default ScreenShell;
