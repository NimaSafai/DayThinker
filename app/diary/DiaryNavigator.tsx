import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types/navigation";
import DiaryList from "./DiaryList";
import DiaryRead from "./DiaryRead";

const Stack = createNativeStackNavigator<DiaryStackParamList>();

const DiaryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F9FAFC" },
      }}
    >
      <Stack.Screen name="DiaryList" component={DiaryList} />
      <Stack.Screen name="DiaryRead" component={DiaryRead} />
    </Stack.Navigator>
  );
};

export default DiaryNavigator;
