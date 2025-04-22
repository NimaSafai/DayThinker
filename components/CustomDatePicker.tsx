import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
} from "react-native";
import * as ReactNativePicker from "@react-native-picker/picker";

interface CustomDatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  open: boolean;
  onClose: () => void;
}

const Picker = ({ selectedValue, onValueChange, style, children }: any) => {
  return (
    <View style={style}>
      {Platform.OS === "web" ? (
        <select
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          style={{ height: 40, width: "100%" }}
        >
          {children.map((child: any) => (
            <option key={child.key} value={child.props.value}>
              {child.props.label}
            </option>
          ))}
        </select>
      ) : (
        <ReactNativePicker.Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={style}
        >
          {children}
        </ReactNativePicker.Picker>
      )}
    </View>
  );
};

Picker.Item = ({
  label,
  value,
  key,
}: {
  label: string;
  value: number | string;
  key: string;
}) => {
  return Platform.OS === "web" ? null : (
    <ReactNativePicker.Picker.Item label={label} value={value} key={key} />
  );
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  date,
  onDateChange,
  mode = "time",
  open,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState(date.getHours());
  const [selectedMinute, setSelectedMinute] = useState(date.getMinutes());
  const [selectedAmPm, setSelectedAmPm] = useState(
    date.getHours() >= 12 ? "PM" : "AM"
  );

  const handleConfirm = () => {
    const newDate = new Date(date);
    let hours = selectedHour;

    // Convert from 12-hour to 24-hour format if needed
    if (selectedAmPm === "PM" && selectedHour < 12) {
      hours = selectedHour + 12;
    } else if (selectedAmPm === "AM" && selectedHour === 12) {
      hours = 0;
    }

    newDate.setHours(hours);
    newDate.setMinutes(selectedMinute);
    onDateChange(newDate);
    onClose();
  };

  // Generate hours for 12-hour format
  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal visible={open} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Time</Text>

          <View style={styles.pickerContainer}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <Picker
                selectedValue={selectedHour % 12 === 0 ? 12 : selectedHour % 12}
                style={styles.picker}
                onValueChange={(itemValue: number) =>
                  setSelectedHour(itemValue)
                }
              >
                {hours.map((hour) => (
                  <Picker.Item
                    key={`hour-${hour}`}
                    label={`${hour}`}
                    value={hour === 12 ? 0 : hour}
                  />
                ))}
              </Picker>
            </View>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <Picker
                selectedValue={selectedMinute}
                style={styles.picker}
                onValueChange={(itemValue: number) =>
                  setSelectedMinute(itemValue)
                }
              >
                {minutes.map((minute) => (
                  <Picker.Item
                    key={`minute-${minute}`}
                    label={minute < 10 ? `0${minute}` : `${minute}`}
                    value={minute}
                  />
                ))}
              </Picker>
            </View>

            {/* AM/PM Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>AM/PM</Text>
              <Picker
                selectedValue={selectedAmPm}
                style={styles.picker}
                onValueChange={(itemValue: string) =>
                  setSelectedAmPm(itemValue)
                }
              >
                <Picker.Item label="AM" value="AM" key="am" />
                <Picker.Item label="PM" value="PM" key="pm" />
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4F86E7",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    marginBottom: 5,
    color: "#666",
  },
  picker: {
    width: "100%",
    height: 120,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#4F86E7",
  },
  confirmButton: {
    backgroundColor: "#4F86E7",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CustomDatePicker;
