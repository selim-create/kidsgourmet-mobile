import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';
import { COLORS } from '../../lib/constants';

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Ana Menü',
    items: [
      { label: 'Ana Sayfa', icon: 'home-outline', route: '/(tabs)' },
      { label: 'Tarifler', icon: 'restaurant-outline', route: '/(tabs)/recipes' },
      { label: 'Favorilerim', icon: 'heart-outline', route: '/(tabs)/favorites' },
      { label: 'Haftalık Plan', icon: 'calendar-outline', route: '/(tabs)/meal-plan' },
    ],
  },
  {
    title: 'Keşfet',
    items: [
      { label: 'Blog & Keşfet', icon: 'newspaper-outline', route: '/blog' },
      { label: 'Arama', icon: 'search-outline', route: '/search' },
      { label: 'Beslenme Rehberi', icon: 'nutrition-outline', route: '/ingredient' },
    ],
  },
  {
    title: 'Araçlar',
    items: [
      { label: 'Güvenlik Kontrolü', icon: 'shield-checkmark-outline', route: '/safety-check' },
      { label: 'BLW Hazırlık Testi', icon: 'checkmark-circle-outline', route: '/blw-test' },
      { label: 'Büyüme Takibi', icon: 'trending-up-outline', route: '/growth' },
      { label: 'Ek Gıda Rehberi', icon: 'leaf-outline', route: '/food-guide' },
      { label: 'Aşı Takvimi', icon: 'medical-outline', route: '/vaccines' },
    ],
  },
  {
    title: 'Hesap',
    items: [
      { label: 'Profilim', icon: 'person-outline', route: '/(tabs)/profile' },
      { label: 'Bildirimler', icon: 'notifications-outline', route: '/(tabs)/profile' }, // TODO: dedicated notifications page
      { label: 'Ayarlar', icon: 'settings-outline', route: '/(tabs)/profile' }, // TODO: dedicated settings page
    ],
  },
];

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as never);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer panel */}
        <View
          style={[
            styles.drawer,
            { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Drawer header */}
          <View style={styles.drawerHeader}>
            <Image
              source={require('../../../assets/images/kg-logo-full-dark.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          {/* User info (authenticated only) */}
          {isAuthenticated && user && (
            <TouchableOpacity
              style={styles.userCard}
              activeOpacity={0.8}
              onPress={() => handleNavigate('/(tabs)/profile')}
            >
              <Avatar name={user.name} size={44} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.gray[300]} />
            </TouchableOpacity>
          )}

          {/* Menu sections */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
          >
            {MENU_SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray[300]} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    width: 300,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    width: 130,
    height: 26,
  },
  closeButton: {
    padding: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 1,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[400],
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
});
