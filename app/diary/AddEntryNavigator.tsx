import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AddEntryStackParamList } from "../../types/navigation";
import DiaryEntry from "./DiaryEntry";

const Stack = createNativeStackNavigator<AddEntryStackParamList>();

const AddEntryNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F9FAFC" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="AddEntry" component={DiaryEntry} />
      <Stack.Screen name="EditEntry" component={DiaryEntry} />
    </Stack.Navigator>
  );
};

export default AddEntryNavigator;
