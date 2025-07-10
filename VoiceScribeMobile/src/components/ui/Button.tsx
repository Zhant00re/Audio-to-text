import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { state } = useApp();
  const { theme } = state;

  const buttonStyles = StyleSheet.create({
    button: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...(size === 'small' && { paddingHorizontal: 12, paddingVertical: 6 }),
      ...(size === 'medium' && { paddingHorizontal: 16, paddingVertical: 10 }),
      ...(size === 'large' && { paddingHorizontal: 20, paddingVertical: 14 }),
      ...(variant === 'primary' && {
        backgroundColor: theme.colors.primary,
      }),
      ...(variant === 'secondary' && {
        backgroundColor: theme.colors.secondary,
      }),
      ...(variant === 'outline' && {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
      }),
      ...(variant === 'danger' && {
        backgroundColor: theme.colors.error,
      }),
      ...(disabled && {
        backgroundColor: theme.colors.border,
        opacity: 0.6,
      }),
    },
    text: {
      fontWeight: '600',
      ...(size === 'small' && { fontSize: 14 }),
      ...(size === 'medium' && { fontSize: 16 }),
      ...(size === 'large' && { fontSize: 18 }),
      ...(variant === 'primary' && {
        color: '#FFFFFF',
      }),
      ...(variant === 'secondary' && {
        color: '#FFFFFF',
      }),
      ...(variant === 'outline' && {
        color: theme.colors.text,
      }),
      ...(variant === 'danger' && {
        color: '#FFFFFF',
      }),
      ...(disabled && {
        color: theme.colors.textSecondary,
      }),
    },
  });

  return (
    <TouchableOpacity
      style={[buttonStyles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.text : '#FFFFFF'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};