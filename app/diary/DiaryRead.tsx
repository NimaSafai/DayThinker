import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types/navigation";
import { ChevronLeft } from "lucide-react-native";

type DiaryReadRouteProp = RouteProp<DiaryStackParamList, "DiaryRead">;
type DiaryReadNavigationProp = NativeStackNavigationProp<
  DiaryStackParamList,
  "DiaryRead"
>;

interface DiaryReadProps {
  route: DiaryReadRouteProp;
}

const DiaryRead = ({ route }: DiaryReadProps) => {
  const { entry } = route.params;
  const navigation = useNavigation<DiaryReadNavigationProp>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#333333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Entry</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.date}>{formatDate(entry.created_at)}</Text>

        {entry.photo_url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: entry.photo_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <Text style={styles.content}>{entry.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: "Afacad",
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerRight: {
    width: 40, // Balances the backButton width for center alignment
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontFamily: "Afacad",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  date: {
    fontFamily: "Afacad",
    fontSize: 14,
    color: "#888888",
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    fontFamily: "Afacad",
    fontSize: 16,
    lineHeight: 24,
    color: "#444444",
  },
});

export default DiaryRead;
