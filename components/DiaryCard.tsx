import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DiaryEntry } from "../types";

interface DiaryCardProps {
  entry: DiaryEntry;
  onPress: (entry: DiaryEntry) => void;
}

const DiaryCard = ({ entry, onPress }: DiaryCardProps) => {
  // Format the date
  const date = new Date(entry.created_at);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const dateStr = `${dayOfWeek}, ${month} ${dayOfMonth}`;

  // Truncate the content for preview
  const truncatedContent =
    entry.content.length > 100
      ? `${entry.content.substring(0, 100)}...`
      : entry.content;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <Text style={styles.date}>{dateStr}</Text>
      <Text style={styles.title} numberOfLines={1}>
        {entry.title}
      </Text>
      <Text style={styles.content} numberOfLines={3}>
        {truncatedContent}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
    flex: 1,
    minHeight: 120,
  },
  date: {
    fontFamily: "Afacad",
    fontSize: 12,
    color: "#888888",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Afacad",
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  content: {
    fontFamily: "Afacad",
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
});

export default DiaryCard;
