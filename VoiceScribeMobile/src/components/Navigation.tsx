import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../contexts/AppContext';

interface NavigationProps {
  activeScreen: 'home' | 'transcriptions' | 'settings';
  onNavigate: (screen: 'home' | 'transcriptions' | 'settings') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeScreen, onNavigate }) => {
  const { state } = useApp();
  const { theme } = state;

  const navigationStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    safeArea: {
      backgroundColor: theme.colors.surface,
    },
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    navIcon: {
      width: 24,
      height: 24,
      marginBottom: 4,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
    },
    navIconActive: {
      backgroundColor: theme.colors.primary,
    },
    navIconInactive: {
      backgroundColor: theme.colors.textSecondary,
    },
    navLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    navLabelActive: {
      color: theme.colors.primary,
    },
    navLabelInactive: {
      color: theme.colors.textSecondary,
    },
  });

  const navItems = [
    { key: 'home', label: 'Record', icon: '🎙️' },
    { key: 'transcriptions', label: 'History', icon: '📝' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View style={navigationStyles.container}>
      <SafeAreaView style={navigationStyles.safeArea}>
        <View style={navigationStyles.navBar}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={navigationStyles.navItem}
              onPress={() => onNavigate(item.key as any)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  navigationStyles.navIcon,
                  activeScreen === item.key
                    ? navigationStyles.navIconActive
                    : navigationStyles.navIconInactive,
                ]}
              />
              <Text
                style={[
                  navigationStyles.navLabel,
                  activeScreen === item.key
                    ? navigationStyles.navLabelActive
                    : navigationStyles.navLabelInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
};