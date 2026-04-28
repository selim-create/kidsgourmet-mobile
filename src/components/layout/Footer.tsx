import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

// ─── Navigation Links ─────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  route?: string;
  url?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Ana Sayfa', route: '/(tabs)' },
  { label: 'Tarifler', route: '/(tabs)/recipes' },
  { label: 'Rehber', route: '/blog' },
  { label: 'Araçlar', route: '/(tabs)/assistant' },
  { label: 'Yemek Planı', route: '/(tabs)/meal-plan' },
];

// ─── Social Links ─────────────────────────────────────────────────────────────

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

interface SocialLink {
  name: string;
  icon: FontAwesomeIconName;
  url: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/kidsgourmet' },
  { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/kidsgourmet' },
  { name: 'YouTube', icon: 'youtube-play', url: 'https://www.youtube.com/@kidsgourmet' },
  { name: 'Twitter/X', icon: 'twitter', url: 'https://twitter.com/kidsgourmet' },
];

// ─── Footer Component ─────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavPress = (link: NavLink) => {
    if (link.url) {
      Linking.openURL(link.url).catch(() => {/* ignore */});
    } else if (link.route) {
      router.push(link.route as Parameters<typeof router.push>[0]);
    }
  };

  const handleSocialPress = (url: string) => {
    Linking.openURL(url).catch(() => {/* ignore */});
  };

  return (
    <View style={styles.container}>
      {/* ── Logo & About ──────────────────────────────────────────── */}
      <View style={styles.logoSection}>
        <Image
          source={require('../../../assets/images/kg-logo-full-white.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.aboutText}>
          Bebeğinizden büyüyen çocuğunuza kadar her yaşa özel beslenme rehberi, uzman onaylı tarifler ve sağlıklı büyüme takibi.
        </Text>
      </View>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <View style={styles.navSection}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={() => handleNavPress(link)}
              activeOpacity={0.75}
              style={styles.navLinkRow}
            >
              <Text style={styles.navLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Social Icons ──────────────────────────────────────────── */}
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Bizi Takip Edin</Text>
        <View style={styles.socialRow}>
          {SOCIAL_LINKS.map((social) => (
            <TouchableOpacity
              key={social.name}
              onPress={() => handleSocialPress(social.url)}
              activeOpacity={0.75}
              style={styles.socialBtn}
              accessibilityLabel={social.name}
            >
              <FontAwesome name={social.icon} size={20} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Copyright ─────────────────────────────────────────────── */}
      <Text style={styles.copyright}>
        © {currentYear} KidsGourmet. Tüm hakları saklıdır.
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoSection: {
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 36,
    marginBottom: 12,
  },
  aboutText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
  },
  navSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navLinks: {
    gap: 8,
  },
  navLinkRow: {
    paddingVertical: 4,
  },
  navLinkText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  socialSection: {
    marginBottom: 24,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  copyright: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});
