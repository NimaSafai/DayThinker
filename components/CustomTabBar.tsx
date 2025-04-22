import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Album, Plus, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/StyleContext";

const AddButton = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.addButton,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Plus color="white" size={24} />
    </TouchableOpacity>
  );
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  const { colors } = useTheme();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Center button (AddEntryTab)
          if (index === 1) {
            return (
              <View key={route.key} style={styles.addButtonContainer}>
                <AddButton onPress={() => navigation.navigate("AddEntryTab")} />
              </View>
            );
          }

          // Regular tab buttons
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let Icon;
          if (index === 0) {
            Icon = Album;
          } else {
            Icon = Settings;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Icon
                size={24}
                color={isFocused ? colors.primary : colors.textLight}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    height: 60,
    width: "90%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    borderTopWidth: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4F86E7", // This will be overridden by the inline style
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    bottom: 25,
    shadowColor: "#000", // Will update this in the component
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default CustomTabBar;
