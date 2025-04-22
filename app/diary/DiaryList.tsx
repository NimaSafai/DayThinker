import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { DiaryEntry } from "../../types";
import { fetchDiaryEntries } from "../../utils/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DiaryStackParamList } from "../../types/navigation";
import DiaryCard from "../../components/DiaryCard";

type DiaryListNavigationProp = NativeStackNavigationProp<
  DiaryStackParamList,
  "DiaryList"
>;

const DiaryList = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation<DiaryListNavigationProp>();

  const screenWidth = Dimensions.get("window").width;
  const numColumns = 2; // Use 2 columns for grid
  const cardWidth = (screenWidth - 48) / numColumns; // 48 = padding on left and right + gap between cards

  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchDiaryEntries(user.id);
      setEntries(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred while fetching your diary entries");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [user])
  );

  const handleEntryPress = (entry: DiaryEntry) => {
    navigation.navigate("DiaryRead", { entry });
  };

  const renderItem = ({ item }: { item: DiaryEntry }) => (
    <View style={{ width: cardWidth, padding: 6 }}>
      <DiaryCard entry={item} onPress={handleEntryPress} />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F86E7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DayThinker</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to write your first entry
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8F0",
  },
  title: {
    fontFamily: "Afacad",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  list: {
    padding: 12,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3333",
    fontFamily: "Afacad",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontFamily: "Afacad",
    fontSize: 20,
    color: "#888888",
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: "Afacad",
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
  },
});

export default DiaryList;
