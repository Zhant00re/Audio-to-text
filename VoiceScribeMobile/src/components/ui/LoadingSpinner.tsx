import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'large',
  color,
}) => {
  const { state } = useApp();
  const { theme } = state;

  const spinnerStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    text: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={spinnerStyles.container}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
      />
      {text && <Text style={spinnerStyles.text}>{text}</Text>}
    </View>
  );
};