import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../../Theme/colors";
import CustomDrawer from "./CustomDrawer";

import { signOutUser } from "../../Config/authService";

const ScreenShell = ({ ScreenComponent, route, navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // Logout — self-contained
  const handleLogout = async () => {
    await signOutUser();
    navigation?.replace("LoginScreen");
  };

  return (
    <View style={styles.container}>
      {/* Screen renders its own header with a hamburger that calls openDrawer */}
      <ScreenComponent
        navigation={navigation}
        route={route}
        openDrawer={openDrawer}
      />

      {/* Drawer overlays everything */}
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
