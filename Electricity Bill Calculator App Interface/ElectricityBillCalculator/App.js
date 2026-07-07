import "./global.css";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#C8D2A6" />

      <ScrollView className="flex-1 p-4">
        {/* ==================== HEADER ==================== */}
        <View className="bg-primary p-6 rounded-2xl mb-6 shadow-shadow">
          <Text className="text-text-light text-3xl font-bold text-center">
            Electricity Bill App
          </Text>
          <Text className="text-text-light/80 text-center mt-1">
            Tailwind Color Config Test
          </Text>
        </View>

        {/* ==================== YOUR 5 CORE COLORS ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Your 5 Core Colors
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {/* Primary */}
          <View className="bg-primary px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-light text-center">Primary</Text>
            <Text className="text-text-light/70 text-xs text-center">
              #1D2E1B
            </Text>
          </View>
          {/* Supportive Main */}
          <View className="bg-primary-support px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-light text-center">Support</Text>
            <Text className="text-text-light/70 text-xs text-center">
              #468432
            </Text>
          </View>
          {/* Background (Tea Mist) */}
          <View className="bg-background border border-border px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">Background</Text>
            <Text className="text-text-muted text-xs text-center">#C8D2A6</Text>
          </View>
          {/* Error */}
          <View className="bg-error/10 border border-error px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-error text-center font-bold">Error</Text>
            <Text className="text-error/70 text-xs text-center">#FF3F33</Text>
          </View>
          {/* Success (Gold) */}
          <View className="bg-success/10 border border-success px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-success text-center font-bold">Success</Text>
            <Text className="text-success/70 text-xs text-center">#FFDE42</Text>
          </View>
        </View>

        {/* ==================== BACKGROUND COLORS ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Background Colors
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-background border border-border px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">bg-background</Text>
            <Text className="text-text-muted text-xs text-center">#C8D2A6</Text>
          </View>
          <View className="bg-white border border-border px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">bg-white</Text>
            <Text className="text-text-muted text-xs text-center">#FFFFFF</Text>
          </View>
          <View className="bg-surface-alt border border-border px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">
              bg-surface-alt
            </Text>
            <Text className="text-text-muted text-xs text-center">#DDE6C8</Text>
          </View>
        </View>

        {/* ==================== TEXT COLORS ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Text Colors
        </Text>
        <View className="bg-white rounded-xl p-4 border border-border mb-6">
          <Text className="text-text-primary text-lg font-bold">
            text-text-primary - #1D2E1B
          </Text>
          <Text className="text-text-secondary text-base mt-1">
            text-text-secondary - #5A6B4A
          </Text>
          <Text className="text-text-muted text-sm mt-1">
            text-text-muted - #8A9B7A
          </Text>
          <View className="bg-primary mt-2 p-2 rounded">
            <Text className="text-text-light">text-text-light - #FFFFFF</Text>
          </View>
        </View>

        {/* ==================== UTILITY COLORS ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Utility Colors
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-white border border-border px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">border-border</Text>
            <Text className="text-text-muted text-xs text-center">#B0C29A</Text>
          </View>
          <View className="bg-white border border-divider px-4 py-3 rounded-lg flex-1 min-w-[100px]">
            <Text className="text-text-primary text-center">
              border-divider
            </Text>
            <Text className="text-text-muted text-xs text-center">#D8E0C8</Text>
          </View>
          <View className="bg-primary/10 px-4 py-3 rounded-lg flex-1 min-w-[100px] shadow-shadow">
            <Text className="text-text-primary text-center">shadow-shadow</Text>
            <Text className="text-text-muted text-xs text-center">
              rgba(29,46,27,0.15)
            </Text>
          </View>
        </View>

        {/* ==================== INTERACTIVE ELEMENTS ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Interactive Elements
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-text-light text-center font-bold">
              Primary Button
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-primary-support px-6 py-3 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-text-light text-center font-bold">
              Support Button
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-3 mb-8">
          <TouchableOpacity className="bg-white border border-error px-6 py-3 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-error text-center font-bold">
              Error Action
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-success px-6 py-3 rounded-lg flex-1 min-w-[120px]">
            <Text className="text-success text-center font-bold">
              Success Action
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================== CARD COMPONENT ==================== */}
        <Text className="text-text-primary text-xl font-bold mb-3">
          Card Component (bg-white)
        </Text>
        <View className="bg-white rounded-xl p-4 border border-border shadow-shadow mb-8">
          <Text className="text-text-primary text-lg font-bold mb-1">
            Monthly Bill Summary
          </Text>
          <Text className="text-text-secondary text-sm mb-2">
            Current consumption: 450 kWh
          </Text>
          <View className="flex-row justify-between items-center border-t border-divider pt-3 mt-2">
            <Text className="text-text-muted text-xs">Estimated Bill</Text>
            <Text className="text-text-primary text-xl font-bold">
              PKR 4,500
            </Text>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-success text-xs">✅ On track</Text>
            <Text className="text-text-muted text-xs">Due: 25 Jul 2026</Text>
          </View>
        </View>

        {/* ==================== FOOTER ==================== */}
        <View className="bg-primary/5 rounded-xl p-4 border border-primary/20 mb-6">
          <Text className="text-text-secondary text-center text-sm">
            ✅ All colors from your config are working correctly!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
