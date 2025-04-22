import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  fetchUserSettings,
  updateUserSettings,
  migrateImagesToStorage,
  createStorageBucket,
} from "../../utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { UserSettings } from "../../types";
import {
  LogOut,
  Clock,
  Bell,
  Share,
  Calendar,
  Database,
} from "lucide-react-native";
import { useTheme } from "../../context/StyleContext";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    daily_reminders: false,
    reminder_time: new Date().toISOString(),
    alarm_sound: false,
    entry_prompts: false,
    on_this_day: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [migrating, setMigrating] = useState(false);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userSettings = await fetchUserSettings(user.id);
        if (userSettings) {
          setSettings({
            ...settings,
            ...userSettings,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load settings");
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleToggleSetting = async (
    setting: keyof UserSettings,
    value: boolean
  ) => {
    if (!user) return;

    // Update UI immediately
    setSettings({
      ...settings,
      [setting]: value,
    });

    // Then save to backend
    try {
      setSaving(true);
      await updateUserSettings(user.id, { [setting]: value });
    } catch (e) {
      // Revert the UI change if there was an error
      setSettings({
        ...settings,
        [setting]: !value,
      });

      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to update setting");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setTempDate(selectedDate);
      const newSettings = {
        ...settings,
        reminder_time: selectedDate.toISOString(),
      };
      setSettings(newSettings);
      saveSettings(newSettings);
    }
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "This feature is coming soon!", [
      { text: "OK" },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to sign out");
      }
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    try {
      setSaving(true);
      await updateUserSettings(user.id, newSettings);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to update settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMigrateImages = async () => {
    if (!user) return;

    Alert.alert(
      "Migrate Images",
      "This will attempt to move any images stored in the database to the cloud storage. This may use data and take some time. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            try {
              setMigrating(true);
              setError(null);

              // First ensure the bucket exists
              await createStorageBucket();

              // Run the migration
              const result = await migrateImagesToStorage(user.id);

              if (result.success) {
                if (result.migrated === 0) {
                  Alert.alert(
                    "Migration Complete",
                    "No images needed migration."
                  );
                } else {
                  Alert.alert(
                    "Migration Complete",
                    `Successfully migrated ${result.migrated} of ${result.total} images.`
                  );
                }
              } else {
                throw new Error(result.error || "Migration failed");
              }
            } catch (e) {
              if (e instanceof Error) {
                setError(e.message);
              } else {
                setError("Failed to migrate images");
              }
              Alert.alert(
                "Migration Failed",
                "There was an error migrating your images. Please try again later."
              );
            } finally {
              setMigrating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F86E7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: "#FFEEEE" }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Reminders Section */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Reminders
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Bell color={colors.primary} size={20} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Daily Reminders
              </Text>
            </View>
            <Switch
              value={settings.daily_reminders}
              onValueChange={(value) =>
                handleToggleSetting("daily_reminders", value)
              }
              trackColor={{ false: "#E1E8F0", true: colors.secondary }}
              thumbColor={settings.daily_reminders ? colors.primary : "#FFFFFF"}
            />
          </View>

          {settings.daily_reminders && (
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingLabelContainer}>
                <Clock color={colors.primary} size={20} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Reminder Time
                </Text>
              </View>
              <Text style={[styles.timeText, { color: colors.primary }]}>
                {formatTime(settings.reminder_time || new Date().toISOString())}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Bell color={colors.primary} size={20} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Alarm Sound
              </Text>
            </View>
            <Switch
              value={settings.alarm_sound}
              onValueChange={(value) =>
                handleToggleSetting("alarm_sound", value)
              }
              trackColor={{ false: "#E1E8F0", true: colors.secondary }}
              thumbColor={settings.alarm_sound ? colors.primary : "#FFFFFF"}
              disabled={!settings.daily_reminders}
            />
          </View>
        </View>

        {/* Writing Features Section */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Writing Features
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Share color={colors.primary} size={20} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Diary Entry Prompts
              </Text>
            </View>
            <Switch
              value={settings.entry_prompts}
              onValueChange={(value) =>
                handleToggleSetting("entry_prompts", value)
              }
              trackColor={{ false: "#E1E8F0", true: colors.secondary }}
              thumbColor={settings.entry_prompts ? colors.primary : "#FFFFFF"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Calendar color={colors.primary} size={20} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                On This Day Memories
              </Text>
            </View>
            <Switch
              value={settings.on_this_day}
              onValueChange={(value) =>
                handleToggleSetting("on_this_day", value)
              }
              trackColor={{ false: "#E1E8F0", true: colors.secondary }}
              thumbColor={settings.on_this_day ? colors.primary : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.secondary + "40" },
            ]}
            onPress={handleExportData}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Export All Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.secondary + "40" },
            ]}
            onPress={handleMigrateImages}
            disabled={migrating}
          >
            <View style={styles.actionButtonContent}>
              <Database color={colors.primary} size={20} />
              <Text
                className="ml-2"
                style={[styles.actionButtonText, { color: colors.text }]}
              >
                Optimize Image Storage
              </Text>
            </View>
            {migrating && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.signOutButton,
              { backgroundColor: "#FFF0F0" },
            ]}
            onPress={handleSignOut}
          >
            <LogOut color={colors.error} size={20} />
            <Text style={[styles.signOutButtonText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>DayThink v1.0.0</Text>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={
              settings.reminder_time
                ? new Date(settings.reminder_time)
                : new Date()
            }
            mode="time"
            display="default"
            onChange={handleTimeChange}
            accentColor={colors.primary}
            textColor={colors.text}
          />
        )}
      </ScrollView>

      {saving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator color="#4F86E7" size="small" />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
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
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E8F0",
  },
  sectionTitle: {
    fontFamily: "Afacad",
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontFamily: "Afacad",
    fontSize: 16,
    color: "#444444",
    marginLeft: 12,
  },
  timePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  timeText: {
    fontFamily: "Afacad",
    fontSize: 16,
    color: "#4F86E7",
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E1E8F0",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    fontFamily: "Afacad",
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "#FFF0F0",
    flexDirection: "row",
    justifyContent: "center",
  },
  signOutButtonText: {
    fontFamily: "Afacad",
    fontSize: 16,
    color: "#FF3333",
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    padding: 16,
    alignItems: "center",
  },
  versionText: {
    fontFamily: "Afacad",
    fontSize: 14,
    color: "#888888",
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
  savingContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  savingText: {
    fontFamily: "Afacad",
    color: "white",
    marginLeft: 8,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Settings;
