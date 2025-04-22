import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import DiaryNavigator from "./diary/DiaryNavigator";
import AddEntryNavigator from "./diary/AddEntryNavigator";
import Settings from "./settings/Settings";
import CustomTabBar from "../components/CustomTabBar";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="DiaryTab" component={DiaryNavigator} />

      <Tab.Screen
        name="AddEntryTab"
        component={AddEntryNavigator}
        options={{
          tabBarStyle: { display: "none" },
        }}
      />

      <Tab.Screen name="SettingsTab" component={Settings} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
