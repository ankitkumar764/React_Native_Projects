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
  Image,
} from 'react-native';

// Import DateTimePicker for choosing survey dates
// Docs: https://github.com/react-native-datetimepicker/datetimepicker
import DateTimePicker from '@react-native-community/datetimepicker';

// Import MaterialIcons for polished UI controls and feedback badges
import { MaterialIcons } from '@expo/vector-icons';

// Import useSurvey hook to read and write from global survey draft context
import { useSurvey } from '../../context/SurveyContext';

export default function SurveyScreen() {
  // ==========================================
  // 1. GLOBAL STATE & LOCAL UI STATE
  // ==========================================
  
  // Consume shared survey context to retrieve and edit draft details
  const { surveyData, updateSurveyData, resetSurveyData } = useSurvey();

  // State to manage toggle between Edit mode (false) and Preview mode (true)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // State to control visibility of date picker overlay
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State to hold local validation errors
  const [errors, setErrors] = useState({});

  // ==========================================
  // 2. HELPER UTILITIES
  // ==========================================
  
  /**
   * formatDate
   * Converts a Javascript Date object into a readable text format.
   */
  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    const dateObj = new Date(dateVal);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * handleDateChange
   * Triggers when user selects a date from the date picker overlay.
   */
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS (inline render)
    if (selectedDate) {
      updateSurveyData({ date: selectedDate });
    }
  };

  /**
   * getPriorityStyle
   * Dynamically assigns appropriate styling colors for priority tags.
   */
  const getPriorityStyle = (priorityVal) => {
    switch (priorityVal) {
      case 'High':
        return { bg: '#fee2e2', text: '#ef4444', border: '#fca5a5' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#d97706', border: '#fde047' };
      case 'Low':
      default:
        return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    }
  };

  // ==========================================
  // 3. VALIDATION & SUBMISSION WORKFLOW
  // ==========================================

  /**
   * handlePreviewValidation
   * Validates required inputs before allowing user to enter Preview mode.
   */
  const handlePreviewValidation = () => {
    const newErrors = {};

    if (!surveyData.siteName.trim()) {
      newErrors.siteName = "Site Name is required";
    }
    if (!surveyData.clientName.trim()) {
      newErrors.clientName = "Client Name is required";
    }
    if (!surveyData.description.trim()) {
      newErrors.description = "Notes / Description is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert(
        "Validation Failed",
        "Please fill in all the required fields (marked with *) before previewing."
      );
      return;
    }

    // Validation passed! Enter preview screen mode
    setIsPreviewMode(true);
  };

  /**
   * handleFinalSubmit
   * Finalizes the survey and resets all drafts across modules.
   */
  const handleFinalSubmit = () => {
    // Format full details summary
    const formattedDate = formatDate(surveyData.date);
    const hasPhoto = surveyData.photo ? "Attached" : "Not Attached";
    const hasLocation = surveyData.location ? "Linked" : "Not Linked";
    const hasContact = surveyData.contact ? surveyData.contact.name : "None";

    Alert.alert(
      "Survey Submitted Successfully!",
      `Receipt Details:\n\n• Site: ${surveyData.siteName}\n• Client: ${surveyData.clientName}\n• Date: ${formattedDate}\n• Priority: ${surveyData.priority}\n• Contact: ${hasContact}\n• Location: ${hasLocation}\n• Photo: ${hasPhoto}\n\nThank you! The draft has been finalized and cleared.`,
      [
        {
          text: "OK",
          onPress: () => {
            // Wipe the global draft state
            resetSurveyData();
            // Clear any lingering error badges
            setErrors({});
            // Navigate back to the clean edit form layout
            setIsPreviewMode(false);
          }
        }
      ]
    );
  };

  // ==========================================
  // 4. SCREEN RENDERING LAYOUTS
  // ==========================================

  // -------------------------------------------------------------
  // VIEW A: SURVEY PREVIEW MODE (Reviewing completed details)
  // -------------------------------------------------------------
  if (isPreviewMode) {
    const priorityColors = getPriorityStyle(surveyData.priority);
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Module 7</Text>
          <Text style={styles.headerTitle}>Survey Preview</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Notice Banner */}
          <View style={styles.noticeBanner}>
            <MaterialIcons name="info" size={20} color="#0a7ea4" />
            <Text style={styles.noticeText}>
              Please verify all details and attached data before submitting to server.
            </Text>
          </View>

          {/* Card 1: Site Details */}
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <MaterialIcons name="business" size={20} color="#0a7ea4" />
              <Text style={styles.previewCardTitle}>Site & Client Details</Text>
            </View>
            
            <View style={styles.previewDataGrid}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Site Name</Text>
                <Text style={styles.previewValueBold}>{surveyData.siteName}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Client Name</Text>
                <Text style={styles.previewValue}>{surveyData.clientName}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Inspection Date</Text>
                <Text style={styles.previewValue}>{formatDate(surveyData.date)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Priority Level</Text>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg, borderColor: priorityColors.border }]}>
                  <Text style={[styles.priorityBadgeText, { color: priorityColors.text }]}>
                    {surveyData.priority}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card 2: Attached Contact Details */}
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <MaterialIcons name="contacts" size={20} color="#0a7ea4" />
              <Text style={styles.previewCardTitle}>Linked Surveyor Contact</Text>
            </View>
            
            {surveyData.contact ? (
              <View style={styles.linkedContactWrapper}>
                <View style={styles.linkedContactAvatar}>
                  <Text style={styles.linkedContactAvatarText}>
                    {surveyData.contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.linkedContactDetails}>
                  <Text style={styles.linkedContactName}>{surveyData.contact.name}</Text>
                  <Text style={styles.linkedContactPhone}>{surveyData.contact.phoneNumber}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.missingDataBox}>
                <MaterialIcons name="error-outline" size={22} color="#94a3b8" />
                <Text style={styles.missingDataText}>No surveyor contact linked to draft.</Text>
              </View>
            )}
          </View>

          {/* Card 3: GPS Location Coordinates */}
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <MaterialIcons name="location-on" size={20} color="#0a7ea4" />
              <Text style={styles.previewCardTitle}>Linked GPS Coordinates</Text>
            </View>
            
            {surveyData.location ? (
              <View style={styles.linkedLocationWrapper}>
                <View style={styles.locationDataRow}>
                  <Text style={styles.locationDataLabel}>Latitude</Text>
                  <Text style={styles.locationDataValue}>
                    {surveyData.location.coords.latitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.locationDataRow}>
                  <Text style={styles.locationDataLabel}>Longitude</Text>
                  <Text style={styles.locationDataValue}>
                    {surveyData.location.coords.longitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.locationDataRow}>
                  <Text style={styles.locationDataLabel}>Accuracy</Text>
                  <Text style={styles.locationDataValue}>
                    ± {surveyData.location.coords.accuracy ? surveyData.location.coords.accuracy.toFixed(1) : '0.0'} m
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.missingDataBox}>
                <MaterialIcons name="gps-off" size={22} color="#94a3b8" />
                <Text style={styles.missingDataText}>No GPS coordinates linked to draft.</Text>
              </View>
            )}
          </View>

          {/* Card 4: Attached Camera Photograph */}
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <MaterialIcons name="photo-camera" size={20} color="#0a7ea4" />
              <Text style={styles.previewCardTitle}>Attached Site Photo</Text>
            </View>
            
            {surveyData.photo ? (
              <View style={styles.attachedImageContainer}>
                <Image source={{ uri: surveyData.photo.uri }} style={styles.attachedImagePreview} />
                <View style={styles.imageTimestampOverlay}>
                  <Text style={styles.imageTimestampText}>
                    Captured: {new Date(surveyData.photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.missingDataBox}>
                <MaterialIcons name="no-photography" size={22} color="#94a3b8" />
                <Text style={styles.missingDataText}>No photograph attached to draft.</Text>
              </View>
            )}
          </View>

          {/* Card 5: Description & Inspector Notes */}
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <MaterialIcons name="edit-document" size={20} color="#0a7ea4" />
              <Text style={styles.previewCardTitle}>Inspector Notes</Text>
            </View>
            <View style={styles.notesPreviewWrapper}>
              <Text style={styles.notesPreviewText}>
                {surveyData.description || 'No notes provided.'}
              </Text>
            </View>
          </View>

          {/* Bottom Actions Bar */}
          <View style={styles.actionsBar}>
            {/* Edit Button */}
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsPreviewMode(false)}>
              <MaterialIcons name="edit" size={18} color="#0a7ea4" style={styles.btnIcon} />
              <Text style={styles.editBtnText}>Edit Survey</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitFinalBtn} onPress={handleFinalSubmit}>
              <MaterialIcons name="check-circle" size={18} color="#ffffff" style={styles.btnIcon} />
              <Text style={styles.submitFinalBtnText}>Submit Survey</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerSpacing} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: SURVEY FORM EDIT MODE (Editing / Drafting Details)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Module 2 & 7</Text>
        <Text style={styles.headerTitle}>Create New Survey</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Site Name Form Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Site Name <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, errors.siteName && styles.inputWrapperError]}>
            <MaterialIcons name="business" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter site location name"
              placeholderTextColor="#94a3b8"
              value={surveyData.siteName}
              onChangeText={(val) => {
                updateSurveyData({ siteName: val });
                if (errors.siteName) setErrors(prev => ({ ...prev, siteName: null }));
              }}
            />
          </View>
          {errors.siteName && <Text style={styles.errorText}>{errors.siteName}</Text>}
        </View>

        {/* Client Name Form Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Client Name <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, errors.clientName && styles.inputWrapperError]}>
            <MaterialIcons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter client company/name"
              placeholderTextColor="#94a3b8"
              value={surveyData.clientName}
              onChangeText={(val) => {
                updateSurveyData({ clientName: val });
                if (errors.clientName) setErrors(prev => ({ ...prev, clientName: null }));
              }}
            />
          </View>
          {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
        </View>

        {/* Priority Selector Component */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {/* Low Priority Selector */}
            <TouchableOpacity 
              style={[styles.priorityBtn, surveyData.priority === 'Low' && styles.priorityBtnLowSelected]}
              onPress={() => updateSurveyData({ priority: 'Low' })}
            >
              <Text style={[styles.priorityBtnText, surveyData.priority === 'Low' && styles.priorityBtnTextSelected]}>Low</Text>
            </TouchableOpacity>

            {/* Medium Priority Selector */}
            <TouchableOpacity 
              style={[styles.priorityBtn, surveyData.priority === 'Medium' && styles.priorityBtnMediumSelected]}
              onPress={() => updateSurveyData({ priority: 'Medium' })}
            >
              <Text style={[styles.priorityBtnText, surveyData.priority === 'Medium' && styles.priorityBtnTextSelected]}>Medium</Text>
            </TouchableOpacity>

            {/* High Priority Selector */}
            <TouchableOpacity 
              style={[styles.priorityBtn, surveyData.priority === 'High' && styles.priorityBtnHighSelected]}
              onPress={() => updateSurveyData({ priority: 'High' })}
            >
              <Text style={[styles.priorityBtnText, surveyData.priority === 'High' && styles.priorityBtnTextSelected]}>High</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection Trigger */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Survey Date</Text>
          <TouchableOpacity 
            style={styles.datePickerTrigger}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.datePickerTriggerLeft}>
              <MaterialIcons name="event" size={20} color="#0a7ea4" style={styles.inputIcon} />
              <Text style={styles.dateValueText}>{formatDate(surveyData.date)}</Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={surveyData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Attachments & Context Linking Summary panel */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Linked Survey Assets (Context Link)</Text>
          <View style={styles.assetsCard}>
            
            {/* Asset Row 1: GPS Location status */}
            <View style={styles.assetRow}>
              <View style={styles.assetLabelCol}>
                <MaterialIcons 
                  name={surveyData.location ? "gps-fixed" : "gps-off"} 
                  size={18} 
                  color={surveyData.location ? "#16a34a" : "#94a3b8"} 
                  style={styles.assetIcon}
                />
                <Text style={styles.assetLabel}>GPS Location</Text>
              </View>
              {surveyData.location ? (
                <View style={[styles.attachedBadge, styles.attachedBadgeSuccess]}>
                  <Text style={styles.attachedBadgeTextSuccess}>Linked</Text>
                </View>
              ) : (
                <View style={[styles.attachedBadge, styles.attachedBadgeMissing]}>
                  <Text style={styles.attachedBadgeTextMissing}>Go to Location tab</Text>
                </View>
              )}
            </View>

            {/* Asset Row 2: Camera Photo status */}
            <View style={styles.assetRow}>
              <View style={styles.assetLabelCol}>
                <MaterialIcons 
                  name={surveyData.photo ? "photo-camera" : "no-photography"} 
                  size={18} 
                  color={surveyData.photo ? "#16a34a" : "#94a3b8"} 
                  style={styles.assetIcon}
                />
                <Text style={styles.assetLabel}>Site Photograph</Text>
              </View>
              {surveyData.photo ? (
                <View style={styles.imageBadgeWrapper}>
                  <Image source={{ uri: surveyData.photo.uri }} style={styles.assetThumbnail} />
                  <View style={[styles.attachedBadge, styles.attachedBadgeSuccess]}>
                    <Text style={styles.attachedBadgeTextSuccess}>Linked</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.attachedBadge, styles.attachedBadgeMissing]}>
                  <Text style={styles.attachedBadgeTextMissing}>Go to Camera tab</Text>
                </View>
              )}
            </View>

            {/* Asset Row 3: Contact details status */}
            <View style={[styles.assetRow, styles.lastAssetRow]}>
              <View style={styles.assetLabelCol}>
                <MaterialIcons 
                  name={surveyData.contact ? "person" : "person-outline"} 
                  size={18} 
                  color={surveyData.contact ? "#16a34a" : "#94a3b8"} 
                  style={styles.assetIcon}
                />
                <Text style={styles.assetLabel}>Surveyor Contact</Text>
              </View>
              {surveyData.contact ? (
                <View style={[styles.attachedBadge, styles.attachedBadgeSuccess]}>
                  <Text style={styles.attachedBadgeTextSuccess}>Linked</Text>
                </View>
              ) : (
                <View style={[styles.attachedBadge, styles.attachedBadgeMissing]}>
                  <Text style={styles.attachedBadgeTextMissing}>Go to Contacts tab</Text>
                </View>
              )}
            </View>

          </View>
          <Text style={styles.tipsText}>
            💡 Note: Attachments sync automatically as you fetch location, capture photos, or link contacts in their respective screens.
          </Text>
        </View>

        {/* Description / Inspector Notes Form Field */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description / Notes <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, styles.textareaWrapper, errors.description && styles.inputWrapperError]}>
            <TextInput
              style={styles.textarea}
              placeholder="Enter survey description and inspector notes here..."
              placeholderTextColor="#94a3b8"
              value={surveyData.description}
              onChangeText={(val) => {
                updateSurveyData({ description: val });
                if (errors.description) setErrors(prev => ({ ...prev, description: null }));
              }}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Form Validation and Preview Trigger Button */}
        <TouchableOpacity 
          style={styles.previewTriggerBtn}
          onPress={handlePreviewValidation}
          activeOpacity={0.9}
        >
          <MaterialIcons name="visibility" size={20} color="#fff" />
          <Text style={styles.previewTriggerText}>Preview Survey Details</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 5. STYLING SYSTEM
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light slate background
  },
  header: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 20,
    paddingBottom: 20,
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
    padding: 16,
  },
  formGroup: {
    marginBottom: 18,
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
  assetsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastAssetRow: {
    borderBottomWidth: 0,
  },
  assetLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    marginRight: 8,
  },
  assetLabel: {
    fontSize: 13.5,
    color: '#475569',
    fontWeight: '500',
  },
  attachedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attachedBadgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  attachedBadgeMissing: {
    backgroundColor: '#f1f5f9',
  },
  attachedBadgeTextSuccess: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  attachedBadgeTextMissing: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  imageBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetThumbnail: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  tipsText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  previewTriggerBtn: {
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
  previewTriggerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Preview specific styles
  noticeBanner: {
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    color: '#0369a1',
    fontWeight: '600',
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  previewCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  previewDataGrid: {
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 13.5,
    color: '#1e293b',
    fontWeight: '600',
  },
  previewValueBold: {
    fontSize: 14.5,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  linkedContactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkedContactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkedContactAvatarText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkedContactDetails: {
    flex: 1,
  },
  linkedContactName: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  linkedContactPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 1,
  },
  missingDataBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  missingDataText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  linkedLocationWrapper: {
    gap: 8,
  },
  locationDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationDataLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  locationDataValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1e293b',
  },
  attachedImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  attachedImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageTimestampOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageTimestampText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '600',
  },
  notesPreviewWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  notesPreviewText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  editBtnText: {
    color: '#475569',
    fontSize: 14.5,
    fontWeight: 'bold',
  },
  submitFinalBtn: {
    flex: 1.5,
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a', // Solid green for submission success trigger
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  submitFinalBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: 'bold',
  },
  btnIcon: {
    marginRight: 6,
  },
  footerSpacing: {
    height: 40,
  },
});