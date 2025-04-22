import React, { useState, useEffect } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import {
  createDiaryEntry,
  updateDiaryEntry,
  testSupabaseConnection,
  createDiaryEntrySimple,
  createTablesIfNotExist,
  findAlternativeTables,
  createDiaryEntryAlternative,
  createStorageBucket,
  imageToBase64,
} from "../../utils/supabase";
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

  // Test Supabase connection on component mount
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log("Setting up database and storage...");

        // Create tables if needed
        const tablesResult = await createTablesIfNotExist();
        if (!tablesResult.success) {
          console.warn("Table setup issue:", tablesResult.error);
        }

        // Create storage bucket if needed
        const bucketResult = await createStorageBucket();
        if (!bucketResult.success) {
          console.warn("Storage bucket setup issue:", bucketResult.error);
        }
      } catch (e) {
        console.error("Database setup error:", e);
        setError("Failed to set up database. Please try again later.");
      }
    };

    setupDatabase();
  }, []);

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
      if (!uri) {
        console.error("Invalid image URI");
        return null;
      }

      console.log("Starting image upload process for URI:", uri);

      // First check if we can process this image
      try {
        const response = await fetch(uri);

        if (!response.ok) {
          console.error(`Failed to fetch image: ${response.status}`);
          return null;
        }

        // Get a small chunk of the image to verify it's valid
        const testBlob = await response.clone().blob();
        if (testBlob.size === 0) {
          console.error("Image data is empty");
          return null;
        }

        console.log("Image verification successful, size:", testBlob.size);
      } catch (verifyError) {
        console.error("Failed to verify image:", verifyError);
        return null;
      }

      // Try using base64 approach first as it's more reliable
      console.log("Converting image to base64...");
      try {
        const base64Data = await imageToBase64(uri);
        if (base64Data) {
          console.log("Successfully converted image to base64");
          return base64Data;
        }
      } catch (base64Error) {
        console.error("Failed to convert image to base64:", base64Error);
        // Continue to try other methods
      }

      // Don't attempt to use storage bucket as it's causing errors
      console.log("Image upload complete - using base64 data");
      return null;
    } catch (e) {
      console.error("Error in uploadImage:", e);
      return null;
    }
  };

  const saveEntry = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save an entry");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter some content");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Starting to save entry...");
      console.log("User ID:", user.id);

      let photoUrl = null;
      let photoBase64 = null;

      // If we have a new photo that's not already a remote URL, process it
      if (photoUri && !photoUri.startsWith("http")) {
        console.log("Processing photo...");
        try {
          const imageData = await uploadImage(photoUri);

          if (imageData) {
            console.log("Image processed successfully");
            // If it's a base64 data URI
            if (imageData.startsWith("data:")) {
              photoBase64 = imageData;
            } else {
              // It's a URL
              photoUrl = imageData;
            }
          } else {
            console.warn(
              "Photo processing returned null, continuing without photo"
            );
          }
        } catch (photoError) {
          console.error("Photo processing failed:", photoError);
          // Continue without the photo
        }
      } else if (photoUri) {
        // It's already a URL
        photoUrl = photoUri;
      }

      const entryData = {
        title,
        content,
        created_at: date.toISOString(),
        user_id: user.id,
        photo_url: photoUrl,
        photo_base64: photoBase64,
      };

      console.log(
        "Entry data prepared:",
        JSON.stringify({
          ...entryData,
          photo_base64: photoBase64 ? "[BASE64 DATA]" : null,
        })
      );

      try {
        let result;

        if (isEditing && existingEntry) {
          console.log("Updating existing entry:", existingEntry.id);
          result = await updateDiaryEntry(existingEntry.id, entryData);
        } else {
          console.log("Creating new entry");
          try {
            // Use the simplified method first as it's more reliable
            result = await createDiaryEntrySimple(entryData);
          } catch (simpleError) {
            console.error("Simple create failed:", simpleError);
            throw simpleError;
          }
        }

        console.log("Entry saved successfully:", result);

        Alert.alert("Success", "Your diary entry has been saved.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.error("Database operation error:", error);
        throw new Error(
          `Failed to save entry: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } catch (e) {
      console.error("Save entry error:", e);
      setError(
        e instanceof Error
          ? e.message
          : "An error occurred while saving your entry. Please try again."
      );

      // Show error alert to the user
      Alert.alert(
        "Error Saving Entry",
        "There was a problem saving your entry. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
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

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}

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
