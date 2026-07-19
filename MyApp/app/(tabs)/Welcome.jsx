import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'

const Welcome = () => {

    const router=useRouter();
  // ==========================================
  // Mock Data: List of 10 Students
  // ==========================================
  const students = [
    {
      id: 1,
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      rollNo: "CSE001",
      gender: "Male"
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@example.com",
      rollNo: "CSE002",
      gender: "Female"
    },
    {
      id: 3,
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      rollNo: "CSE003",
      gender: "Male"
    },
    {
      id: 4,
      name: "Sneha Gupta",
      email: "sneha.gupta@example.com",
      rollNo: "CSE004",
      gender: "Female"
    },
    {
      id: 5,
      name: "Aditya Singh",
      email: "aditya.singh@example.com",
      rollNo: "CSE005",
      gender: "Male"
    },
    {
      id: 6,
      name: "Kavya Nair",
      email: "kavya.nair@example.com",
      rollNo: "CSE006",
      gender: "Female"
    },
    {
      id: 7,
      name: "Rahul Mehta",
      email: "rahul.mehta@example.com",
      rollNo: "CSE007",
      gender: "Male"
    },
    {
      id: 8,
      name: "Ananya Das",
      email: "ananya.das@example.com",
      rollNo: "CSE008",
      gender: "Female"
    },
    {
      id: 9,
      name: "Vikram Joshi",
      email: "vikram.joshi@example.com",
      rollNo: "CSE009",
      gender: "Male"
    },
    {
      id: 10,
      name: "Neha Kapoor",
      email: "neha.kapoor@example.com",
      rollNo: "CSE010",
      gender: "Female"
    }
  ];

  // ==========================================
  // Component State Management
  // ==========================================
  // selectedStudent: Tracks the currently active inspector profile (defaults to the first student)
  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  // surveyCount: Simulated count of surveys completed today
  const [surveyCount, setSurveyCount] = useState(3);
  // isModalVisible: Controls the visibility of the profile switcher modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ==========================================
  // Event Handlers & Helpers
  // ==========================================
  // handleQuickAction: Displays an alert representing functionality to be built in subsequent modules
  const handleQuickAction = (actionName, moduleNum) => {
    Alert.alert(
      "Quick Action Clicked",
      `You selected "${actionName}". This will navigate to Module ${moduleNum} in future implementations.`,
      [{ text: "OK" }]
    );
  };

  // Mock Recent Surveys data for the dashboard list
  const recentSurveys = [
    {
      id: 'SRV-9021',
      siteName: 'Metro Station Noida',
      clientName: 'DMRC Ltd',
      date: 'Today, 10:30 AM',
      priority: 'High',
    },
    {
      id: 'SRV-8943',
      siteName: 'Sector 62 Office Tower',
      clientName: 'DLF Group',
      date: 'Yesterday, 4:15 PM',
      priority: 'Medium',
    },
    {
      id: 'SRV-8812',
      siteName: 'Greenwood Housing Society',
      clientName: 'RWA Noida',
      date: '15 Jul 2026, 11:00 AM',
      priority: 'Low',
    },
  ];

  // getPriorityStyle: Contextually determines color badges for survey priority status
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'Medium':
        return { bg: '#fef3c7', text: '#f59e0b' };
      case 'Low':
      default:
        return { bg: '#dcfce7', text: '#22c55e' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a7ea4" />
      
      {/* ==========================================
          1. Custom App Header Component
          Displays app title & avatar matching active profile. Tapping avatar opens profile switcher.
          ========================================== */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Field Survey App</Text>
          <Text style={styles.headerTitle}>Smart Survey Hub</Text>
        </View>
        <TouchableOpacity 
          style={styles.avatarButton} 
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>
            {selectedStudent.name.charAt(0)}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ==========================================
            2. Welcome / Greeting Section Component
            Displays personalized greeting for the selected inspector.
            ========================================== */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Hello, {selectedStudent.name}! 👋</Text>
          <Text style={styles.welcomeSubtext}>{"Welcome back. Ready for today's inspections?"}</Text>
        </View>

        {/* ==========================================
            3. Student Details Card Component
            Renders details of active student. Features a profile switcher activation trigger.
            ========================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={22} color="#0a7ea4" />
            <Text style={styles.cardTitle}>Active Inspector Profile</Text>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Name:</Text>
              <Text style={styles.profileValue}>{selectedStudent.name}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Roll Number:</Text>
              <Text style={styles.profileValue}>{selectedStudent.rollNo}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email:</Text>
              <Text style={styles.profileValue}>{selectedStudent.email}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Gender:</Text>
              <Text style={styles.profileValue}>{selectedStudent.gender}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsModalVisible(true)}
          >
            <MaterialIcons name="swap-horiz" size={18} color="#fff" />
            <Text style={styles.switchButtonText}>Change Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ==========================================
            4. Today's Survey Count Card Component
            Interactive progress tracker with "+" and "-" button triggers.
            ========================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="assessment" size={22} color="#0a7ea4" />
            <Text style={styles.cardTitle}>{"Today's Progress"}</Text>
          </View>
          
          <View style={styles.counterContainer}>
            <View style={styles.counterTextSection}>
              <Text style={styles.counterSubText}>Surveys Completed</Text>
              <Text style={styles.counterSubTextDetail}>Click +/- to simulate count</Text>
            </View>
            
            <View style={styles.counterControl}>
              <TouchableOpacity 
                style={[styles.counterBtn, surveyCount === 0 && styles.counterBtnDisabled]}
                onPress={() => setSurveyCount(prev => Math.max(0, prev - 1))}
                disabled={surveyCount === 0}
              >
                <MaterialIcons name="remove" size={20} color={surveyCount === 0 ? "#cbd5e1" : "#0a7ea4"} />
              </TouchableOpacity>
              
              <Text style={styles.counterValue}>{surveyCount}</Text>
              
              <TouchableOpacity 
                style={styles.counterBtn}
                onPress={() => setSurveyCount(prev => prev + 1)}
              >
                <MaterialIcons name="add" size={20} color="#0a7ea4" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ==========================================
            5. Quick Action Cards Component
            Grid containing links representing different application modules.
            ========================================== */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.gridContainer}>
          {/* Action 1: Create Survey (Module 2) */}
          <TouchableOpacity 
            style={styles.gridCard}
            // onPress={() => handleQuickAction("Create Survey", "2")}
            onPress={() => router.push('/Survey')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
              <MaterialIcons name="add-chart" size={24} color="#0284c7" />
            </View>
            <Text style={styles.gridText}>New Survey</Text>
          </TouchableOpacity>

          {/* Action 2: Camera Capture (Module 3) */}
          <TouchableOpacity 
            style={styles.gridCard}
            onPress={() => handleQuickAction("Camera Capture", "3")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fef2f2' }]}>
              <MaterialIcons name="photo-camera" size={24} color="#dc2626" />
            </View>
            <Text style={styles.gridText}>Camera</Text>
          </TouchableOpacity>

          {/* Action 3: Get Location (Module 4) */}
          <TouchableOpacity 
            style={styles.gridCard}
            onPress={() => handleQuickAction("Get Location", "4")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#f0fdf4' }]}>
              <MaterialIcons name="my-location" size={24} color="#16a34a" />
            </View>
            <Text style={styles.gridText}>Location</Text>
          </TouchableOpacity>

          {/* Action 4: View Contacts (Module 5) */}
          <TouchableOpacity 
            style={styles.gridCard}
            onPress={() => handleQuickAction("View Contacts", "5")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#faf5ff' }]}>
              <MaterialIcons name="contacts" size={24} color="#9333ea" />
            </View>
            <Text style={styles.gridText}>Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* ==========================================
            6. Recent Surveys Summary Component
            Renders list of recent survey operations with colored priority indicators.
            ========================================== */}
        <Text style={styles.sectionHeading}>Recent Surveys Summary</Text>
        {recentSurveys.map((item) => {
          const colors = getPriorityStyle(item.priority);
          return (
            <View key={item.id} style={styles.surveyCard}>
              <View style={styles.surveyCardMain}>
                <View style={styles.surveyIconContainer}>
                  <MaterialIcons name="assignment" size={22} color="#64748b" />
                </View>
                <View style={styles.surveyTextContainer}>
                  <Text style={styles.surveySite} numberOfLines={1}>{item.siteName}</Text>
                  <Text style={styles.surveyClient}>Client: {item.clientName}</Text>
                  <Text style={styles.surveyDate}>{item.date}</Text>
                </View>
              </View>
              
              <View style={styles.surveyMeta}>
                <Text style={styles.surveyId}>{item.id}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.priorityBadgeText, { color: colors.text }]}>{item.priority}</Text>
                </View>
              </View>
            </View>
          );
        })}
        
        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* ==========================================
          7. Student Selection Modal Component
          Renders a slide-up dialog with full list of 10 students for switching profiles.
          ========================================== */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Active Profile</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.studentRow,
                    selectedStudent.id === item.id && styles.selectedStudentRow
                  ]}
                  onPress={() => {
                    setSelectedStudent(item);
                    setIsModalVisible(false);
                  }}
                >
                  <View style={styles.studentInfoLeft}>
                    <View style={[
                      styles.modalAvatar,
                      { backgroundColor: selectedStudent.id === item.id ? '#0a7ea4' : '#e2e8f0' }
                    ]}>
                      <Text style={[
                        styles.modalAvatarText,
                        { color: selectedStudent.id === item.id ? '#fff' : '#475569' }
                      ]}>
                        {item.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.studentDetailsCol}>
                      <Text style={styles.modalStudentName}>{item.name}</Text>
                      <Text style={styles.modalStudentSub}>{item.rollNo} • {item.gender}</Text>
                    </View>
                  </View>
                  {selectedStudent.id === item.id && (
                    <MaterialIcons name="check-circle" size={22} color="#0a7ea4" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Welcome;

// ==========================================
// Stylesheet Config
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  avatarText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  welcomeSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginLeft: 8,
  },
  profileDetails: {
    gap: 8,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  profileValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  switchButton: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  switchButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterTextSection: {
    flex: 1,
  },
  counterSubText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  counterSubTextDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 20,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  gridCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  surveyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  surveyCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  surveyIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  surveyTextContainer: {
    flex: 1,
  },
  surveySite: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  surveyClient: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  surveyDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  surveyMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 42,
  },
  surveyId: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerSpacing: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  selectedStudentRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  studentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  studentDetailsCol: {
    flex: 1,
  },
  modalStudentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  modalStudentSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
});