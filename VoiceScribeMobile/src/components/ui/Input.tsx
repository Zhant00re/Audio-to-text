import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  const { state } = useApp();
  const { theme } = state;

  const inputStyles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    error: {
      fontSize: 14,
      color: theme.colors.error,
      marginTop: 4,
    },
  });

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && <Text style={[inputStyles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[inputStyles.input, inputStyle]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {error && <Text style={[inputStyles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};