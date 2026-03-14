import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';
import { DrawerMenu } from './DrawerMenu';
import { COLORS } from '../../lib/constants';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleAvatarPress = () => {
    if (isAuthenticated) {
      router.push('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.content}>
          {/* Left: hamburger */}
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={26} color={COLORS.dark} />
          </TouchableOpacity>

          {/* Center: logo */}
          <Image
            source={require('../../../assets/images/kg-logo-full-dark.png')}
            style={styles.logo}
            contentFit="contain"
          />

          {/* Right: search + favorites + avatar */}
          <View style={styles.rightGroup}>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={22} color={COLORS.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/favorites')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={22} color={COLORS.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7} style={styles.avatarButton}>
              {isAuthenticated && user ? (
                <Avatar name={user.name} size={30} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={18} color={COLORS.gray[400]} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
  },
  logo: {
    flex: 1,
    height: 26,
    marginHorizontal: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginLeft: 4,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
