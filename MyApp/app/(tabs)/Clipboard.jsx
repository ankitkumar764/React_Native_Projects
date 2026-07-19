import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';

// =========================================================================
// CLIPBOARD EXTENSION FOR EXPO
// =========================================================================
// We import expo-clipboard to access the native device clipboard.
// Docs: https://docs.expo.dev/versions/v54.0.0/sdk/clipboard/
import * as Clipboard from 'expo-clipboard';

// We import MaterialIcons to design beautiful visual buttons and layouts.
import { MaterialIcons } from '@expo/vector-icons';

export default function ClipboardScreen() {
  // =========================================================================
  // 1. STATE CONFIGURATIONS (Variables to store UI values)
  // =========================================================================
  
  // State for the Inspector Notes Text Input
  const [notes, setNotes] = useState('');
  
  // State to display the live system clipboard contents in the UI preview box
  const [clipboardPreview, setClipboardPreview] = useState('');

  // =========================================================================
  // 2. MOCK CONSTANTS (Data templates we can copy)
  // =========================================================================
  const MOCK_SURVEY_ID = 'SRV-2026-9021-METRO';
  const MOCK_CONTACT_NUMBER = '+91 98765 43210';
  const MOCK_LOCATION = 'Latitude: 28.613921, Longitude: 77.209062';

  // =========================================================================
  // 3. CORE CLIPBOARD METHODS (Explaining how Clipboard APIs work)
  // =========================================================================

  /**
   * updateLivePreview
   * Reads text from the native system clipboard using Clipboard.getStringAsync()
   * and updates our local state so the beginner can see changes on screen.
   */
  const updateLivePreview = async () => {
    try {
      // 💡 API Explainer: Clipboard.getStringAsync() requests the text content
      // currently saved on the user's mobile device clipboard.
      const currentText = await Clipboard.getStringAsync();
      setClipboardPreview(currentText);
    } catch (error) {
      console.error("Failed to read system clipboard:", error);
    }
  };

  /**
   * copySurveyId
   * Copies the mock survey ID to the device's clipboard buffer.
   */
  const copySurveyId = async () => {
    try {
      // 💡 API Explainer: Clipboard.setStringAsync(text) overwrites the system
      // clipboard with the specified string parameter.
      await Clipboard.setStringAsync(MOCK_SURVEY_ID);
      
      // Update UI preview box after successful copy
      await updateLivePreview();
      
      Alert.alert("Copied!", "Survey ID successfully saved to clipboard.");
    } catch (error) {
      console.error("Failed to copy Survey ID:", error);
      Alert.alert("Error", "Could not copy Survey ID.");
    }
  };

  /**
   * copyContactNumber
   * Copies the mock phone number to the device's clipboard buffer.
   */
  const copyContactNumber = async () => {
    try {
      await Clipboard.setStringAsync(MOCK_CONTACT_NUMBER);
      await updateLivePreview();
      Alert.alert("Copied!", "Contact number successfully saved to clipboard.");
    } catch (error) {
      console.error("Failed to copy Contact Number:", error);
      Alert.alert("Error", "Could not copy Contact Number.");
    }
  };

  /**
   * copyCurrentLocation
   * Copies the mock coordinates to the device's clipboard buffer.
   */
  const copyCurrentLocation = async () => {
    try {
      await Clipboard.setStringAsync(MOCK_LOCATION);
      await updateLivePreview();
      Alert.alert("Copied!", "Location coordinates successfully saved to clipboard.");
    } catch (error) {
      console.error("Failed to copy Location coordinates:", error);
      Alert.alert("Error", "Could not copy Location coordinates.");
    }
  };

  /**
   * pasteNotes
   * Retrieves text from the system clipboard and appends it to the Notes text field.
   */
  const pasteNotes = async () => {
    try {
      // Get current text content stored in the system clipboard
      const textToPaste = await Clipboard.getStringAsync();
      
      if (!textToPaste) {
        Alert.alert("Paste Warning", "Clipboard is empty! Copy something first.");
        return;
      }

      // Append clipboard content to our Notes. If Notes already has content,
      // we insert a new line before pasting.
      setNotes((prevNotes) => {
        if (prevNotes.trim() === '') {
          return textToPaste;
        } else {
          return `${prevNotes}\n${textToPaste}`;
        }
      });

      Alert.alert("Pasted!", "Clipboard contents added to inspector notes.");
    } catch (error) {
      console.error("Failed to paste notes:", error);
      Alert.alert("Error", "Could not paste from clipboard.");
    }
  };

  /**
   * clearClipboardData
   * Empties the system clipboard data.
   */
  const clearClipboardData = async () => {
    try {
      // 💡 API Explainer: To clear the clipboard, we write an empty string.
      // This wipes any active text so other apps cannot read it (good for privacy).
      await Clipboard.setStringAsync('');
      
      // Update UI preview state to empty
      setClipboardPreview('');
      
      Alert.alert("Cleared!", "System clipboard data has been wiped.");
    } catch (error) {
      console.error("Failed to clear clipboard:", error);
      Alert.alert("Error", "Could not clear clipboard data.");
    }
  };

  // =========================================================================
  // 4. LIFECYCLE HOOKS
  // =========================================================================
  useEffect(() => {
    // Read the clipboard status when the page is first opened
    updateLivePreview();
  }, []);

  // =========================================================================
  // 5. SCREEN RENDER LAYOUT
  // =========================================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
      
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Module 6</Text>
        <Text style={styles.headerTitle}>Clipboard Manager</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* SECTION 1: Tap to Copy Cards */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="content-copy" size={20} color="#0a7ea4" />
          <Text style={styles.sectionTitle}>Tap to Copy Panel</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Press any of the cards below to copy simulated survey data to your system clipboard.
        </Text>

        {/* Card A: Survey ID */}
        <TouchableOpacity style={styles.copyCard} onPress={copySurveyId} activeOpacity={0.7}>
          <View style={styles.cardInfo}>
            <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
              <MaterialIcons name="assignment-ind" size={22} color="#0284c7" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.cardLabel}>Survey ID</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{MOCK_SURVEY_ID}</Text>
            </View>
          </View>
          <View style={styles.copyIndicator}>
            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        {/* Card B: Contact Number */}
        <TouchableOpacity style={styles.copyCard} onPress={copyContactNumber} activeOpacity={0.7}>
          <View style={styles.cardInfo}>
            <View style={[styles.iconWrapper, { backgroundColor: '#faf5ff' }]}>
              <MaterialIcons name="phone" size={22} color="#9333ea" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.cardLabel}>Contact Number</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{MOCK_CONTACT_NUMBER}</Text>
            </View>
          </View>
          <View style={styles.copyIndicator}>
            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        {/* Card C: Current Location */}
        <TouchableOpacity style={styles.copyCard} onPress={copyCurrentLocation} activeOpacity={0.7}>
          <View style={styles.cardInfo}>
            <View style={[styles.iconWrapper, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="pin-drop" size={22} color="#16a34a" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.cardLabel}>Current Location</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{MOCK_LOCATION}</Text>
            </View>
          </View>
          <View style={styles.copyIndicator}>
            <MaterialIcons name="chevron-right" size={22} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        {/* SECTION 2: Clipboard Live Preview */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="visibility" size={20} color="#0a7ea4" />
          <Text style={styles.sectionTitle}>Live Clipboard Preview</Text>
        </View>
        <Text style={styles.sectionDescription}>
          This box displays what is currently stored in your phone's clipboard memory buffer.
        </Text>

        <View style={styles.previewBox}>
          {clipboardPreview ? (
            <Text style={styles.previewText}>{clipboardPreview}</Text>
          ) : (
            <Text style={styles.emptyPreviewText}>[Clipboard is Empty]</Text>
          )}
          <TouchableOpacity style={styles.refreshBadge} onPress={updateLivePreview}>
            <MaterialIcons name="refresh" size={16} color="#0a7ea4" />
            <Text style={styles.refreshBadgeText}>Sync Preview</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: Paste and Notes Input Sandbox */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="edit" size={20} color="#0a7ea4" />
          <Text style={styles.sectionTitle}>Paste & Edit Sandbox</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Type inspector notes here, or press 'Paste Notes' to append current clipboard data at the cursor.
        </Text>

        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Type notes here or paste data..."
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Clipboard Actions Button Toolbar */}
        <View style={styles.actionToolbar}>
          {/* Action A: Paste Notes Button */}
          <TouchableOpacity style={[styles.actionBtn, styles.pasteBtn]} onPress={pasteNotes}>
            <MaterialIcons name="content-paste" size={18} color="#ffffff" style={styles.btnIcon} />
            <Text style={styles.actionBtnText}>Paste Notes</Text>
          </TouchableOpacity>

          {/* Action B: Clear Clipboard Data Button */}
          <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={clearClipboardData}>
            <MaterialIcons name="delete-forever" size={18} color="#ef4444" style={styles.btnIcon} />
            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Clear Clipboard</Text>
          </TouchableOpacity>
        </View>
        
        {/* Utility button to reset input sandbox */}
        {notes.length > 0 && (
          <TouchableOpacity style={styles.clearNotesTrigger} onPress={() => setNotes('')}>
            <MaterialIcons name="clear-all" size={16} color="#64748b" />
            <Text style={styles.clearNotesText}>Reset Notes Input</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================================
// 6. UI STYLESHEET SYSTEM
// =========================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 20,
    paddingBottom: 22,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  copyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  copyIndicator: {
    marginLeft: 8,
  },
  previewBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginBottom: 20,
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 20,
    paddingRight: 90,
  },
  emptyPreviewText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  refreshBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  notesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  notesInput: {
    fontSize: 14,
    color: '#1e293b',
    minHeight: 100,
  },
  actionToolbar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  pasteBtn: {
    backgroundColor: '#0a7ea4',
  },
  clearBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearNotesTrigger: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  clearNotesText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  footerSpacing: {
    height: 36,
  },
});
