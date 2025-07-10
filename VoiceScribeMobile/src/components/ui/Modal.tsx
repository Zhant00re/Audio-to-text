import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
  fullScreen = false,
}) => {
  const { state } = useApp();
  const { theme } = state;

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: fullScreen ? 0 : 16,
      maxHeight: fullScreen ? '100%' : '80%',
      width: fullScreen ? '100%' : '90%',
      maxWidth: fullScreen ? '100%' : 400,
    },
    content: {
      flex: 1,
      padding: 20,
    },
  });

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={modalStyles.container}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
};