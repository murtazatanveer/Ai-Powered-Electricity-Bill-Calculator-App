import { View, Image, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useWindowDimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import logo from "../assets/GreenLogo.png";
import COLORS from "./Colors";

export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primarySupport}
      />

      {/* Main Container */}
      <View style={styles.mainContainer}>
        {/* Logo + Text Group */}
        <View style={styles.rowContainer}>
          {/* Logo */}
          <Image
            source={logo}
            resizeMode="contain"
            style={{
              width: isSmallScreen ? 100 : 140,
              height: isSmallScreen ? 100 : 140,
            }}
          />

          {/* Text - Auto animates because of the 'animation' prop */}
          <Animatable.Text
            animation="fadeIn"
            duration={2000}
            easing="ease-out"
            iterationCount={1}
            style={[
              styles.animatedText,
              isSmallScreen ? styles.textSmall : styles.textLarge,
            ]}
          >
            Electricity{"\n"}Bill Calculator
          </Animatable.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primarySupport,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  animatedText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "left",
  },
  textSmall: {
    fontSize: 28,
    maxWidth: 200,
    lineHeight: 34,
  },
  textLarge: {
    fontSize: 40,
    maxWidth: 240,
    lineHeight: 48,
  },
});
