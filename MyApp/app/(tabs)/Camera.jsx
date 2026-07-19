import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState(null);

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
    } catch (err) {
      Alert.alert("Permission Error", "Could not request camera permissions.");
      console.error(err);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    setIsCameraReady(false); // Show loading indicator while switching camera modes
  };

  const takePhoto = async () => {
    if (cameraRef.current && isCameraReady && !isCapturing) {
      try {
        setIsCapturing(true);
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.85,
        });
        const captureTime = new Date();
        setPhoto({
          uri: photoData.uri,
          timestamp: captureTime,
        });
      } catch (err) {
        Alert.alert("Capture Failed", "Could not take photo. Please try again.");
        console.error(err);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setIsCameraReady(false); // Reset to show opening camera loader next time
  };

  const handleDelete = () => {
    // Confirmation Alert Before Delete
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to permanently delete this photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPhoto(null);
            setIsCameraReady(false); // Reset camera state for layout loading animation
          },
        },
      ]
    );
  };

  const formatCaptureTime = (dateVal) => {
    if (!dateVal) return '';
    return dateVal.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // 1. Permissions Loading State
  if (!permission) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Checking camera permissions...</Text>
      </SafeAreaView>
    );
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Module 3</Text>
          <Text style={styles.headerTitle}>Camera Scan</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.permissionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="photo-camera" size={44} color="#0a7ea4" />
            </View>
            <Text style={styles.cardTitle}>Camera Access Required</Text>
            <Text style={styles.cardDescription}>
              This application requires access to your camera to take pictures, scan codes, and attach files to your surveys.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRequestPermission}>
              <MaterialIcons name="vpn-key" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Photo Preview Screen (If photo is captured)
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Module 3</Text>
          <Text style={styles.headerTitle}>Preview Image</Text>
        </View>
        <View style={styles.previewContainer}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="contain" />
          </View>
          
          <View style={styles.metadataCard}>
            <View style={styles.timestampRow}>
              <MaterialIcons name="access-time" size={18} color="#64748b" />
              <Text style={styles.timestampLabel}>Captured on:</Text>
            </View>
            <Text style={styles.timestampValue}>{formatCaptureTime(photo.timestamp)}</Text>
          </View>
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.retakeBtn]} onPress={handleRetake}>
              <MaterialIcons name="replay" size={20} color="#1e293b" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 4. Live Camera Screen (Permission is granted and photo is not captured)
  return (
    <SafeAreaView style={styles.cameraScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          ref={cameraRef}
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
        />
        
        {/* Loading Indicator while Opening/Flipping Camera */}
        {!isCameraReady && (
          <View style={styles.cameraLoadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.cameraLoadingText}>Opening Camera...</Text>
          </View>
        )}

        {/* Capturing Loader Overlay */}
        {isCapturing && (
          <View style={styles.cameraLoadingOverlay}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.cameraLoadingText}>Capturing photo...</Text>
          </View>
        )}

        {/* Controls Overlay (Only visible when camera is ready) */}
        {isCameraReady && (
          <View style={styles.overlayContainer}>
            {/* Top controls: Flash option or Facing toggle */}
            <View style={styles.topOverlayControls}>
              <View style={styles.glassHeaderBadge}>
                <Text style={styles.badgeText}>Live View</Text>
              </View>
              <TouchableOpacity style={styles.circularGlassBtn} onPress={toggleFacing}>
                <MaterialIcons name="flip-camera-ios" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Bottom controls: Shutter Button */}
            <View style={styles.bottomOverlayControls}>
              <View style={styles.shutterContainer}>
                <TouchableOpacity 
                  style={styles.shutterOuterCircle} 
                  onPress={takePhoto}
                  disabled={isCapturing}
                >
                  <View style={styles.shutterInnerCircle} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  cameraScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#e0f2fe',
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
  buttonIcon: {
    marginRight: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  metadataCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timestampLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  timestampValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  retakeBtn: {
    backgroundColor: '#ffffff',
  },
  retakeBtnText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  cameraLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cameraLoadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  topOverlayControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassHeaderBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circularGlassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomOverlayControls: {
    alignItems: 'center',
  },
  shutterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});
