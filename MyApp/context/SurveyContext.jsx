import React, { createContext, useState, useContext } from 'react';

// Create a context to share survey progress across tabs
const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  // Global survey state initialized with clean empty values
  const [surveyData, setSurveyData] = useState({
    siteName: '',
    clientName: '',
    priority: 'Medium',
    date: new Date(),
    description: '',
    photo: null,        // Stores { uri, timestamp } from Camera screen
    contact: null,      // Stores { name, phoneNumber } from Contacts screen
    location: null,     // Stores { coords: { latitude, longitude, accuracy } } from Location screen
  });

  // Helper function to update specific fields in the survey state
  const updateSurveyData = (fields) => {
    setSurveyData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  // Helper function to reset all survey data after a successful submission
  const resetSurveyData = () => {
    setSurveyData({
      siteName: '',
      clientName: '',
      priority: 'Medium',
      date: new Date(),
      description: '',
      photo: null,
      contact: null,
      location: null,
    });
  };

  return (
    <SurveyContext.Provider value={{ surveyData, updateSurveyData, resetSurveyData }}>
      {children}
    </SurveyContext.Provider>
  );
};

// Custom hook to consume the survey context inside functional components
export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};
