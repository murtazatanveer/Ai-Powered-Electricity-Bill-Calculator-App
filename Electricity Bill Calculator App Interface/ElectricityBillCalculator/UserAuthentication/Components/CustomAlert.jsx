import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../../Components/Colors";

const { width } = Dimensions.get("window");

export default function CustomAlert({
  visible,
  title,
  message,
  buttonText = "OK",
  onPress,
  type = "info", // "info", "success", "error"
}) {
  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { name: "check-circle", color: COLORS.success };
      case "error":
        return { name: "alert-circle", color: COLORS.error };
      default:
        return { name: "information", color: COLORS.primary };
    }
  };

  const { name, color } = getIconAndColor();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onPress}
    >
      {/* Soft, simple dark overlay */}
      <View style={styles.overlay}>
        {/* Card background matched to your Tea Mist color palette */}
        <View style={styles.card}>
          {/* Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={name} size={48} color={color} />
          </View>

          <Text style={[styles.title, { color: color }]}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)", // Soft dim
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.8,
    backgroundColor: "rgba(218, 228, 200, 0.95)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    // Subtle, clean shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#3A4A32", // Deep Forest Brew tint for contrast
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
