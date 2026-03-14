import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from './Avatar';
import { COLORS } from '../../lib/constants';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.8;

const SOCIAL_LINKS: { name: string; icon: React.ComponentProps<typeof Ionicons>['name']; url: string; color: string }[] = [
  { name: 'Instagram', icon: 'logo-instagram', url: 'https://www.instagram.com/kidsgourmet/', color: '#E1306C' },
  { name: 'Facebook', icon: 'logo-facebook', url: 'https://www.facebook.com/kidsandgourmet', color: '#1877F2' },
  { name: 'Pinterest', icon: 'logo-pinterest', url: 'https://tr.pinterest.com/KidsandGourmet', color: '#E60023' },
  { name: 'YouTube', icon: 'logo-youtube', url: 'https://www.youtube.com/channel/UCkXtLdtEfhl8Do1pPW4fgsQ', color: '#FF0000' },
  { name: 'TikTok', icon: 'logo-tiktok', url: 'https://tiktok.com/@kidsgourmet', color: '#000000' },
  { name: 'Twitter', icon: 'logo-twitter', url: 'https://x.com/kidsandgourmet', color: '#1DA1F2' },
];

const CORPORATE_LINKS = [
  { label: 'Hakkımızda', route: '/about' },
  { label: 'İletişim', route: '/contact' },
  { label: 'Kullanım Koşulları', route: '/terms' },
  { label: 'Gizlilik Politikası', route: '/privacy' },
  { label: 'KVKK', route: '/kvkk' },
];

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
      { label: 'Keşfet', icon: 'compass-outline', route: '/(tabs)/discover' },
      { label: 'Akıllı Asistan', icon: 'sparkles-outline', route: '/(tabs)/assistant' },
      { label: 'Beslenme Rehberi', icon: 'book-outline', route: '/(tabs)/guide' },
      { label: 'Favorilerim', icon: 'heart-outline', route: '/(tabs)/favorites' },
      { label: 'Haftalık Plan', icon: 'calendar-outline', route: '/(tabs)/meal-plan' },
    ],
  },
  {
    title: 'Keşfet',
    items: [
      { label: 'Blog & Haberler', icon: 'newspaper-outline', route: '/blog' },
      { label: 'Arama', icon: 'search-outline', route: '/search' },
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

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-DRAWER_WIDTH);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.45,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigate = (route: string) => {
    handleClose();
    setTimeout(() => {
      router.push(route as never);
    }, 260);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Drawer panel — slides in from the left */}
        <Animated.View
          style={[
            styles.drawer,
            {
              paddingTop: insets.top,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Drawer header */}
          <View style={styles.drawerHeader}>
            <Image
              source={require('../../../assets/images/kg-logo-full-dark.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.7}>
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

          {/* Menu sections + footer */}
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

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />

              {/* Social media row */}
              <Text style={styles.footerLabel}>Bizi Takip Edin</Text>
              <View style={styles.socialRow}>
                {SOCIAL_LINKS.map((link) => (
                  <TouchableOpacity
                    key={link.name}
                    onPress={() => Linking.openURL(link.url)}
                    activeOpacity={0.7}
                    style={styles.socialIcon}
                  >
                    <Ionicons name={link.icon} size={22} color={link.color} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ecosystem links */}
              <View style={styles.ecosystemRow}>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://rejimde.com')}
                  activeOpacity={0.7}
                  style={styles.ecosystemBtn}
                >
                  <Text style={[styles.ecosystemLink, { color: '#4CAF50' }]}>Rejimde.com</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://tariften.com')}
                  activeOpacity={0.7}
                  style={styles.ecosystemBtn}
                >
                  <Text style={[styles.ecosystemLink, { color: '#7E57C2' }]}>Tariften.com</Text>
                </TouchableOpacity>
              </View>

              {/* Corporate links */}
              <View style={styles.corporateLinks}>
                {CORPORATE_LINKS.map((link) => (
                  <TouchableOpacity
                    key={link.label}
                    activeOpacity={0.7}
                    onPress={() => handleNavigate(link.route)}
                  >
                    <Text style={styles.corporateLink}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Copyright */}
              <Text style={styles.copyright}>
                © 2026 KidsGourmet bir Hip Medya markasıdır.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 20,
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
  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    marginTop: 8,
    paddingBottom: 24,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[400],
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingLeft: 4,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingLeft: 4,
    marginBottom: 16,
  },
  socialIcon: {
    padding: 4,
  },
  ecosystemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ecosystemBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  ecosystemLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  corporateLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 14,
    paddingLeft: 2,
  },
  corporateLink: {
    fontSize: 11,
    color: COLORS.gray[400],
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  copyright: {
    fontSize: 11,
    color: COLORS.gray[300],
    textAlign: 'center',
    marginTop: 4,
  },
});
