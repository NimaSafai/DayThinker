import React from "react";
import { View, Text } from "react-native";

export default function TestNativeWind() {
  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <View className="bg-card rounded-lg p-6 shadow-md w-full">
        <Text className="text-primary text-2xl font-bold mb-2">
          NativeWind Works!
        </Text>
        <Text className="text-text">
          If you can see this styled nicely, NativeWind is working correctly.
        </Text>
        <View className="flex-row mt-4 space-x-2">
          <View className="rounded-full bg-primary p-2">
            <Text className="text-white">Button 1</Text>
          </View>
          <View className="rounded-full bg-secondary p-2">
            <Text className="text-text">Button 2</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
