import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
// Import expo-location for accessing the device's GPS hardware
import * as Location from 'expo-location';
// Import expo-clipboard for copying coordinates to the device's clipboard
import * as Clipboard from 'expo-clipboard';
// Import MaterialIcons for visual feedback and clean buttons
import { MaterialIcons } from '@expo/vector-icons';

export default function LocationScreen() {
  // =======================================================
  // 1. State Hooks (Variables to store screen data)
  // =======================================================
  
  // Stores the status of the GPS location permission (null: checking, false: denied, true: granted)
  const [hasPermission, setHasPermission] = useState(null);
  
  // Stores the actual GPS coordinate data once we retrieve it
  const [locationData, setLocationData] = useState(null);
  
  // A true/false toggle to show a loading screen while we fetch coordinates
  const [isLoading, setIsLoading] = useState(false);

  // =======================================================
  // 2. Location & Permission Asynchronous Functions
  // =======================================================

  /**
   * checkPermissionsAndGetLocation
   * Checks if the app already has permission to access GPS.
   * If yes, it fetches the coordinates.
   * If no, it updates the permission state so we can prompt the user.
   */
  const checkPermissionsAndGetLocation = async () => {
    try {
      setIsLoading(true);

      // Check existing permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      // If permission is already granted, update state and directly fetch location
      if (existingStatus === 'granted') {
        setHasPermission(true);
        await fetchCoordinates();
      } else {
        // Otherwise, set permission status to false (user needs to grant it)
        setHasPermission(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during permission check:", error);
      Alert.alert("Permission Error", "Could not check location permission status.");
      setIsLoading(false);
    }
  };

  /**
   * requestLocationPermission
   * Triggers the native system prompt requesting access to device GPS.
   */
  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      // Ask user for permission to access GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        // Permission approved! Retrieve coordinates immediately
        await fetchCoordinates();
      } else {
        setHasPermission(false);
        Alert.alert(
          "Permission Denied",
          "Location access is required to view your current coordinates. Please enable it in your device settings."
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      Alert.alert("Request Failed", "Failed to prompt for location access permission.");
      setIsLoading(false);
    }
  };

  /**
   * fetchCoordinates
   * Connects to GPS hardware and retrieves latitude, longitude, and accuracy.
   */
  const fetchCoordinates = async () => {
    try {
      setIsLoading(true);
      
      // Request current location from GPS with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Save retrieved location coordinates inside state variable
      setLocationData(location);
    } catch (error) {
      console.error("Error fetching GPS location:", error);
      Alert.alert(
        "Location Fetch Failed",
        "Could not retrieve GPS coordinates. Please ensure your device GPS is turned ON."
      );
    } finally {
      // Hide loading spinner once request finishes
      setIsLoading(false);
    }
  };

  // =======================================================
  // 3. Lifecycle Hook (Runs code automatically when screen opens)
  // =======================================================
  useEffect(() => {
    checkPermissionsAndGetLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // 4. Utility Actions (Copying to clipboard)
  // =======================================================

  /**
   * copyToClipboard
   * Formats the coordinates cleanly and saves them to clipboard.
   * Displays a Native Alert when completed successfully.
   */
  const copyToClipboard = async () => {
    if (!locationData) {
      Alert.alert("No Location", "Please fetch location coordinates first.");
      return;
    }

    const { latitude, longitude, accuracy } = locationData.coords;
    
    // Format coordinates as a text string
    const textToCopy = `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}, Accuracy: ${accuracy ? accuracy.toFixed(1) : '0.0'} meters`;

    try {
      // Save string to Clipboard
      await Clipboard.setStringAsync(textToCopy);
      
      // Success Alert After Copy
      Alert.alert(
        "Copied Successfully!",
        "GPS coordinates have been saved to your clipboard.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to copy text:", error);
      Alert.alert("Copy Failed", "An error occurred while copying to clipboard.");
    }
  };

  // =======================================================
  // 5. Layout Rendering (Screens depending on loading/perm states)
  // =======================================================

  // A. Loading Screen - Shown during permission checks or initial GPS lookups
  if (isLoading && !locationData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Accessing GPS location...</Text>
      </SafeAreaView>
    );
  }

  // B. Permission Request Screen - Shown if permission is not granted
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Module 4</Text>
          <Text style={styles.headerTitle}>Location Tracking</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.permissionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="location-off" size={44} color="#0a7ea4" />
            </View>
            <Text style={styles.cardTitle}>Location Access Required</Text>
            <Text style={styles.cardDescription}>
              {"We need permission to access your device's GPS to find, record, and format coordinates for your surveys."}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestLocationPermission}>
              <MaterialIcons name="gps-fixed" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Grant Location Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // C. Main Screen - Displays current coordinates and control buttons
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
      
      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Module 4</Text>
        <Text style={styles.headerTitle}>Location Tracker</Text>
      </View>

      <View style={styles.content}>
        {/* GPS Data Display Card */}
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="explore" size={24} color="#0a7ea4" />
            <Text style={styles.cardHeaderTitle}>Current GPS Coordinates</Text>
          </View>

          {/* Render spinner inside card if updating coordinates, else render GPS data */}
          {isLoading ? (
            <View style={styles.cardLoadingContainer}>
              <ActivityIndicator size="small" color="#0a7ea4" />
              <Text style={styles.cardLoadingText}>Updating coordinates...</Text>
            </View>
          ) : locationData ? (
            <View style={styles.coordinatesWrapper}>
              {/* Latitude display row */}
              <View style={styles.dataRow}>
                <View style={styles.dataLabelWrapper}>
                  <MaterialIcons name="navigation" size={18} color="#64748b" style={styles.rowIcon} />
                  <Text style={styles.dataLabel}>Latitude</Text>
                </View>
                <Text style={styles.dataValue}>
                  {locationData.coords.latitude.toFixed(6)}°
                </Text>
              </View>

              {/* Longitude display row */}
              <View style={styles.dataRow}>
                <View style={styles.dataLabelWrapper}>
                  <MaterialIcons name="navigation" size={18} color="#64748b" style={[styles.rowIcon, styles.rotateIcon]} />
                  <Text style={styles.dataLabel}>Longitude</Text>
                </View>
                <Text style={styles.dataValue}>
                  {locationData.coords.longitude.toFixed(6)}°
                </Text>
              </View>

              {/* Accuracy display row */}
              <View style={[styles.dataRow, styles.lastDataRow]}>
                <View style={styles.dataLabelWrapper}>
                  <MaterialIcons name="gps-fixed" size={18} color="#64748b" style={styles.rowIcon} />
                  <Text style={styles.dataLabel}>Accuracy</Text>
                </View>
                <Text style={styles.dataValue}>
                  ± {locationData.coords.accuracy ? locationData.coords.accuracy.toFixed(1) : '0.0'} meters
                </Text>
              </View>
            </View>
          ) : (
            // Fallback text if no location is retrieved yet
            <Text style={styles.placeholderText}>Click refresh to load current location</Text>
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.buttonGroup}>
          {/* 1. Refresh GPS Coordinates button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]} 
            onPress={fetchCoordinates}
            disabled={isLoading}
          >
            <MaterialIcons name="refresh" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Refresh Location</Text>
          </TouchableOpacity>

          {/* 2. Copy GPS coordinates to Clipboard button */}
          <TouchableOpacity 
            style={[styles.actionButton, styles.copyButton]} 
            onPress={copyToClipboard}
            disabled={isLoading || !locationData}
          >
            <MaterialIcons name="content-copy" size={20} color="#0a7ea4" style={styles.buttonIcon} />
            <Text style={styles.copyButtonText}>Copy Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =======================================================
// 6. UI Stylesheet Configuration
// =======================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light slate blue/gray background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    width: '100%',
    maxWidth: 360,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe', // Pale light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 4,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cardLoadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  coordinatesWrapper: {
    marginTop: 5,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastDataRow: {
    borderBottomWidth: 0, // Remove line under last row
    paddingBottom: 4,
  },
  dataLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
  },
  rotateIcon: {
    transform: [{ rotate: '90deg' }], // Rotate navigation arrow to differentiate longitude
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  dataValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 40,
  },
  buttonGroup: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  refreshButton: {
    backgroundColor: '#0a7ea4',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  copyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  copyButtonText: {
    color: '#0a7ea4',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
