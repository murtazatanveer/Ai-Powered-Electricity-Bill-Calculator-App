import { StyleSheet } from "react-native";
import { View, Image, Text } from "react-native-animatable";
import { useWindowDimensions } from "react-native";

import logo from "../assets/LightLogo.png";
import COLORS from "../Components/Colors";

export default function Logo({ name }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  return (
    <View style={styles.logoContainer}>
      <Image
        source={logo}
        resizeMode="contain"
        style={{
          width: isSmallScreen ? 100 : 130,
          height: isSmallScreen ? 100 : 130,
        }}
      />
      <Text style={styles.logInTitle}>
        {name === "Log In" ? "Log In" : "Create Account"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  logInTitle: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 8,
  },
});
