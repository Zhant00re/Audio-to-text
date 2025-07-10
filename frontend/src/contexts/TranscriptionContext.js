import React, { createContext, useContext, useState } from "react";

const TranscriptionContext = createContext();

export const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error("useTranscription must be used within a TranscriptionProvider");
  }
  return context;
};

export const TranscriptionProvider = ({ children }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addTranscription = (transcription) => {
    const newTranscription = {
      id: Date.now().toString(),
      ...transcription,
      createdAt: new Date().toISOString(),
    };
    setTranscriptions(prev => [newTranscription, ...prev]);
    return newTranscription;
  };

  const deleteTranscription = (id) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id));
  };

  const updateTranscription = (id, updates) => {
    setTranscriptions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  return (
    <TranscriptionContext.Provider value={{
      transcriptions,
      setTranscriptions,
      isProcessing,
      setIsProcessing,
      addTranscription,
      deleteTranscription,
      updateTranscription
    }}>
      {children}
    </TranscriptionContext.Provider>
  );
};