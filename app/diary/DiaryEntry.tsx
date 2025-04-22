import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import DatePicker from "react-native-date-picker";
import { useAuth } from "../../context/AuthContext";
import { createDiaryEntry, updateDiaryEntry } from "../../utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { supabase } from "../../utils/supabase";
import { AddEntryStackParamList } from "../../types/navigation";

type DiaryEntryRouteProp = RouteProp<
  AddEntryStackParamList,
  "AddEntry" | "EditEntry"
>;

const DiaryEntryScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<DiaryEntryRouteProp>();
  const isEditing = route.name === "EditEntry";
  const existingEntry = isEditing ? route.params?.entry : null;

  const [title, setTitle] = useState(existingEntry?.title || "");
  const [content, setContent] = useState(existingEntry?.content || "");
  const [date, setDate] = useState(
    existingEntry ? new Date(existingEntry.created_at) : new Date()
  );
  const [photoUri, setPhotoUri] = useState<string | null>(
    existingEntry?.photo_url || null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need camera roll permission to upload images"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need camera permission to take photos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("diary_images")
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("diary_images")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.error("Error uploading image: ", e);
      return null;
    }
  };

  const saveEntry = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError("Please enter a title for your entry");
      return;
    }
    if (!content.trim()) {
      setError("Please write something in your diary entry");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let photoUrl = photoUri;

      // If we have a new photo that's not already a remote URL, upload it
      if (photoUri && !photoUri.startsWith("http")) {
        photoUrl = await uploadImage(photoUri);
      }

      const entryData = {
        title,
        content,
        created_at: date.toISOString(),
        user_id: user.id,
        photo_url: photoUrl,
      };

      if (isEditing && existingEntry) {
        await updateDiaryEntry(existingEntry.id, entryData);
      } else {
        await createDiaryEntry(entryData);
      }

      navigation.goBack();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred while saving your entry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Entry" : "New Entry"}
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={saveEntry}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            autoFocus={!isEditing}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={showDatePicker}
            date={date}
            mode="date"
            maximumDate={new Date()}
            onConfirm={(selectedDate) => {
              setShowDatePicker(false);
              setDate(selectedDate);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
          />

          {photoUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: photoUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setPhotoUri(null)}
              >
                <X color="white" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Camera color="#4F86E7" size={24} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <ImageIcon color="#4F86E7" size={24} />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.contentInput}
            placeholder="Write your thoughts..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8F0",
  },
  headerTitle: {
    fontFamily: "Afacad",
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontFamily: "Afacad",
    color: "#777777",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4F86E7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    fontFamily: "Afacad",
    color: "white",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#AAAAAA",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3333",
    fontFamily: "Afacad",
  },
  titleInput: {
    fontFamily: "Afacad",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8F0",
  },
  dateButton: {
    marginBottom: 16,
  },
  dateText: {
    fontFamily: "Afacad",
    color: "#4F86E7",
    fontSize: 16,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  photoButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  photoButton: {
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    borderRadius: 8,
    width: "45%",
  },
  photoButtonText: {
    fontFamily: "Afacad",
    color: "#4F86E7",
    marginTop: 8,
  },
  contentInput: {
    fontFamily: "Afacad",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    height: 300,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    borderRadius: 8,
    backgroundColor: "white",
  },
});

export default DiaryEntryScreen;
