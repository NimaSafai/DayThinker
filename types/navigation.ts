import { DiaryEntry } from "./index";

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  DiaryTab: undefined;
  AddEntryTab: undefined;
  SettingsTab: undefined;
};

export type DiaryStackParamList = {
  DiaryList: undefined;
  DiaryRead: { entry: DiaryEntry };
};

export type AddEntryStackParamList = {
  AddEntry: undefined;
  EditEntry: { entry: DiaryEntry };
};
