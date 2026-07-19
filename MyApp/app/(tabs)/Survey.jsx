import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const Survey = () => {
  // ==========================================
  // Form State Management
  // ==========================================
  const [siteName, setSiteName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default priority set to 'Medium'
  const [date, setDate] = useState(new Date()); // Holds selected date
  const [showDatePicker, setShowDatePicker] = useState(false); // Controls visibility of native datepicker modal
  const [errors, setErrors] = useState({}); // Stores validation errors for required fields

  // ==========================================
  // Helper functions
  // ==========================================
  // formatDate: Converts Date object to a readable string (e.g. July 18, 2026)
  const formatDate = (dateVal) => {
    return dateVal.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // onChangeDate: Handles picker callback and saves selected date value
  const onChangeDate = (event, selectedDate) => {
    // Hide picker for Android. Keep for iOS as it renders inline/different layout.
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // handleValidateAndSubmit: Runs client-side validation and alerts survey details
  const handleValidateAndSubmit = () => {
    const newErrors = {};

    // Validate Required Fields
    if (!siteName.trim()) {
      newErrors.siteName = "Site Name is required";
    }
    if (!clientName.trim()) {
      newErrors.clientName = "Client Name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);

    // If there are errors, stop submission and prompt user
    if (Object.keys(newErrors).length > 0) {
      Alert.alert(
        "Required Fields Missing",
        "Please fill in all the required fields before submitting the survey."
      );
      return;
    }

    // Success Submission Alert
    Alert.alert(
      "Survey Submitted Successfully!",
      `Details:\n\n• Site: ${siteName}\n• Client: ${clientName}\n• Priority: ${priority}\n• Date: ${formatDate(date)}\n• Description: ${description}`,
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form input values
            setSiteName('');
            setClientName('');
            setDescription('');
            setPriority('Medium');
            setDate(new Date());
            setErrors({});
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0a940aff" />
      
      {/* ==========================================
          1. Custom Header Component
          Displays screen title corresponding to Module 2 assignment requirements.
          ========================================== */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Module 2</Text>
        <Text style={styles.headerTitle}>Create New Survey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" >
        
        {/* ==========================================
            2. Site Name Input Field
            Standard styled text input. Displays red warning border on validation error.
            ========================================== */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Site Name <Text style={styles.required}>*</Text></Text>
          <View style={[
            styles.inputWrapper,
            errors.siteName && styles.inputWrapperError
          ]}>
            <MaterialIcons name="business" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter site location name"
              value={siteName}
              onChangeText={(val) => {
                setSiteName(val);
                if (errors.siteName) setErrors(prev => ({ ...prev, siteName: null }));
              }}
            />
          </View>
          {errors.siteName && <Text style={styles.errorText}>{errors.siteName}</Text>}
        </View>

        {/* ==========================================
            3. Client Name Input Field
            Standard text input tracking the client identity.
            ========================================== */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Client Name <Text style={styles.required}>*</Text></Text>
          <View style={[
            styles.inputWrapper,
            errors.clientName && styles.inputWrapperError
          ]}>
            <MaterialIcons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter client company/name"
              value={clientName}
              onChangeText={(val) => {
                setClientName(val);
                if (errors.clientName) setErrors(prev => ({ ...prev, clientName: null }));
              }}
            />
          </View>
          {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
        </View>

        {/* ==========================================
            4. Priority Selector component
            Three buttons matching High (Red), Medium (Yellow), Low (Green) priority tiers.
            ========================================== */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {/* Low Priority Badge Select */}
            <TouchableOpacity 
              style={[
                styles.priorityBtn,
                priority === 'Low' && styles.priorityBtnLowSelected
              ]}
              onPress={() => setPriority('Low')}
            >
              <Text style={[
                styles.priorityBtnText,
                priority === 'Low' && styles.priorityBtnTextSelected
              ]}>Low</Text>
            </TouchableOpacity>

            {/* Medium Priority Badge Select */}
            <TouchableOpacity 
              style={[
                styles.priorityBtn,
                priority === 'Medium' && styles.priorityBtnMediumSelected
              ]}
              onPress={() => setPriority('Medium')}
            >
              <Text style={[
                styles.priorityBtnText,
                priority === 'Medium' && styles.priorityBtnTextSelected
              ]}>Medium</Text>
            </TouchableOpacity>

            {/* High Priority Badge Select */}
            <TouchableOpacity 
              style={[
                styles.priorityBtn,
                priority === 'High' && styles.priorityBtnHighSelected
              ]}
              onPress={() => setPriority('High')}
            >
              <Text style={[
                styles.priorityBtnText,
                priority === 'High' && styles.priorityBtnTextSelected
              ]}>High</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==========================================
            5. Date Selector Component
            Button wrapper that formats date & opens native DatePicker dialog on press.
            ========================================== */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Survey Date</Text>
          <TouchableOpacity 
            style={styles.datePickerTrigger}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.datePickerTriggerLeft}>
              <MaterialIcons name="event" size={20} color="#0a7ea4" style={styles.inputIcon} />
              <Text style={styles.dateValueText}>{formatDate(date)}</Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
          </TouchableOpacity>

          {/* DateTimePicker Overlay */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>

        {/* ==========================================
            6. Description Input Field
            Multiline input for detailed site notes/observations.
            ========================================== */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description / Notes <Text style={styles.required}>*</Text></Text>
          <View style={[
            styles.inputWrapper,
            styles.textareaWrapper,
            errors.description && styles.inputWrapperError
          ]}>
            <TextInput
              style={styles.textarea}
              placeholder="Enter survey description and inspector notes here..."
              value={description}
              onChangeText={(val) => {
                setDescription(val);
                if (errors.description) setErrors(prev => ({ ...prev, description: null }));
              }}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* ==========================================
            7. Form Submit Button Component
            ========================================== */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleValidateAndSubmit}
          activeOpacity={0.9}
        >
          <MaterialIcons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Submit Survey Details</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// ==========================================
// Stylesheet configuration
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerSubtitle: {
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBtnLowSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  priorityBtnMediumSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  priorityBtnHighSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  priorityBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  priorityBtnTextSelected: {
    color: '#ffffff',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    height: 48,
  },
  datePickerTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValueText: {
    fontSize: 14,
    color: '#1e293b',
  },
  textareaWrapper: {
    height: 100,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  textarea: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Survey;