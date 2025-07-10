import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  margin = 8,
}) => {
  const { state } = useApp();
  const { theme } = state;

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding,
      margin,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  return <View style={[cardStyles.card, style]}>{children}</View>;
};