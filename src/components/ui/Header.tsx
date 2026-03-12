import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  showLogo?: boolean;
  title?: string;
  rightContent?: React.ReactNode;
  showGreeting?: boolean;
}

export function Header({
  showLogo = true,
  title,
  rightContent,
  showGreeting,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showLogo && (
            <Image
              source={require('../../../assets/images/kg-logo-full-dark.png')}
              style={styles.logo}
              contentFit="contain"
            />
          )}
          {showGreeting ? (
            <Text style={styles.greeting}>Merhaba! 👋</Text>
          ) : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        {rightContent ? <View>{rightContent}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
  },
  logo: {
    height: 28,
    width: 140,
  },
  greeting: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#455A64',
    marginTop: 2,
  },
});
