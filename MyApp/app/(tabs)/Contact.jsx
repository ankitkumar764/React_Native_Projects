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
  FlatList,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';

// Import expo-contacts for accessing the device's native address book
import * as Contacts from 'expo-contacts';

// Import expo-clipboard to copy the phone numbers to clipboard
import * as Clipboard from 'expo-clipboard';

// Import MaterialIcons for a clean and professional look
import { MaterialIcons } from '@expo/vector-icons';

// Import useSurvey hook to attach contacts to the active survey draft
import { useSurvey } from '../../context/SurveyContext';

export default function ContactScreen() {
  // Access global survey draft updater function
  const { updateSurveyData } = useSurvey();

  // =======================================================
  // 1. STATE CONFIGURATIONS
  // =======================================================
  
  // Tracks permission status (null: checking, false: denied, true: granted)
  const [hasPermission, setHasPermission] = useState(null);
  
  // Main list storing all contact records loaded from the device
  const [contactsList, setContactsList] = useState([]);
  
  // Sub-list storing only the contacts that match the active search filter
  const [filteredContacts, setFilteredContacts] = useState([]);
  
  // The current text string in the search input
  const [searchQuery, setSearchQuery] = useState('');
  
  // Boolean to display spinner during initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  
  // Boolean to manage pull-to-refresh indicator state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // =======================================================
  // 2. CONTACT UTILITIES & HELPERS
  // =======================================================

  /**
   * getInitials
   * Extracts name initials for the custom avatar.
   * If full name is "John Doe", returns "JD".
   * If single name is "John", returns "J".
   * If name is empty, returns "?".
   */
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const trimmedName = name.trim();
    if (!trimmedName) return '?';
    
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length >= 2) {
      const firstInitial = nameParts[0].charAt(0);
      const lastInitial = nameParts[nameParts.length - 1].charAt(0);
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return trimmedName.charAt(0).toUpperCase();
  };

  /**
   * getAvatarColor
   * Deterministically assigns a background color to the placeholder avatar
   * based on the first letter of the contact's name. This ensures a consistent
   * visual identity for each contact while providing a premium, colorful interface.
   */
  const getAvatarColor = (name) => {
    if (!name || typeof name !== 'string') return '#94a3b8'; // Default grey
    const firstLetter = name.trim().charAt(0).toUpperCase();
    
    // Harmony of vibrant and clean colors
    const colors = [
      '#f43f5e', // Rose / Pinkish Red
      '#ec4899', // Magenta Pink
      '#d946ef', // Fuchsia / Purple
      '#a855f7', // Purple
      '#6366f1', // Indigo Blue
      '#3b82f6', // Standard Royal Blue
      '#0ea5e9', // Sky Blue
      '#06b6d4', // Cyan
      '#14b8a6', // Teal
      '#10b981', // Emerald Green
      '#84cc16', // Lime Green
      '#f97316', // Orange
    ];
    
    // Simple hashing based on character code to select color
    const charCode = firstLetter.charCodeAt(0) || 0;
    const index = charCode % colors.length;
    return colors[index];
  };

  /**
   * getPhoneNumber
   * Standardizes fetching the first available phone number from a contact object.
   * Returns null if no phone list exists or is empty.
   */
  const getPhoneNumber = (contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      // Return the primary/first phone number in the list
      return contact.phoneNumbers[0].number;
    }
    return null;
  };

  // =======================================================
  // 3. PERMISSION & RETRIEVAL FUNCTIONS
  // =======================================================

  /**
   * checkPermission
   * Runs silently when the screen loads to check if contacts permission
   * has already been granted by the OS.
   */
  const checkPermission = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        await fetchContacts(true);
      } else {
        setHasPermission(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking contacts permission:", error);
      Alert.alert("Permission Error", "Could not check contacts status.");
      setIsLoading(false);
    }
  };

  /**
   * requestPermission
   * Opens the OS dialog to ask the user for address book permissions.
   * If approved, triggers initial contacts load.
   */
  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        await fetchContacts(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          "Permission Denied",
          "Contacts permission is required to fetch, search, and copy contact details. Please allow contacts access in your device settings."
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      Alert.alert("Request Failed", "Failed to trigger permission prompt.");
      setIsLoading(false);
    }
  };

  /**
   * fetchContacts
   * Asynchronously loads contacts list from the device.
   * Sorts the records alphabetically by first name.
   */
  const fetchContacts = async (shouldShowSpinner = true) => {
    try {
      if (shouldShowSpinner) {
        setIsLoading(true);
      }
      
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
        ],
      });

      if (data.length > 0) {
        // Sort contacts alphabetically A-Z by name
        const sortedContacts = data.sort((a, b) => {
          const nameA = a.name ? a.name.toLowerCase() : '';
          const nameB = b.name ? b.name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });
        
        setContactsList(sortedContacts);
        
        // Feed the sorted list directly into search filter to update UI view
        filterContactsList(sortedContacts, searchQuery);
      } else {
        setContactsList([]);
        setFilteredContacts([]);
      }
    } catch (error) {
      console.error("Error loading contacts from device:", error);
      Alert.alert("Fetch Failed", "Could not load contacts. Ensure permissions are set.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // =======================================================
  // 4. LIFECYCLE HOOK
  // =======================================================
  useEffect(() => {
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================================================
  // 5. SEARCH & CLIPBOARD COPY OPERATIONS
  // =======================================================

  /**
   * filterContactsList
   * Filters the contacts using a search query.
   * Matches query against name OR any available phone number.
   */
  const filterContactsList = (list, query) => {
    if (!query || !query.trim()) {
      setFilteredContacts(list);
      return;
    }
    
    const formattedQuery = query.toLowerCase().trim();
    
    const filtered = list.filter((contact) => {
      // Match 1: Checks if query is found within contact name
      const nameMatch = contact.name && contact.name.toLowerCase().includes(formattedQuery);
      
      // Match 2: Checks if query is found within phone numbers (removing space & format differences)
      const phoneMatch = contact.phoneNumbers && contact.phoneNumbers.some(phone => 
        phone.number && phone.number.replace(/[^0-9+]/g, '').includes(formattedQuery.replace(/[^0-9+]/g, ''))
      );
      
      return nameMatch || phoneMatch;
    });
    
    setFilteredContacts(filtered);
  };

  /**
   * handleSearchChange
   * Updates state input and filters contacts list reactively as the user types.
   */
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    filterContactsList(contactsList, text);
  };

  /**
   * copyPhoneNumberToClipboard
   * Copies the contact's phone number to device clipboard.
   * Emits tactile alert feedback upon success.
   */
  const copyPhoneNumberToClipboard = async (contact) => {
    const number = getPhoneNumber(contact);
    if (!number) {
      Alert.alert("Copy Denied", "No phone number exists to copy.");
      return;
    }

    try {
      await Clipboard.setStringAsync(number);
      Alert.alert(
        "Copied!",
        `Phone number for "${contact.name}" copied to clipboard: ${number}`,
        [{ text: "OK" }],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      Alert.alert("Copy Failed", "An error occurred while copying.");
    }
  };

  /**
   * handleContactPress
   * Triggers when a user clicks on a contact card.
   * Offers options to copy their number or link them as the surveyor contact for the draft survey.
   */
  const handleContactPress = (contact) => {
    const number = getPhoneNumber(contact);
    
    // Construct actions sheet options
    const actions = [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Attach to Survey Draft",
        onPress: () => {
          updateSurveyData({
            contact: {
              name: contact.name || 'Unnamed Contact',
              phoneNumber: number || 'No Number'
            }
          });
          Alert.alert("Attached!", `"${contact.name || 'Contact'}" has been linked to your survey draft.`);
        }
      }
    ];

    // If a phone number is available, allow direct copying from this prompt
    if (number) {
      actions.push({
        text: "Copy Phone Number",
        onPress: () => copyPhoneNumberToClipboard(contact)
      });
    }

    Alert.alert(
      "Contact Actions",
      `What would you like to do with ${contact.name || 'this contact'}?`,
      actions,
      { cancelable: true }
    );
  };

  /**
   * handlePullToRefresh
   * Triggers when users pull down the list to fetch updated contacts.
   */
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    await fetchContacts(false);
  };

  // =======================================================
  // 6. SCREEN RENDER LAYOUTS
  // =======================================================

  // A. LOADING STATE: Shown while checking permissions or loading initial contacts
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Accessing Device Contacts...</Text>
      </SafeAreaView>
    );
  }

  // B. PERMISSION DENIED STATE: Prompts user to grant permission
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>Module 5</Text>
          <Text style={styles.headerTitle}>Contacts Manager</Text>
        </View>

        {/* Informative Request Box */}
        <View style={styles.centerContent}>
          <View style={styles.permissionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="contacts" size={44} color="#0a7ea4" />
            </View>
            <Text style={styles.cardTitle}>Contacts Access Required</Text>
            <Text style={styles.cardDescription}>
              To view, search, and copy contact details from your address book, we require permission to access device contacts.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <MaterialIcons name="security" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Grant Contacts Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // C. MAIN LAYOUT: Displays search bar, contacts list, pull-to-refresh, counter, copy logic
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0a7ea4" />
      
      {/* 1. Page Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Module 5</Text>
        <Text style={styles.headerTitle}>Contacts Manager</Text>
      </View>

      <View style={styles.mainContent}>
        {/* 2. Interactive Search Bar */}
        <View style={styles.searchBarWrapper}>
          <MaterialIcons name="search" size={22} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or number..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')} style={styles.clearButton}>
              <MaterialIcons name="cancel" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Contact Stats Counter Banner */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {filteredContacts.length === contactsList.length
              ? `Total Contacts: ${contactsList.length}`
              : `Found: ${filteredContacts.length} of ${contactsList.length} contacts`}
          </Text>
        </View>

        {/* 4. FlatList of Contacts with Pull-To-Refresh */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              colors={['#0a7ea4']}
              tintColor="#0a7ea4"
            />
          }
          renderItem={({ item }) => {
            const phoneNumber = getPhoneNumber(item);
            const initialText = getInitials(item.name);
            const avatarBg = getAvatarColor(item.name);

            return (
              <TouchableOpacity
                style={styles.contactCard}
                onPress={() => handleContactPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.contactInfoRow}>
                  {/* Avatar Layout: Shows Image if available, otherwise generates initials */}
                  {item.imageAvailable && item.image && item.image.uri ? (
                    <Image source={{ uri: item.image.uri }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatarInitials, { backgroundColor: avatarBg }]}>
                      <Text style={styles.avatarText}>{initialText}</Text>
                    </View>
                  )}

                  {/* Name and Number Labels */}
                  <View style={styles.detailsWrapper}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {item.name || 'Unnamed Contact'}
                    </Text>
                    {phoneNumber ? (
                      <Text style={styles.contactNumber} numberOfLines={1}>
                        {phoneNumber}
                      </Text>
                    ) : (
                      <View style={styles.noNumberBadge}>
                        <Text style={styles.noNumberText}>No Number</Text>
                      </View>
                    )}
                  </View>

                  {/* Action Layout: Copy button or Empty Spacer if no number */}
                  {phoneNumber ? (
                    <TouchableOpacity
                      style={styles.copyIconButton}
                      onPress={() => copyPhoneNumberToClipboard(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="content-copy" size={20} color="#0a7ea4" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.disabledCopyButton}>
                      <MaterialIcons name="content-copy" size={20} color="#cbd5e1" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          // Rendered when contacts match count is 0
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name={searchQuery ? "search-off" : "people-outline"}
                size={60}
                color="#cbd5e1"
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No Matches Found" : "No Contacts Available"}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery
                  ? "Check spelling, try typing numbers, or clear the search filter."
                  : "We couldn't detect any contact cards on your system. Pull down to try reloading."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

// =======================================================
// 7. COMPONENT STYLING SYSTEM
// =======================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Premium light-slate backdrop
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
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
  mainContent: {
    flex: 1,
    padding: 16,
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 4,
  },
  searchBarWrapper: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  counterContainer: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  avatarInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: '#64748b',
  },
  noNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  noNumberText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  copyIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledCopyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
