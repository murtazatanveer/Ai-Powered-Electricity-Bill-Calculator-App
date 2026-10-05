import LoginScreen from "./Src/Auth/LoginScreen/LoginScreen";
import SignUpScreen from "./Src/Auth/SignupScreen/SignupScreen";
import BillDataScreen from "./Src/BillDataScreen/BillDataScreen";
import SplashScreen from "./Src/SplashScreen/SplashScreen";
import WelcomeScreen from "./Src/WelcomeScreen/WelcomeScreen";
import ReadingsScreen from "./Src/ReadingsScreen/ReadingsScreen";
import BillCalculationScreen from "./Src/BillCalculationScreen/BillCalculationScreen";
import ForgotPasswordScreen from "./Src/Auth/ForgotPasswordScreen/ForgotPasswordScreen";

import { NavigationContainer } from "@react-navigation/native";

import Layout from "./Src/Layout/Layout";
import SingleReadingScreen from "./Src/SingleReadingScreen/SingleReadingScreen";

export default function App() {
  return (
    <NavigationContainer>
      <Layout />
    </NavigationContainer>
  );
}
